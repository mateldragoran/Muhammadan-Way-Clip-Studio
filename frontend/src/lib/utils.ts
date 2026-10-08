import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes cleanly, resolving conflicts.
 * This is essential for building reusable UI components (like Buttons)
 * that adapt to both desktop and mobile states.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}