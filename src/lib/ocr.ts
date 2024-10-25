import vision from '@google-cloud/vision';
import { TranslationServiceClient } from '@google-cloud/translate';

export async function extractTextFromImage(image: Buffer): Promise<string> {
  const vision_client = new vision.ImageAnnotatorClient();
  const [result] = await vision_client.textDetection(image);
  return result.textAnnotations?.[0]?.description ?? '';
}

export async function translateText(text: string, target_language: string): Promise<string> {
  const translate_client = new TranslationServiceClient();
  const [translation] = await translate_client.translateText({
    parent: 'projects/samvad/locations/global',
    contents: [text],
    targetLanguageCode: target_language,
  });
  return translation.translations?.map((t) => t.translatedText).join('\n') ?? '';
}