"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (username.length < 4) {
      setError("Username must be at least 4 characters long.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        username,
        password,
      });

      if (response.status === 200) {
        setSuccess("Registration successful! You can now log in.");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setError("");
        setLoading(false);

        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      setLoading(false);
      console.log("Error: ", error);
      if (error.response) {
        switch (error.response.status) {
          case 409:
            setError("Username already exists. Please choose another.");
            break;
          case 500:
            setError("Internal server error. Please try again later.");
            break;
          default:
            setError("An error occurred. Please try again.");
        }
      } else {
        setError("An error occurred. Please check your network connection.");
      }
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
            Register
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
                required
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
                required
                className="bg-input border-input"
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-input border-input"
              />
            </LabelInputContainer>
              <Button 
                className="w-full text-lg h-12"
                type="submit"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
          </form>
          {error && <p className="text-destructive text-center mt-4">{error}</p>}
          {success && <p className="text-primary text-center mt-4">{success}</p>}
          <p className="text-center text-muted-foreground mt-6">
            Already a member?{' '}
            <Link 
              href="/login" 
              className="text-primary hover:text-primary/90 underline underline-offset-4"
            >
              Sign In
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