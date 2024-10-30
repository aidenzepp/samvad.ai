"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "@/components/ui/resize-handle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";
import { ChatBubble } from "@/components/chat-bubble";
import { ChatInput } from "@/components/chat-input";
import axios from "axios";

interface Message {
  message: string;
  is_user: boolean;
}

export default function Chatting() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { message, is_user: true }]);
    
    try {
      interface ApiResponse {
        response: string;
      }
      
      const response = await axios.post<ApiResponse>('/api/openai', {
        messages: [message],
        model: "gpt-3.5-turbo"
      });

      if (response.data.response) {
        setMessages(prev => [...prev, { 
          message: response.data.response, 
          is_user: false 
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel minSize={15} maxSize={20} defaultSize={15}>
            <Card className="h-full rounded-none border-border">
              <CardHeader className="p-4">
                <div className="flex justify-between items-center">
                  <CardTitle>Files</CardTitle>
                  <Button size="icon" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Uploaded files go here
                </p>
              </CardContent>
            </Card>
          </Panel>
          <ResizeHandle />
          <Panel minSize={30} defaultSize={42.5}>
            <Card className="h-full rounded-none border-border">
              <CardHeader>
                <CardTitle>OCR text</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)] flex items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">
                  OCR text
                </p>
              </CardContent>
            </Card>
          </Panel>
          <ResizeHandle />
          <Panel minSize={30} defaultSize={42.5}>
            <Card className="h-full rounded-none border-border">
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)] flex flex-col">
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <ChatBubble
                      key={index}
                      message={msg.message}
                      is_user={msg.is_user}
                    />
                  ))}
                </div>
                <div className="p-4 border-t">
                  <ChatInput onSendMessage={handleSendMessage} />
                </div>
              </CardContent>
            </Card>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
