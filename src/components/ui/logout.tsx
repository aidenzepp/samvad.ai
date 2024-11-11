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

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/logout`);
      router.push('/portal');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button onClick={handleLogout} className={className}>
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </button>
  );
};