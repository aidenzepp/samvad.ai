'use client'
import { usePathname } from 'next/navigation';
import Link from "next/link"
import { cn } from '@/lib/utils';
import React from 'react';

export function Navbar() {
  const pathname = usePathname();
  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-64"> {/* Changed width here */}
      <div className="hidden lg:block h-screen border-r bg-gray-100/40 dark:bg-gray-800/40">
        <div className="flex h-[60px] items-center border-b px-4"> {/* Reduced padding */}
          <Link className="flex items-center gap-2 text-sm font-semibold" href="/home">
            <BrainIcon className="h-5 w-5" /> {/* Reduced icon size */}
            <span className="">Samvad.ai</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link
              className={cn('flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50', 
              pathname === '/' ? 'text-gray-900 text-gray-900 dark:text-gray-50 bg-gray-100 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400')}
              href="/home"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>
            <Link
              className={cn('flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50', 
              pathname === '/' ? 'text-gray-900 text-gray-900 dark:text-gray-50 bg-gray-100 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400')}
              href="/credits"
            >
              <EllipsisIcon className="h-4 w-4" />
              Credits
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

function HomeIcon(props:any) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function BrainIcon(props:any) {
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
  )
}

function EllipsisIcon(props:any) {
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}