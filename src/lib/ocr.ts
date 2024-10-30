import vision from '@google-cloud/vision';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import { createCanvas } from 'canvas';
import { v2 } from '@google-cloud/translate';
const { Translate } = v2;

// Parse credentials from environment variable
const rawCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}';
const credentials = JSON.parse(rawCredentials);

// Initialize clients with credentials and explicit project ID
const visionClient = new vision.ImageAnnotatorClient({
  credentials: credentials,
  projectId: credentials.project_id
});

// Initialize PDF.js worker
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js');
if (typeof window === 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

interface TextSegment {
  text: string;
  page?: number;
}

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<TextSegment[]> {
  const segments: TextSegment[] = [];
  
  // Convert Buffer to Uint8Array
  const uint8Array = new Uint8Array(pdfBuffer);
  const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const canvas = createCanvas(page.view[2], page.view[3]);
    const context = canvas.getContext('2d');
    
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ 
      canvasContext: context as any,
      viewport 
    }).promise;
    
    const imageBuffer = canvas.toBuffer('image/png');
    const pageSegments = await extractTextFromImage(imageBuffer);
    segments.push(...pageSegments.map(segment => ({ ...segment, page: i })));
  }
  
  return segments;
}

export async function extractTextFromImage(image: Buffer): Promise<TextSegment[]> {
  const [result] = await visionClient.textDetection(image);
  
  if (!result.textAnnotations || result.textAnnotations.length === 0) {
    return [];
  }
  
  return result.textAnnotations.slice(1).map(annotation => ({
    text: annotation.description || '',
  }));
}

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

export async function translateText(text: string, target_language: string): Promise<string> {
  const translate = new Translate({ credentials, projectId: credentials.project_id });
  const [translation] = await translate.translate(text, target_language);
  return translation;
}

interface File {
  arrayBuffer(): Promise<ArrayBuffer>;
  type: string;
}

export async function processAndTranslateDocument(file: File, targetLang: string): Promise<{ original: TextSegment[], translated: string }> {
  const segments = await processDocument(file);
  const originalText = segments.map(s => s.text).join(' ');
  const translatedText = await translateText(originalText, targetLang);
  
  return {
    original: segments,
    translated: translatedText
  };
}