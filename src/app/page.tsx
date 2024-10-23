"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  
  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="z-10 text-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-foreground">
            Samvad.ai
          </h1>
        </div>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mt-8">
          <Link href="/register" passHref>
            <Button 
              size="lg" 
              className="text-lg h-12 px-8 rounded-full"
            >
              Join now
            </Button>
          </Link>
          <Link href="/login" passHref>
            <Button 
              size="lg"
              variant="secondary"
              className="text-lg h-12 px-8 rounded-full"
            >
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}