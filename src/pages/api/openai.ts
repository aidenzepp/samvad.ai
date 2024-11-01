import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { getCustomResponse } from "./response-rules";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { messages } = req.body;

    console.log("Incoming messages:", messages);

    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    const conversationMessages = messages.map((message) => {
      if (message && typeof message === 'object' && 
          'role' in message && 'content' in message &&
          ['system', 'user', 'assistant'].includes(message.role)) {
        return message;
      }

      if (typeof message === 'string') {
        return {
          role: 'user',
          content: message.trim()
        };
      }

      if (message && typeof message.content === 'string') {
        return {
          role: message.role || 'user',
          content: message.content.trim()
        };
      }

      console.error('Invalid message format:', message);
      return null;
    }).filter(Boolean);

    console.log("Prepared conversation messages:", conversationMessages);

    if (conversationMessages.length <= 1) {
      return res.status(400).json({ message: "No valid user messages found." });
    }

    const completion = await openai.chat.completions.create({
      model: req.body.model || "gpt-3.5-turbo",
      messages: conversationMessages,
      temperature: 0.7,
    });

    return res.status(200).json({
      response:
        completion.choices[0].message?.content ||
        "Sorry, I couldn't generate a response.",
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return res.status(500).json({
      message: "Error processing your request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
