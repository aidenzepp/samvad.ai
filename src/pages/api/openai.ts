import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import SYSTEM_PROMPT from "./system-prompt";
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
      // Returns custom responses
      console.log("Custom Response Triggered:", customResponse);
      return res.status(200).json({ response: customResponse });
    }

    const conversationMessages = [
      { role: "system", content: SYSTEM_PROMPT },
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
