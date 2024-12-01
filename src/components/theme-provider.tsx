"use client"
 
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

/**
 * Theme provider component that enables theme switching functionality
 * 
 * This component wraps the application to provide theme context using next-themes.
 * It enables switching between light, dark and system color themes throughout
 * the application. The provider accepts all next-themes configuration options
 * through props.
 *
 * @component
 * @param {ThemeProviderProps} props - The theme provider configuration props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 * @returns {React.ReactElement} Provider component with theme context
 *
 * @example
 * ```tsx
 * <ThemeProvider attribute="class">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}