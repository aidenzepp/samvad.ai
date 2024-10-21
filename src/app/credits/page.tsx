"use client";

import { Navbar } from "@/components/ui/navbar";

export default function Credits() {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
        <Navbar />
        <div className="grid lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-3xl font-bold mb-8 text-gray-100">Credits</h2>
                <ul className="text-xl space-y-4">
                  <li className="text-gray-300">1</li>
                  <li className="text-gray-300">2</li>
                  <li className="text-gray-300">3</li>
                  <li className="text-gray-300">4</li>
                </ul>
              </div>
            </main>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    );
  }