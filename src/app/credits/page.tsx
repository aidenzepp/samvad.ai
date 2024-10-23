"use client";

import { Navbar } from "@/components/ui/navbar";

export default function Credits() {
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        <Navbar />
        <div className="grid lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-3xl font-bold mb-8 text-foreground">Credits</h2>
                <ul className="text-xl space-y-4">
                  <li className="text-muted-foreground">1</li>
                  <li className="text-muted-foreground">2</li>
                  <li className="text-muted-foreground">3</li>
                  <li className="text-muted-foreground">4</li>
                </ul>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }