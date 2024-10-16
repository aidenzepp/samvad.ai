"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";


export default function Home() {
    return (
      <div className="grid min-h-screen items-start lg:grid-cols-[280px_1fr]">
        <Navbar />
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex flex-col items-center justify-center h-full text-white">
              <h2 className="text-2xl font-bold mb-4">Credits</h2>
              <ul className="text-xl">
                <li className="mb-2">Name 1</li>
                <li className="mb-2">Name 2</li>
                <li className="mb-2">Name 3</li>
                <li className="mb-2">Name 4</li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    );
  }