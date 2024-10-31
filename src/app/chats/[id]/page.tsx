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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Message {
  message: string;
  is_user: boolean;
}

function FileUploadDialog() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (files: File[]) => {
    const pdfs = files.filter(file => file.type === 'application/pdf');
    
    if (pdfs.length !== files.length) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Only PDF files are accepted.",
      });
    }

    setFiles(prevFiles => [...prevFiles, ...pdfs]);
  };

  const handleSubmit = async () => {
    // ADD UPLOADING LOGIC!!!
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Upload className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upload Files</AlertDialogTitle>
          <AlertDialogDescription>
            Upload PDF files to analyze in this chat.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="files" className="text-right">
              Files
            </Label>
            <div className="col-span-3">
              <div
                className="border-2 border-dashed border-input rounded-lg p-6 cursor-pointer flex flex-col items-center justify-center hover:border-muted-foreground transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  handleFileUpload(files);
                }}
                onClick={() => {
                  const file_input = document.createElement('input');
                  file_input.type = 'file';
                  file_input.accept = '.pdf';
                  file_input.multiple = true;
                  file_input.click();
                  file_input.onchange = (e) => {
                    if (e.target instanceof HTMLInputElement && e.target.files) {
                      const files = Array.from(e.target.files);
                      handleFileUpload(files);
                    }
                  };
                }}
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Click or drag files to upload
                </p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="uploadedFiles" className="text-right">
              <strong>Uploaded Files</strong>
            </Label>
            <div className="col-span-3">
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="relative group"
                  >
                    {file.name.slice(0, 10) + (file.name.length > 10 ? "..." : "")}
                    <span
                      className="absolute top-0 right-0 -mt-1 -mr-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newFiles = files.filter((_, i) => i !== index);
                        setFiles(newFiles);
                      }}
                    >
                      ×
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            Upload
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function Chatting() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [extractedText, setExtractedText] = useState("");

  const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.`;

  const toggleText = () => {
    setExtractedText(current => current ? "" : loremIpsum);
  };

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
                  <FileUploadDialog />
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
              <CardHeader className="p-4">
                <div className="flex items-center">
                  <CardTitle>Extracted Text</CardTitle>
                  <div className="flex-1" />
                  <Button onClick={toggleText} variant="outline">
                    Toggle Text
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="h-[calc(100%-7rem)] p-4">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-secondary/20">
                  {extractedText ? (
                    <div className="whitespace-pre-wrap break-words text-foreground leading-relaxed">
                      {extractedText}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-muted-foreground">
                        Extracted text will appear here
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Panel>
          <ResizeHandle />
          <Panel minSize={30} defaultSize={42.5}>
            <Card className="h-full rounded-none border-border">
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <Separator className="mb-0" />
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
