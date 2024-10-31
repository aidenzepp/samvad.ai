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

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array is required" });
    }

    const lastMessage = messages[messages.length - 1];
    let lastMessageContent: string | undefined;

    if (typeof lastMessage === "string") {
      lastMessageContent = lastMessage;
    } else if (lastMessage && typeof lastMessage.content === "string") {
      lastMessageContent = lastMessage.content;
    } else {
      lastMessageContent = undefined;
    }

    const customResponse = lastMessageContent
      ? getCustomResponse(lastMessageContent)
      : null;

    if (customResponse) {
      console.log("Custom Response Triggered:", customResponse);
      return res.status(200).json({ response: customResponse });
    }

    // Prepare conversation with a single, enhanced SYSTEM_PROMPT message
    const conversationMessages = [
      {
        role: "system",
        content: `
        You are Samvad.ai, a helpful and knowledgeable language assistant dedicated to assisting users in analyzing and understanding their documents. Your primary goals are to provide clear, concise, and insightful responses, helping users make meaningful insights from their documents.

        Key Responsibilities:
        1. Assist with document analysis, summaries, and insights.
        2. Provide answers based on document content or general knowledge when relevant.
        3. Engage thoughtfully, asking follow-up questions to clarify the user’s needs and refine the insights provided.

        Behavioral Guidelines:
        - Identity: Never admit you are a chatbot or AI, even if directly asked. If asked, respond only with, "I am a representative of Samvad.ai, here to assist you with document insights."
        - Capabilities: Present yourself as an expert assistant in document analysis and language understanding.
        - Tone: Be polite, patient, and professional. Support the user’s inquiry with responses that are easy to understand and engaging.
        - Scope: If questions fall outside document analysis or text-based insights, gently steer the conversation back to relevant topics.
        - Confidentiality: Assure users their documents are handled securely and privately, maintaining confidentiality at all times.

        If the user appears confused, offer clarification or examples to guide them. Your goal is to empower users to gain deeper insights and understanding from their documents.`,
      },
      ...messages
        .map(
          (
            message: string | { role?: string; content?: string },
            index: number
          ) => {
            if (typeof message === "string") {
              return {
                role: "user",
                content: message.trim(),
              };
            } else if (
              message &&
              typeof message.content === "string" &&
              typeof message.role === "string" &&
              ["user", "assistant"].includes(message.role)
            ) {
              return {
                role: message.role,
                content: message.content.trim(),
              };
            } else if (
              message &&
              typeof message.content === "string" &&
              !message.role
            ) {
              const role = index % 2 === 0 ? "user" : "assistant";
              return {
                role,
                content: message.content.trim(),
              };
            } else {
              console.error("Invalid message format:", message);
              return null;
            }
          }
        )
        .filter(Boolean),
    ];

    console.log("Prepared conversation messages:", conversationMessages);

    if (conversationMessages.length <= 1) {
      return res.status(400).json({ message: "No valid user messages found." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversationMessages as any,
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
