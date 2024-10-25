"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import axios from "axios";
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="font-bold text-3xl text-gray-100 mb-6 text-center">
            Register
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
                required
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
                required
                className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500"
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500"
              />
            </LabelInputContainer>
            <button
              className="w-full px-8 py-3 rounded-full bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 transition duration-300"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          {success && <p className="text-green-500 text-center mt-4">{success}</p>}
          <p className="text-center text-gray-400 mt-6">
            Already a member?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
              Sign In
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