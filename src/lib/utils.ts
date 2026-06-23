/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts initials from a name string (first letter of first and last name)
 * @param name - Full name
 * @returns Initials
 */
export function getInitials(name: string) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase()
  return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase()
}

/**
 * Removes undefined values recursively from an object by leveraging JSON serialization.
 * This is particularly useful for cleaning objects before sending to Firestore,
 * which does not accept undefined values.
 * @param obj - Object to clean
 * @returns Cleaned object without any undefined fields
 */
export function removeUndefined<T>(obj: T): T {
  if (obj === undefined) return obj
  return JSON.parse(JSON.stringify(obj))
}
