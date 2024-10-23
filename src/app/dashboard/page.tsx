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
import { ModeToggle } from "@/components/mode-toggle";

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [model, setModel] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const file_group = await Promise.all(files.map(async (file) => {
        const data = await fileToBase64(file);
        return { name: file.name, data };
      }));

      const chat_data = {
        id: crypto.randomUUID(),
        file_group,
        model_name: model,
        created_by: "USER_UUID",
        created_at: new Date(),
      };

      const response = await fetch("/api/chats", {
        method: "POST",
        body: JSON.stringify(chat_data),
      });

      if (response.ok) {
        toast({
          title: "Chat created successfully",
          description: "Redirecting to chat page...",
        });
        router.push('/chats');
      } else {
        throw new Error("Failed to create chat");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create chat",
        description: "Please try again.",
      });
    } finally {
      setIsDialogOpen(false);
      setFiles([]);
      setModel("");
    }
  };

  const handleFileUpload = (uploadedFiles: File[]) => {
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
            <AlertDialogAction onClick={handleSubmit} disabled={files.length === 0}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}