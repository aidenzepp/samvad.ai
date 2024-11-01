"use client";

import React, { useState, useEffect } from "react";
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
import { useParams } from "next/navigation";

interface Message {
  message: string;
  is_user: boolean;
}

interface FileSchema {
  name: string;
  data: Buffer;
  extractedText?: string;
  translatedText?: string;
}

interface FileUploadDialogProps {
  setExtractedText: (text: string) => void;
  setTranslatedText: (text: string) => void;
  setFiles: (files: FileSchema[]) => void;
  files: FileSchema[];
}

function FileUploadDialog({ setExtractedText, setTranslatedText, setFiles, files }: FileUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const params = useParams<{ id: string }>();
  const chatId = params?.id;

  const handleFileUpload = async (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    
    if (validFiles.length !== files.length) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Only PDF and image files are accepted.",
      });
    }

    setUploadFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        if (chatId) {
          formData.append('chatId', chatId);
        }

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to process file');
        }

        setExtractedText(data.original.map((seg: { text: string }) => seg.text).join(' '));
        setTranslatedText(data.translated);
        
        const newFile: FileSchema = {
          name: file.name,
          data: Buffer.from(''),
          extractedText: data.original.map((seg: { text: string }) => seg.text).join(' '),
          translatedText: data.translated
        };

        const newFiles: FileSchema[] = [...files, newFile];
        setFiles(newFiles);
      }
      setOpen(false);
      setUploadFiles([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error uploading file",
        description: "Failed to process the file.",
      });
    } finally {
      setLoading(false);
    }
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
                  file_input.accept = 'application/pdf,image/*';
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
                {uploadFiles.map((file, index) => (
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
                        const newFiles = uploadFiles.filter((_, i) => i !== index);
                        setUploadFiles(newFiles);
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
          <AlertDialogAction 
            onClick={handleSubmit} 
            disabled={loading || uploadFiles.length === 0}
          >
            {loading ? "Uploading..." : "Upload"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ChatResponse {
  file_group: FileSchema[];
}

export default function Chatting() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [files, setFiles] = useState<FileSchema[]>([]);
  const [translatedText, setTranslatedText] = useState("");
  const [showTranslated, setShowTranslated] = useState(true);
  const params = useParams<{ id: string }>();

  const chatId = params?.id;

  if (!chatId) {
    throw new Error("Chat ID is required");
  }

  useEffect(() => {
    const loadChatData = async () => {
      try {
        const response = await axios.get<ChatResponse>(`/api/chats/${params.id}`);
        setFiles(response.data.file_group);
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    };
    
    loadChatData();
  }, [params.id]);

  const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.`;

  const toggleText = () => {
    setShowTranslated(prev => !prev);
  };

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { message, is_user: true }]);
    
    try {
      const documentContent = showTranslated ? translatedText : extractedText;
      
      if (!documentContent) {
        setMessages(prev => [...prev, { 
          message: "Please select a document first to discuss its contents.", 
          is_user: false 
        }]);
        return;
      }

      const systemMessage = {
        role: "system",
        content: `You are analyzing the following document content:\n\n${documentContent}\n\nPlease provide insights and answer questions about this document.`
      };

      const userMessages = messages.map(msg => ({
        role: msg.is_user ? "user" : "assistant",
        content: msg.message
      }));

      const currentMessage = {
        role: "user",
        content: message
      };

      const response = await axios.post('/api/openai', {
        messages: [systemMessage, ...userMessages, currentMessage],
        model: "gpt-3.5-turbo"
      });

      const responseData = response.data as { response: string };
      if (responseData.response) {
        setMessages(prev => [...prev, { 
          message: responseData.response, 
          is_user: false 
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        message: "Sorry, there was an error processing your request.", 
        is_user: false 
      }]);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (chatId) {
        formData.append('chatId', chatId);
      }

      interface ProcessFileResponse {
        extractedText: string;
      }

      const response = await axios.post<ProcessFileResponse>('/api/process-file', formData);
      
      if (response.data.extractedText) {
        setExtractedText(response.data.extractedText ?? '');
        // Optionally handle translated text
        // Update UI to show the new file in the files panel
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: "Failed to process the uploaded file.",
      });
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
                  <FileUploadDialog 
                    setExtractedText={setExtractedText}
                    setTranslatedText={setTranslatedText}
                    setFiles={setFiles}
                    files={files}
                  />
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-4">
                {files.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No files uploaded yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <Button
                        key={index}
                        variant={selectedFile === index ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedFile(index);
                          setExtractedText(file.extractedText || '');
                          setTranslatedText(file.translatedText || '');
                        }}
                      >
                        {file.name}
                      </Button>
                    ))}
                  </div>
                )}
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
                    Show {showTranslated ? "Original" : "Translated"}
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="h-[calc(100%-7rem)] p-4">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-secondary/20">
                  {(showTranslated ? translatedText : extractedText) ? (
                    <div className="whitespace-pre-wrap break-words text-foreground leading-relaxed">
                      {showTranslated ? translatedText : extractedText}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-muted-foreground">
                        {showTranslated ? "Translated" : "Extracted"} text will appear here
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
