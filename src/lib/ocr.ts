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
 */
interface TextSegment {
  text: string;
  page?: number;
}

/**
 * Initialize OpenAI client with API key from environment
 */
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
  const [result] = await visionClient.textDetection(image);
  
  if (!result.textAnnotations || result.textAnnotations.length === 0) {
    return [];
  }
  
  // Skip first annotation which contains all text, map remaining individual text blocks
  return result.textAnnotations.slice(1).map(annotation => ({
    text: annotation.description || '',
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
  
  let segments: TextSegment[];
  
  if (file.type === 'application/pdf') {
    segments = await extractTextFromPDF(fileBuffer);
  } else if (file.type.startsWith('image/')) {
    segments = await extractTextFromImage(fileBuffer);
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  // Group segments into logical verses/paragraphs
  const groupedSegments = segments.reduce((acc: TextSegment[], segment) => {
    const lastSegment = acc[acc.length - 1];
    const currentText = segment.text.trim();
    
    // If text ends with common verse markers, keep as separate segment
    if (currentText.match(/[।॥\d+॥]$/)) {
      acc.push(segment);
    } 
    // If previous segment exists and doesn't end with verse markers, combine
    else if (lastSegment && !lastSegment.text.match(/[।॥\d+॥]$/)) {
      lastSegment.text += ' ' + currentText;
    } 
    // Otherwise start new segment
    else {
      acc.push(segment);
    }
    
    return acc;
  }, []);

  return groupedSegments;
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

/**
 * Translates text using OpenAI's GPT model with specific translation instructions
 * 
 * @param text - Text to translate
 * @param targetLanguage - Target language to translate into
 * @returns Promise resolving to translated text
 */
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

/**
 * Refines a Google-translated text using OpenAI's GPT model for more natural results
 * 
 * @param googleTranslation - Initial translation from Google Translate
 * @param originalText - Original source text
 * @param targetLanguage - Target language for refinement
 * @returns Promise resolving to refined translation
 */
export async function refineTranslationWithOpenAI(googleTranslation: string, originalText: string, targetLanguage: string): Promise<string> {
  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Improve this translation into natural ${targetLanguage}.
        - Keep the original document's style and format
        - Preserve proper nouns and technical terms
        - Focus on clarity and readability
        - Do not add explanations or commentary`
      },
      {
        role: 'user',
        content: googleTranslation
      }
    ],
    temperature: 0.1,
  });

  return response.choices[0]?.message.content?.trim() || googleTranslation;
}

interface File {
  arrayBuffer(): Promise<ArrayBuffer>;
  type: string;
}

/**
 * Processes and translates a document file using a combination of Google Translate and OpenAI
 * 
 * @param file - File object to process
 * @param targetLang - Target language code for translation
 * @param useGoogleFirst - Whether to use Google Translate before OpenAI refinement (default: true)
 * @returns Promise resolving to object containing original segments and translated text
 */
export async function processAndTranslateDocument(
  file: File, 
  targetLang: string, 
  useGoogleFirst = true
): Promise<{ original: TextSegment[], translated: string }> {
  const segments = await processDocument(file);
  
  // Join segments preserving verse structure
  const originalText = segments
    .map(s => s.text.trim())
    .filter(text => text.length > 0)
    .join('\n\n'); // Double newline for verse separation

  let translatedText: string;

  if (useGoogleFirst) {
    const googleTranslation = await translateTextWithGoogle(originalText, targetLang);
    translatedText = await refineTranslationWithOpenAI(googleTranslation, originalText, targetLang);
  } else {
    translatedText = await translateTextWithOpenAI(originalText, targetLang);
  }
  
  return {
    original: segments,
    translated: translatedText
  };
}
