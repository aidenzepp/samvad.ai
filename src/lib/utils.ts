import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function that combines Tailwind CSS classes with proper precedence.
 * 
 * This function merges class names using clsx for conditional classes and 
 * tailwind-merge for handling Tailwind CSS class conflicts. It ensures that
 * classes are properly combined while maintaining the correct specificity
 * and override behavior that Tailwind CSS expects.
 *
 * @param inputs - Array of class values that can include strings, objects, or arrays
 * @returns Merged class string with proper Tailwind CSS precedence
 * 
 * @example
 * ```ts
 * cn('px-2 py-1', 'bg-blue-500', { 'text-white': true })
 * // Returns: "px-2 py-1 bg-blue-500 text-white"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
