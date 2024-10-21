import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logout } from './logout';
import { Menu, Grid, MessageSquare, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white w-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-300 hover:bg-gray-700 hover:text-white p-2 rounded-md">
                  <Menu size={24} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 border border-gray-700">
                <DropdownMenuItem className="focus:bg-gray-700 focus:text-white">
                  <Link href="/dashboard" className="flex items-center w-full text-gray-300 hover:text-white">
                    <Grid className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-gray-700 focus:text-white">
                  <Link href="/chats" className="flex items-center w-full text-gray-300 hover:text-white">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chats
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-gray-700 focus:text-white">
                  <Link href="/credits" className="flex items-center w-full text-gray-300 hover:text-white">
                    <Star className="mr-2 h-4 w-4" />
                    Credits
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="focus:bg-gray-700 focus:text-white">
                  <Logout className="flex items-center w-full text-gray-300 hover:text-white" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Link href="/dashboard" className="flex items-center space-x-2">
            <BrainIcon className="h-8 w-8" />
            <span className="text-xl font-semibold">Samvad.ai</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

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