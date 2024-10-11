'use client'

import { usePathname } from 'next/navigation';
import Link from "next/link"
import { cn } from '@/lib/utils';
import React from 'react';
import { Logout } from './logout';

export function Navbar() {
  const pathname = usePathname();

  const navItemClass = 'flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:bg-gray-700 hover:text-gray-100';
  const activeClass = 'text-gray-100 bg-gray-700';
  const inactiveClass = 'text-gray-400';

  return (
    <div className="hidden border-r border-gray-700 bg-gray-800 lg:block w-64">
      <div className="flex flex-col h-screen">
        <div className="flex h-[60px] items-center border-b border-gray-700 px-4">
          <Link className="flex items-center gap-2 text-sm font-semibold text-gray-100" href="/home">
            <BrainIcon className="h-5 w-5" />
            <span>Samvad.ai</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-2 flex flex-col">
          <div>
            <Link
              className={cn(navItemClass, 
                pathname === '/home' ? activeClass : inactiveClass)}
              href="/home"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>
            <Link
              className={cn(navItemClass, 
                pathname === '/credits' ? activeClass : inactiveClass)}
              href="/credits"
            >
              <EllipsisIcon className="h-4 w-4" />
              Credits
            </Link>
          </div>
          <div className="mt-auto border-t border-gray-700 pt-2">
            <Logout className={cn(navItemClass, inactiveClass)} />
          </div>
        </nav>
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