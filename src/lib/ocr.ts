import vision from '@google-cloud/vision';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import { createCanvas } from 'canvas';
import { v2 } from '@google-cloud/translate';
const { Translate } = v2;

/**
 * Parse Google Cloud credentials from environment variable
 * Falls back to empty object if not defined
 */
const rawCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}';
const credentials = JSON.parse(rawCredentials);

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
export async function translateText(text: string, target_language: string): Promise<string> {
  const translate = new Translate({ credentials, projectId: credentials.project_id });
  const [translation] = await translate.translate(text, target_language);
  return translation;
}

/**
 * Processes a document and translates extracted text
 * 
 * Combines document processing and translation into a single operation.
 * 
 * @param file - File to process
 * @param targetLang - Target language code for translation
 * @returns Promise resolving to object containing original and translated text
 */
export async function processAndTranslateDocument(file: File, targetLang: string): Promise<{ original: TextSegment[], translated: string }> {
  const segments = await processDocument(file);
  const originalText = segments.map(s => s.text).join(' ');
  const translatedText = await translateText(originalText, targetLang);
  
  return {
    original: segments,
    translated: translatedText
  };
}