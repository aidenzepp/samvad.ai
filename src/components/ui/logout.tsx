"use client";
import React from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

/**
 * Props interface for the Logout component
 * 
 * @interface LogoutProps
 * @property {string} [className] - Optional CSS class name to style the logout button
 */
interface LogoutProps {
  className?: string;
}

/**
 * Logout component that provides a button to log users out
 * 
 * This component renders a button with a logout icon that, when clicked,
 * makes a POST request to the logout endpoint and redirects to the portal page.
 * It handles errors gracefully by logging them to the console.
 *
 * @component
 * @param {LogoutProps} props - The component props
 * @returns {React.ReactElement} A styled logout button
 *
 * @example
 * ```tsx
 * <Logout className="my-custom-class" />
 * ```
 */
export const Logout: React.FC<LogoutProps> = ({ className }) => {
  const router = useRouter();

  /**
   * Handles the logout process when the button is clicked
   * Makes a POST request to the logout endpoint and redirects on success
   * Logs any errors to the console
   */
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