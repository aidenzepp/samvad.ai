"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File as FileIcon, X } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const fileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const upload = async () => {
    if (!file) {
      toast({
        title: "No file",
        description: "No file",
        variant: "destructive",
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Upload successful",
          description: `File ID: ${data.fileId}`,
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Upload failed",
        variant: "destructive",
      });
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    const fileInput = document.getElementById('dropzone-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const render = () => {
    if (!file) return null;

    if (file.type.startsWith('image/')) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          {preview && (
            <Image 
              src={preview}
              alt="Uploaded preview" 
              width={800}
              height={800}
              objectFit="contain"
              className="rounded-lg"
            />
          )}
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <iframe
          src={preview as string}
          width="100%"
          height="100%"
          className="rounded-lg"
        />
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2 p-4 bg-gray-100 rounded-lg">
            <FileIcon className="w-16 h-16 text-gray-500" />
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 10240).toFixed(2)} KB</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <Navbar />
        <div className="flex flex-col h-screen">
          <main className="flex flex-1 gap-4 p-4 md:gap-8 md:p-6">
            <Card className="flex-1 flex flex-col bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">File Upload</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                <div className="flex-1 flex flex-col">
                  <Label
                    htmlFor="dropzone-file"
                    className="flex-1 flex flex-col items-center justify-center w-full border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 overflow-hidden"
                  >
                    {!file ? (
                      <div className="flex flex-col items-center justify-center p-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, PDF (MAX. 10MB)
                        </p>
                      </div>
                    ) : (
                      render()
                    )}
                    <Input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={fileChange}
                      accept="image/png, image/jpeg, application/pdf" 
                    />
                  </Label>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={removeFile} disabled={!file} className="w-1/2 bg-gray-700 text-gray-200 hover:bg-gray-600" variant="outline">
                    <X className="mr-2 h-4 w-4" /> Remove File
                  </Button>
                  <Button onClick={upload} disabled={!file} className="w-1/2 bg-blue-600 text-white hover:bg-blue-700">
                    <Upload className="mr-2 h-4 w-4" /> Upload File
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 flex flex-col bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">api</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-400">
                  api
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}