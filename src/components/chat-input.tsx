"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

/**
 * Props interface for the ChatInput component
 * 
 * @interface ChatInputProps
 * @property {function} onSendMessage - Callback function that handles sending the message
 */
interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

/**
 * ChatInput component that provides a textarea for message input with send functionality
 * 
 * This component renders a textarea with a send button for submitting messages. It supports
 * both button click and Enter key (without shift) for sending messages. The textarea is
 * resizable vertically within defined bounds.
 *
 * @component
 * @param {ChatInputProps} props - The component props
 * @param {function} props.onSendMessage - Callback function called when a message is sent
 * 
 * @returns {React.ReactElement} A message input area with send button
 * 
 * @example
 * ```tsx
 * <ChatInput 
 *   onSendMessage={(message) => handleMessage(message)}
 * />
 * ```
 */
export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  // State to manage the current message text
  const [message, setMessage] = useState("");

  /**
   * Handles changes to the message textarea content
   * 
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event
   */
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  /**
   * Handles message submission
   * Sends message if it's not empty and resets the input
   */
  const handleMessageSubmit = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  /**
   * Handles keyboard events in the textarea
   * Submits message on Enter key (without shift) press
   * 
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - The keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter behavior
      handleMessageSubmit();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Textarea
        placeholder="Type your message here..."
        className="border-gray-200 dark:border-zinc-900 dark:bg-zinc-800 min-h-[80px] max-h-[500px] overflow-y-auto resize-y"
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
      />
      <Button size="icon" onClick={handleMessageSubmit}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
