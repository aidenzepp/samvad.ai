"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { UUID } from "crypto";
import { ChatData, FileData } from "@/lib/types";
import { fileToBase64 } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function ChatCreationForm() {
    const [open, setOpen] = useState(false);
    const [model, setModel] = useState("");
    const [files, setFiles] = useState<File[]>([]);
  
    const handleSubmit = async () => {
      try {
        let file_group: FileData[] = [];
        for (const file of files) {
          const name = file.name;
          const data = await fileToBase64(file);
          file_group.push({ name, data });
        }
  
        const user_uuid: UUID = crypto.randomUUID() as UUID; // FIXME
        const chat_data: ChatData = {
          id: crypto.randomUUID() as UUID,
          file_group: file_group,
          model_name: model,
          created_by: user_uuid,
          created_at: new Date(),
        };
  
        const response = await fetch("/api/chats", {
          method: "POST",
          body: JSON.stringify(chat_data),
        });
        if (response.ok) {
          toast({
            variant: "default",
            title: "Chat created successfully",
            description: "Your chat has been created.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Failed to create chat",
            description: "Please try again.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to create chat",
          description: "Please try again.",
        });
      } finally {
        setOpen(false);
      }
    };
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="files" className="text-right">
                Files
              </Label>
              <div className="col-span-3">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer flex flex-col items-center justify-center"
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
                  <Upload className="h-6 w-6 text-gray-400" />
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleFileUpload(files);
                    }}
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-4 items-center gap-4 ">
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
                        className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
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
            <AlertDialogAction onClick={handleSubmit} disabled={!model}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }