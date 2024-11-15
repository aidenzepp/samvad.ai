import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Props interface for the ChatBubble component
 * 
 * @interface ChatBubbleProps
 * @property {string} message - The text content to display in the chat bubble
 * @property {boolean} is_user - Whether this message is from the user (true) or the LLM (false)
 */
interface ChatBubbleProps {
  message: string;
  is_user: boolean;
}

/**
 * ChatBubble component that renders a single chat message in a card format
 * 
 * This component displays chat messages in a bubble style, with different styling
 * for user messages vs LLM responses. User messages are aligned right with primary
 * colors, while LLM messages are aligned left with default colors.
 *
 * @component
 * @param {ChatBubbleProps} props - The component props
 * @param {string} props.message - The message text to display
 * @param {boolean} props.is_user - Whether this is a user message
 * 
 * @returns {React.ReactElement} A styled chat bubble containing the message
 * 
 * @example
 * ```tsx
 * <ChatBubble 
 *   message="Hello world!"
 *   is_user={true}
 * />
 * ```
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, is_user }) => {
  return (
    <Card
      className={cn(
        "max-w-[60%] mb-4",
        is_user ? "ml-auto bg-primary text-primary-foreground" : "mr-auto"
      )}
    >
      <CardContent className="p-3">
        <p className="text-xs font-bold mb-1">{is_user ? "You" : "LLM"}</p>
        <p className="text-sm break-words whitespace-pre-wrap">{message}</p>
      </CardContent>
    </Card>
  );
};