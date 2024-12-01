"use client";

import Cookies from "js-cookie";
import { columns } from "./columns"
import { ChatSchema } from "@/lib/mongodb"
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
import { Plus, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { Navbar } from "@/components/ui/navbar"
import axios from "axios"
import { useRouter } from "next/navigation";

/**
 * Form component for creating new chats with file upload capabilities
 * 
 * This component provides a dialog interface for users to:
 * - Select an AI model (GPT-4 or Claude 3.5)
 * - Upload and process multiple files
 * - Create a new chat with the selected model and processed files
 *
 * @component
 * @param {Object} props - Component props
 * @param {() => Promise<void>} props.onSuccess - Callback function to execute after successful chat creation
 * @returns {React.ReactElement} A dialog form for chat creation
 */
function ChatCreationForm({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<string>("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  /**
   * Handles file upload and processing
   * 
   * Processes uploaded files through OCR API and stores results.
   * Handles loading states and error notifications.
   *
   * @param {File[]} files - Array of files to process
   * @returns {Promise<Array>} Array of processed file data
   */
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

      setFiles(prevFiles => [...prevFiles, ...files]);
      
      toast({
        title: "Success",
        description: "Files processed successfully",
      });

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

  /**
   * Handles chat creation with processed files
   * 
   * Creates a new chat with selected model and processed files.
   * Redirects to the new chat page on success.
   *
   * @returns {Promise<void>}
   */
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

/**
 * Main chats page component that displays and manages user chats
 * 
 * This component provides functionality to:
 * - View all user chats in a data table
 * - Create new chats via a dialog form
 * - Select and delete multiple chats
 * - Handle error states and loading
 *
 * @component
 * @returns {React.ReactElement} A page displaying chat management interface
 */
export default function Chats() {
  const [chats, setChats] = useState<ChatSchema[]>([]);
  const [selectedChats, setSelectedChats] = useState<ChatSchema[]>([]);

  /**
   * Fetches user's chats from the API
   * 
   * Retrieves all chats associated with the current user ID.
   * Updates state with fetched chats and handles errors.
   *
   * @returns {Promise<void>}
   */
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

  /**
   * Handles deletion of selected chats
   * 
   * Deletes multiple selected chats and updates the UI.
   * Shows success/error notifications and refreshes chat list.
   *
   * @returns {Promise<void>}
   */
  const handleRemoveChats = async () => {
    if (selectedChats.length === 0) {
      toast({
        variant: "destructive",
        title: "No chats selected",
        description: "Please select chats to delete.",
      });
      return;
    }

    try {
      setSelectedChats([]);
      await Promise.all(selectedChats.map(chat => 
        axios.delete(`/api/chats?id=${chat.id}`)
      ));
      toast({
        title: "Success",
        description: `${selectedChats.length} chat${selectedChats.length > 1 ? 's' : ''} deleted successfully.`,
      });
      await fetchChats();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete one or more chats.",
      });
    }
  };

  /**
   * Updates the selected chats state when rows are selected in the data table
   *
   * @param {ChatSchema[]} selectedRows - Array of currently selected chat rows
   */
  const handleRowSelect = (selectedRows: ChatSchema[]) => {
    setSelectedChats(selectedRows);
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