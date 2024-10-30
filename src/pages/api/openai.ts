import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    const completion = await openai.chat.completions.create({
      model: model || "gpt-3.5-turbo",
      messages: messages.map(message => ({
        role: "user",
        content: message
      }))
    });

    return res.status(200).json({
      response: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      message: 'Error processing your request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
