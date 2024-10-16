"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid min-h-screen items-start lg:grid-cols-[280px_1fr]">
      <Navbar />
      <div className="flex flex-col h-screen">
        <main className="flex flex-1 gap-4 p-4 md:gap-8 md:p-6">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center w-full flex-1">
                  <Label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    {image ? (
                      <Image src={image} alt="Uploaded preview" width={300} height={300} className="object-contain max-h-[300px]" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, PDF
                        </p>
                      </div>
                    )}
                    <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg" />
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>api</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-500">
                api
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}