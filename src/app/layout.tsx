import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

/**
 * Root layout component that wraps the entire application
 * 
 * This component serves as the main layout wrapper for the Next.js application.
 * It sets up essential configurations including:
 * - Font configuration using Inter font
 * - Theme provider for consistent styling
 * - Toast notifications
 * - HTML language and hydration settings
 *
 * The layout ensures consistent styling and functionality across all pages
 * while providing theme switching capabilities and toast notifications.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped by the layout
 * @returns {React.ReactElement} The root layout structure of the application
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}