import vision from '@google-cloud/vision';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import { createCanvas } from 'canvas';
import { v2 } from '@google-cloud/translate';
import OpenAI from 'openai';

const { Translate } = v2;

/**
 * Parse Google Cloud credentials from environment variable
 * Falls back to empty object if not defined
 */
const rawCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}';
const credentials = JSON.parse(rawCredentials);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Initialize Google Cloud Vision client with credentials and project ID
 */
const visionClient = new vision.ImageAnnotatorClient({
  credentials: credentials,
  projectId: credentials.project_id
});

/**
 * Initialize PDF.js worker for server-side PDF processing
 */
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js');
if (typeof window === 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Interface representing a segment of extracted text
 * @property text - The extracted text content
 * @property page - Optional page number for PDF documents
 * @property id - Unique ID for referencing
 */
interface TextSegment {
  text: string;
  id: string;
  page?: number;
  boundingBox?: {
    x: number;
    y: number;
  }[];
}

// Initialize OpenAI client
const openaiClient = new OpenAI({
  apiKey: OPENAI_API_KEY
});

/**
 * Extracts text from a PDF buffer using PDF.js and OCR
 * 
 * Processes each page of the PDF by:
 * 1. Rendering to canvas
 * 2. Converting to image
 * 3. Performing OCR
 * 
 * @param pdfBuffer - Buffer containing PDF data
 * @returns Promise resolving to array of text segments with page numbers
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<TextSegment[]> {
  const segments: TextSegment[] = [];
  
  // Convert Buffer to Uint8Array for PDF.js
  const uint8Array = new Uint8Array(pdfBuffer);
  const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;
  
  // Process each page sequentially
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const canvas = createCanvas(page.view[2], page.view[3]);
    const context = canvas.getContext('2d');
    
    // Create viewport with increased scale for better OCR results
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render PDF page to canvas
    await page.render({ 
      canvasContext: context as any,
      viewport 
    }).promise;
    
    // Convert canvas to image and extract text
    const imageBuffer = canvas.toBuffer('image/png');
    const pageSegments = await extractTextFromImage(imageBuffer);
    segments.push(...pageSegments.map(segment => ({ ...segment, page: i })));
  }
  
  return segments;
}

/**
 * Extracts text from an image buffer using Google Cloud Vision OCR
 * 
 * @param image - Buffer containing image data
 * @returns Promise resolving to array of text segments
 */
export async function extractTextFromImage(image: Buffer): Promise<TextSegment[]> {
  const [result] = await visionClient.textDetection({
    image: { content: image },
    imageContext: {
      languageHints: ['sa']
    }
  });
  
  if (!result.textAnnotations || result.textAnnotations.length === 0) {
    return [];
  }
  
  // Get text blocks with their positions
  return result.textAnnotations.slice(1).map((annotation, index) => ({
    text: annotation.description || '',
    id: `segment-${index}`,
    boundingBox: annotation.boundingPoly?.vertices?.map(vertex => ({
      x: vertex.x || 0,
      y: vertex.y || 0
    })) || []
  }));
}

/**
 * Interface for file-like objects that can be processed
 */
interface File {
  arrayBuffer(): Promise<ArrayBuffer>;
  type: string;
}

/**
 * Processes a document file (PDF or image) to extract text
 * 
 * @param file - File object to process
 * @returns Promise resolving to array of extracted text segments
 * @throws Error if file type is not supported
 */
export async function processDocument(file: File): Promise<TextSegment[]> {
  const buffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(buffer);
  
  if (file.type === 'application/pdf') {
    return await extractTextFromPDF(fileBuffer);
  } else if (file.type.startsWith('image/')) {
    return await extractTextFromImage(fileBuffer);
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
}

/**
 * Translates text to target language using Google Cloud Translate
 * 
 * @param text - Text to translate
 * @param target_language - Target language code
 * @returns Promise resolving to translated text
 */
export async function translateTextWithGoogle(text: string, targetLanguage: string): Promise<string> {
  const translate = new Translate({ credentials, projectId: credentials.project_id });
  const [translation] = await translate.translate(text, targetLanguage);
  return translation;
}

export async function translateTextWithOpenAI(text: string, targetLanguage: string): Promise<string> {
  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Translate this text into clear ${targetLanguage}. 
        - Preserve the original document's formatting and structure
        - Keep proper nouns and technical terms in their original form
        - Maintain the original text's style (formal/informal/technical/literary)
        - Preserve ALL line breaks from the original text
        - Maintain paragraph structure and spacing
        - Do not add explanations or commentary`
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.1,
  });
  
  return response.choices[0]?.message.content?.trim() || '';
}

export async function refineTranslationWithOpenAI(googleTranslation: string, originalText: string, targetLanguage: string): Promise<string> {
  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Improve this translation into natural ${targetLanguage}.
        - Use the original text for context and structure
        - Maintain coherent sentences and paragraphs
        - Keep proper nouns and technical terms in their original form
        - Ensure logical flow between segments
        - Preserve line breaks only where they make semantic sense
        - Do not add commentary or explanations about the text structure`
      },
      {
        role: 'user',
        content: `Original text:
${originalText}

Google's translation:
${googleTranslation}

Please provide an improved, coherent translation that maintains the original's meaning and flow. Do not add any commentary or explanations about the text or its structure.`
      }
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message.content?.trim() || googleTranslation;
}

interface File {
  arrayBuffer(): Promise<ArrayBuffer>;
  type: string;
}

export async function processAndTranslateDocument(
  file: File, 
  targetLang: string, 
  useGoogleFirst = true
): Promise<{ original: TextSegment[], translated: string }> {
  const segments = await processDocument(file);
  
  // Join segments preserving natural text blocks
  const chunkedText = segments
    .reduce((chunks: string[], segment, index, array) => {
      const currentChunk = chunks[chunks.length - 1];
      const newText = segment.text.trim();
      
      // Start new chunk if size limit reached
      if (!currentChunk || (currentChunk.length + newText.length) > 1500) {
        chunks.push(newText);
      } else {
        // Join with space or newline based on position
        const currentY = segment.boundingBox?.[0]?.y || 0;
        const nextY = array[index + 1]?.boundingBox?.[0]?.y || 0;
        const separator = Math.abs(nextY - currentY) > 10 ? '\n' : ' '; 
        // CHANGE THIS. EXPERIMENT WITH SEPARATOR. CAN BE DIFFERNET FOR EACH DOCUMENT...
        chunks[chunks.length - 1] = currentChunk + separator + newText;
      }
      return chunks;
    }, []);

  // Clean up translation artifacts
  const cleanTranslation = (text: string): string => {
    return text
      .replace(/it appears|without additional context|there is no content/gi, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/which is simply|possibly indicating/gi, '')
      .trim();
  };

  // Translate each chunk
  let translatedChunks: string[] = [];
  
  for (const chunk of chunkedText) {
    if (useGoogleFirst) {
      const googleTranslation = await translateTextWithGoogle(chunk, targetLang);
      const refinedTranslation = await refineTranslationWithOpenAI(
        googleTranslation, 
        chunk,
        targetLang
      );
      translatedChunks.push(cleanTranslation(refinedTranslation));
    } else {
      const translation = await translateTextWithOpenAI(chunk, targetLang);
      translatedChunks.push(cleanTranslation(translation));
    }
  }

  return {
    original: segments,
    translated: translatedChunks.join('\n')
  };
}
