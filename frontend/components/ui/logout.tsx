"use client";
import React from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface LogoutProps {
  className?: string;
}

export const Logout: React.FC<LogoutProps> = ({ className }) => {
  const router = useRouter();

  const handleLogout = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/logout`)
      .then(() => {
        router.push('/login');
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <button onClick={handleLogout} className={className}>
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </button>
  );
};