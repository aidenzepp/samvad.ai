"use client";

import React from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "@/components/ui/resize-handle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";

export default function Chatting() {
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
          <Panel minSize={30}>
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
          <Panel minSize={30}>
            <Card className="h-full rounded-none border-border">
              <CardHeader>
                <CardTitle>API</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-5rem)] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  API
                </p>
              </CardContent>
            </Card>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}