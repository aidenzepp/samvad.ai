'use client'

import React, { useState } from "react";
import { ChatBubble } from "@/components/chat-bubble";
import { ChatInput } from "@/components/chat-input";

interface Message {
  message: string;
  is_user: boolean;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (message: string) => {
    setMessages(prevMessages => [...prevMessages, { message, is_user: true }]);
    // TODO: Send message to API and handle response
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((m, i) => (
          <ChatBubble
            message={m.message}
            is_user={i % 2 === 0}
          />
        ))}
      </div>
      <div className="flex-shrink-0 p-4 shadow-lg">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
      <div className="flex-shrink-0 p-4 shadow-lg">
        <p className="text-xs text-muted-foreground">
          Powered by <a href="https://samvad.ai" className="underline">Samvad.AI</a>
        </p>
      </div>
    </div>
  );
}
