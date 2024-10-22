"use client";

import React from "react";
import { useEffect } from "react";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/components/typewriter-effect";

export default function Home() {
  const words = [
    { text: "Bring" },
    { text: "language" },
    { text: "processing" },
    { text: "to" },
    { text: "the" },
    { text: "next" },
    { text: "level.", className: "text-blue-500" },
  ];

  useEffect(() => {
    localStorage.setItem("user", crypto.randomUUID());
  }, []);

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 text-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-gray-100">
            Samvad.ai
          </h1>
        </div>
        <div className="h-20 mb-8">
          <TypewriterEffectSmooth words={words} />
        </div>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mt-8">
          <Link href="/register" passHref>
            <button className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 transition duration-300">
              Join now
            </button>
          </Link>
          <Link href="/login" passHref>
            <button className="px-8 py-3 rounded-full bg-gray-800 text-blue-400 font-semibold text-lg shadow-lg hover:bg-gray-700 transition duration-300">
              Sign in
            </button>
          </Link>
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
