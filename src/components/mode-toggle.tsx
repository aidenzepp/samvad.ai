"use client"
 
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * ModeToggle component that provides theme switching functionality
 * 
 * This component renders a dropdown menu with options to switch between light, dark,
 * and system color themes. It uses the next-themes library for theme management and
 * displays animated sun/moon icons to indicate the current theme state.
 *
 * The dropdown trigger shows a sun icon in light mode and moon icon in dark mode,
 * with smooth transition animations between states. The menu provides three options:
 * - Light: Forces light theme
 * - Dark: Forces dark theme 
 * - System: Uses system preferences
 *
 * @component
 * @returns {React.ReactElement} A dropdown menu for theme switching
 *
 * @example
 * ```tsx
 * <ModeToggle />
 * ```
 */
export function ModeToggle() {
  const { setTheme } = useTheme()
 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="hover:bg-accent/50 focus:bg-accent/50"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="hover:bg-accent/50 focus:bg-accent/50"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="hover:bg-accent/50 focus:bg-accent/50"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}