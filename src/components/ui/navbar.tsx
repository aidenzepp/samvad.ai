import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Logout } from './logout';
import { Menu, Grid, MessageSquare, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";

/**
 * Navigation bar component that provides the main navigation interface
 * 
 * This component renders a responsive navigation bar with a dropdown menu for main navigation,
 * branding elements, and theme toggle functionality. It includes links to key application
 * areas like Dashboard, Chats, and Credits, as well as a logout option.
 *
 * The navbar is styled consistently with the application's theme and includes hover states
 * and transitions for interactive elements. It uses next/navigation for client-side routing
 * and integrates with the theme system.
 *
 * @component
 * @returns {React.ReactElement} A styled navigation bar with dropdown menu and theme toggle
 *
 * @example
 * ```tsx
 * <Navbar />
 * ```
 */
export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-background border-b border-border">
      <div className="relative h-14 flex items-center justify-between px-4">
        <div className="flex items-center h-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 inline-flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/50 transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background border-border">
              <DropdownMenuItem className="hover:bg-accent/50 focus:bg-accent/50">
                <Link href="/dashboard" className="flex items-center w-full">
                  <Grid className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent/50 focus:bg-accent/50">
                <Link href="/chats" className="flex items-center w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Chats</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent/50 focus:bg-accent/50">
                <Link href="/credits" className="flex items-center w-full">
                  <Star className="mr-2 h-4 w-4" />
                  <span>Credits</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="hover:bg-accent/50 focus:bg-accent/50">
                <Logout className="flex items-center w-full" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-foreground"
          >
            <BrainIcon className="h-6 w-6" />
            <span className="text-lg font-semibold">Samvad.ai</span>
          </Link>
        </div>

        <div className="flex items-center h-full">
          <div className="h-9 w-9 inline-flex items-center justify-center">
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Custom brain icon component used as the application logo
 * 
 * This component renders a custom SVG brain icon that serves as the main logo
 * for the application. It inherits color from its parent and supports all standard
 * SVG props for customization.
 *
 * @component
 * @param {React.SVGProps<SVGSVGElement>} props - Standard SVG element props
 * @returns {React.ReactElement} An SVG icon of a brain
 *
 * @example
 * ```tsx
 * <BrainIcon className="h-6 w-6" />
 * ```
 */
function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}