"use client";

import React, { useState } from "react";
import { PlusIcon, MessageSquare, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Navbar } from "@/components/ui/navbar";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import axios from "axios";

/**
 * Dashboard component that provides chat creation and file upload functionality
 * 
 * This component serves as the main dashboard interface, allowing users to:
 * - View existing chats
 * - Create new chats with different AI models (GPT-4 or Claude 3.5)
 * - Upload and manage PDF files for chat context
 * - Navigate between different sections of the application
 *
 * @component
 * @returns {React.ReactElement} A dashboard interface with chat creation capabilities
 */
export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [model, setModel] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  /**
   * Handles the submission of a new chat creation
   * 
   * Creates a new chat with the selected model and uploaded files.
   * Processes any uploaded files through OCR and updates the chat with file data.
   * Redirects to the new chat page on success.
   *
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    try {
      const chat_data = {
        id: crypto.randomUUID(),
        file_group: [],
        model_name: model || 'gpt-3.5-turbo',
        created_by: Cookies.get('uid'),
        created_at: new Date()
      };

      const chatResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chats`, chat_data);
      
      if (chatResponse.status === 201) {
        let updatedFileGroup = [];
        
        if (files.length > 0) {
          const fileResults = await Promise.all(files.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chatId', chat_data.id);
            
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/ocr`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });

            return {
              name: file.name,
              data: response.data.data,
              extractedText: response.data.original.map((seg: { text: string }) => seg.text).join(' '),
              translatedText: response.data.translated
            };
          }));

          updatedFileGroup = fileResults;

          await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/chats/${chat_data.id}`, {
            file_group: updatedFileGroup
          });
        }

        toast({
          title: "Chat created successfully",
          description: "Redirecting to chat page...",
        });
        router.push(`/chats/${chat_data.id}`);
      }
    } catch (error) {
      console.error('Chat creation error:', error);
      toast({
        variant: "destructive",
        title: "Failed to create chat",
        description: error.response?.data?.error || "Please try again.",
      });
    }
  };

  /**
   * Handles file upload functionality
   * 
   * Validates uploaded files to ensure they are PDFs and adds them to the state.
   * Displays error messages for invalid file types.
   *
   * @param {File[]} uploadedFiles - Array of files selected by the user
   * @returns {Promise<void>}
   */
  const handleFileUpload = async (uploadedFiles: File[]) => {
    const pdfs = uploadedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfs.length !== uploadedFiles.length) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Only PDF files are accepted.",
      });
    }

    setFiles(prevFiles => [...prevFiles, ...pdfs]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="flex gap-8 md:gap-12 lg:gap-16 justify-center w-full max-w-[1200px]">
          <ChatButton label="Chats" icon={MessageSquare} isLink href="/chats" />
          <ChatButton label="GPT" onClick={() => { setModel("gpt4"); setIsDialogOpen(true); }} />
          <ChatButton label="Claude" onClick={() => { setModel("claude35"); setIsDialogOpen(true); }} />
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Upload files for your new chat with {model === "gpt4" ? "GPT-4" : "Claude 3.5"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="files" className="text-right">
                Files
              </Label>
              <div className="col-span-3">
                <div
                  className="border-2 border-dashed border-input rounded-lg p-6 cursor-pointer flex flex-col items-center justify-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(Array.from(e.dataTransfer.files));
                  }}
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.pdf';
                    fileInput.multiple = true;
                    fileInput.onchange = (e) => {
                      if (e.target instanceof HTMLInputElement && e.target.files) {
                        handleFileUpload(Array.from(e.target.files));
                      }
                    };
                    fileInput.click();
                  }}
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click or drag files to upload</p>
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
                          setFiles(files.filter((_, i) => i !== index));
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
            <AlertDialogCancel onClick={() => { setFiles([]); setModel(""); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * ChatButton component that renders either a button or a link with consistent styling
 * 
 * This component creates a large, card-like button that can either function as
 * a clickable button or a navigation link. It includes an icon and label,
 * with hover effects and consistent styling across both button and link variants.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Text to display under the icon
 * @param {Function} [props.onClick] - Click handler for button variant
 * @param {boolean} [props.isLink=false] - Whether to render as a link instead of button
 * @param {React.ElementType} [props.icon=PlusIcon] - Icon component to display
 * @param {string} [props.href=""] - URL for link variant
 * @returns {React.ReactElement} A styled button or link component
 */
function ChatButton({ 
  label, 
  onClick, 
  isLink = false, 
  icon: Icon = PlusIcon,
  href = ""
}: { 
  label: string; 
  onClick?: () => void; 
  isLink?: boolean; 
  icon?: React.ElementType;
  href?: string;
}) {
  const buttonClasses = `
    bg-card hover:bg-accent w-[220px] h-[220px] rounded-3xl shadow-md
    transition-all duration-300 group relative overflow-hidden
    flex flex-col items-center justify-center text-center
    p-4 border border-border
  `;

  const content = (
    <>
      <Icon className="h-16 w-16 mb-4 text-foreground transition-colors duration-300" />
      <span className="text-xl font-semibold text-foreground transition-colors duration-300">
        {label}
      </span>
    </>
  );

  if (isLink) {
    return (
      <Link href={href} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {content}
    </button>
  );
}
