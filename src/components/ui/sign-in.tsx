"use client";

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import axios from "axios";
import { Button } from "../ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export function SigninForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        action: "login",
        username,
        password,
      });
      if (response.status === 200) {
        router.push('/home');
      }
    } catch (error) {
      setError("Invalid username or password");
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="z-10 w-full max-w-md">
        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
          <h2 className="font-bold text-3xl text-foreground mb-6 text-center">
            Member Login
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <LabelInputContainer>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input border-input"
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-input"
              />
            </LabelInputContainer>
            <Button 
              className="w-full text-lg h-12"
              type="submit"
            >
              Sign in
            </Button>
          </form>
          {error && <p className="text-destructive text-center mt-4">{error}</p>}
          <p className="text-center text-muted-foreground mt-6">
            If you're not already a member,{' '}
            <Link 
              href="/register" 
              className="text-primary hover:text-primary/90 underline underline-offset-4"
            >
              register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};