"use client";

import Cookies from "js-cookie";
import { columns } from "./columns"
import { ChatSchema, FileSchema } from "@/lib/mongodb"
import { UUID } from "crypto"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/ui/navbar"
import axios from "axios"
import { useRouter } from "next/navigation";

function ChatCreationForm({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<string>("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (files: File[]) => {
    setLoading(true);
    
    try {
      const processedFiles = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', 'temp-id');

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to process file');
        }

        const data = await response.json();
        processedFiles.push({
          name: file.name,
          data: data.data,
          extractedText: data.original.map((seg: { text: string }) => seg.text).join(' '),
          translatedText: data.translated
        });
      }

      // Save processed files to state
      setFiles(prevFiles => [...prevFiles, ...files]);
      
      toast({
        title: "Success",
        description: "Files processed successfully",
      });

      // Return processed files for chat creation
      return processedFiles;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process files",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const processedFiles = await handleFileUpload(files);
      
      const chat_data = {
        id: crypto.randomUUID(),
        file_group: processedFiles,
        model_name: model || 'gpt-3.5-turbo',
        created_by: Cookies.get('uid'),
        created_at: new Date()
      };

      const response = await axios.post('/api/chats', chat_data);
      
      if (response.status === 201) {
        toast({
          title: "Chat created successfully",
          description: "Redirecting to chat...",
        });
        router.push(`/chats/${chat_data.id}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create chat",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Chat</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the details for your new chat.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          {/* Model selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Select onValueChange={(value) => setModel(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt4">GPT-4</SelectItem>
                <SelectItem value="claude35">Claude 3.5 Sonnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File upload section */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="files" className="text-right">
              Files
            </Label>
            <div className="col-span-3">
              <input 
                type="file" 
                accept="application/pdf,image/*" 
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  handleFileUpload(files);
                }}
                className="w-full"
                multiple
              />
              {loading && <div className="text-sm text-muted-foreground mt-2">Processing files...</div>}
            </div>
          </div>

          {/* Display uploaded files */}
          {files.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Uploaded</Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <Badge key={index} variant="secondary" className="relative group">
                      {file.name.slice(0, 20)}
                      <button
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        className="ml-2 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCreateChat}
            disabled={loading}
          >
            {loading ? "Processing files..." : "Create"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function Chats() {
  const [chats, setChats] = useState<ChatSchema[]>([]);
  const [selectedChats, setSelectedChats] = useState<ChatSchema[]>([]);

  const fetchChats = async () => {
    try {
      const userId = Cookies.get('uid');
      const response = await axios.get(`/api/chats`, {
        params: { userId }
      });
      setChats(response.data as ChatSchema[]);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        variant: "destructive",
        title: "Error fetching chats",
        description: "Please try again later."
      });
    }
  };

  const handleRemoveChats = async () => {
    console.log('handleRemoveChats called');
    if (selectedChats.length === 0) {
      toast({
        variant: "destructive",
        title: "No chats selected",
        description: "Please select chats to delete.",
      });
      return;
    }

    try {
      await Promise.all(selectedChats.map(chat => 
        axios.delete(`/api/chats?id=${chat.id}`)
      ));
      toast({
        title: "Success",
        description: "Selected chats have been deleted.",
      });
      fetchChats();
      setSelectedChats([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete selected chats.",
      });
    }
  };

  const handleRowSelect = (chat: ChatSchema) => {
    
    const selectedIds = new Set(selectedChats.map(c => c.id));
    
    if (selectedIds.has(chat.id)) {
      setSelectedChats(prev => prev.filter(c => c.id !== chat.id));
    } else {
      setSelectedChats(prev => [...prev, chat]);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Chats</CardTitle>
              <CardDescription>
                A list of all your chats.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <ChatCreationForm onSuccess={fetchChats} />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRemoveChats}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={chats} 
              onRowSelect={handleRowSelect}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}