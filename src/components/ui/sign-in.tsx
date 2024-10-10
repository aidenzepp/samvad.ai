"use client";

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import axios from "axios";

export function SigninForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="font-bold text-3xl text-gray-100 mb-6 text-center">
            Member Login
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <LabelInputContainer>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                placeholder="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500"
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500"
              />
            </LabelInputContainer>
            <button
              className="w-full px-8 py-3 rounded-full bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 transition duration-300"
              type="submit"
            >
              Sign in
            </button>
          </form>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          <p className="text-center text-gray-400 mt-6">
            If you're not already a member,{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
              register here
            </Link>
          </p>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};