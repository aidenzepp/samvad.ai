"use client";

import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState } from "react";

/**
 * Credits page component that displays contributor information with an animated dot border effect
 * 
 * This component creates a visually appealing credits page with contributor names and roles.
 * It features an animated border made of dots that fade in and out around the page edges.
 * The border automatically adjusts to window resizing.
 *
 * @component
 * @returns {React.ReactElement} A credits page with animated border and contributor list
 */
export default function Credits() {
    const [dots, setDots] = useState<{ x: number; y: number; delay: number }[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    /**
     * Effect hook to handle window dimensions and resize events
     * 
     * Sets up initial window dimensions and adds a resize event listener to update
     * dimensions when the window size changes. Cleans up the event listener on unmount.
     */
    useEffect(() => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
        });

        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /**
     * Effect hook to calculate and position the animated border dots
     * 
     * Calculates positions for dots around the page border based on current window dimensions.
     * Creates an array of dot objects with coordinates and animation delays.
     * Dots are positioned to form a rectangular border with even spacing.
     * 
     * @dependency {dimensions} Updates dot positions when window dimensions change
     */
    useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const dotsPerSide = 40;
        const totalDots = dotsPerSide * 4;
        const newDots = [];
        
        for (let i = 0; i < totalDots; i++) {
            let x, y;
            const segment = Math.floor(i / dotsPerSide);
            const segmentPosition = (i % dotsPerSide) / dotsPerSide;
            
            switch(segment) {
                case 0:
                    x = 16 + segmentPosition * (dimensions.width - 40);
                    y = 64;
                    break;
                case 1:
                    x = dimensions.width - 24;
                    y = 64 + segmentPosition * (dimensions.height - 88);
                    break;
                case 2:
                    x = dimensions.width - 24 - segmentPosition * (dimensions.width - 40);
                    y = dimensions.height - 24;
                    break;
                default:
                    x = 16;
                    y = dimensions.height - 24 - segmentPosition * (dimensions.height - 88);
                    break;
            }
            
            newDots.push({
                x,
                y,
                delay: -(i / totalDots) * 8,
            });
        }
        setDots(newDots);
    }, [dimensions]);

    return (
      <div className="h-screen bg-background text-foreground relative overflow-hidden">
        <Navbar />
        <div className="absolute inset-0 z-0 pointer-events-none">
          {dots.map((dot, index) => (
            <div
              key={index}
              className="absolute w-2 h-2 rounded-full bg-foreground/70"
              style={{
                left: `${dot.x}px`,
                top: `${dot.y}px`,
                animation: `fadeInOut 4s linear infinite`,
                animationDelay: `${dot.delay}s`,
              }}
            />
          ))}
        </div>
        
        <div className="h-[calc(100vh-4rem)] grid place-items-center">
          <div className="flex flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-3xl font-bold mb-8 text-foreground text-center">Contribution</h2>
                <ul className="text-xl space-y-4 text-center">
                  <li className="text-muted-foreground">Jordyn A - Front End Development</li>
                  <li className="text-muted-foreground">Nicholas F - Front End Development</li>
                  <li className="text-muted-foreground">Aiden Z - Back End Development</li>
                  <li className="text-muted-foreground">Anthony L - Back End Development</li>
                </ul>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }