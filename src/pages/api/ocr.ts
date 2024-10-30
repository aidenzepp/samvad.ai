import { NextApiRequest, NextApiResponse } from 'next';
import { processAndTranslateDocument } from '@/lib/ocr';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Read the file buffer and convert to Uint8Array
    const buffer = await fs.readFile(file.filepath);
    const uint8Array = new Uint8Array(buffer);

    const result = await processAndTranslateDocument({
      arrayBuffer: async () => uint8Array,
      type: file.mimetype || 'application/octet-stream'
    }, "en");

    // Clean up the temporary file
    await fs.unlink(file.filepath);

    res.status(200).json(result);
  } catch (error) {
    console.error('OCR/Translation error:', error);
    res.status(500).json({ 
      error: 'Error processing document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
