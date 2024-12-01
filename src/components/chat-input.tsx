"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Lightbulb } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * Props interface for the ChatInput component
 * 
 * @interface ChatInputProps
 * @property {function} onSendMessage - Callback function to handle sending messages
 */
interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

/**
 * ChatInput component that provides a text input interface with suggested prompts
 * 
 * This component renders a textarea for message input along with a send button.
 * It also includes a suggested prompts feature that can be toggled to show
 * preset message options.
 *
 * @component
 * @param {ChatInputProps} props - The component props
 */
export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);

  /**
   * Handles changes to the message input textarea
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event
   */
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  /**
   * Handles message submission when the send button is clicked
   * Sends the message if it's not empty and resets the input
   */
  const handleMessageSubmit = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  /**
   * Handles keyboard events in the textarea
   * Submits the message on Enter key (without Shift)
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - The keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSubmit();
    }
  };

  /**
   * Handles clicks on suggested prompts
   * Either sends the prompt immediately or sets it as the current message
   * based on autoSubmit setting
   * @param {string} prompt - The selected prompt text
   */
  const handlePromptClick = (prompt: string) => {
    if (autoSubmit) {
      onSendMessage(prompt);
    } else {
      setMessage(prompt);
    }
    setShowPrompts(false);
  };

  /**
   * Array of predefined prompts that users can quickly select
   */
  const suggestedPrompts = [
    "Can you summarize the key points of this document?",
    "What is the tone of the document?",
    "Are there cultural nuances in this text?",
    "What important figures are mentioned in the text?",
    "What is the purpose of this text?",
  ];

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold">Chat</span>
          <span
            className="cursor-pointer"
            title="Click for suggested prompts"
            onClick={() => setShowPrompts((prev) => !prev)}
          >
            <Lightbulb className="h-5 w-5 text-yellow-500" />
          </span>
        </div>
      </div>

      {/* Suggested prompts dropdown */}
      {showPrompts && (
        <div className="bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 p-2 rounded-md shadow">
          <div className="flex items-center justify-between mb-2 pb-2 border-b">
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoSubmit}
                onCheckedChange={setAutoSubmit}
                id="auto-submit"
              />
              <Label htmlFor="auto-submit">Auto-submit prompts</Label>
            </div>
          </div>
          <ul className="space-y-1">
            {suggestedPrompts.map((prompt, index) => (
              <li
                key={index}
                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-600 p-1 rounded"
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
              </li>
            ))}
          </ul>
        </div>
      )}

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
    </div>
  );
};
