import { NextApiRequest, NextApiResponse } from 'next';
import { extractTextFromImage, translateText } from '@/lib/ocr';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const extracted_text = await extractTextFromImage(req.body.image);
  const translated_text = await translateText(extracted_text, "en");
  res.status(200).json({ translated_text });
}
