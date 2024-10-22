"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleMessageSubmit = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMessageSubmit();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Textarea
        placeholder="Type your message here..."
        className="flex-grow max-h-[200px] min-h-[60px] overflow-y-auto resize-y"
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
