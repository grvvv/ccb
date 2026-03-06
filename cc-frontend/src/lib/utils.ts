import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDiscount(originalPrice: number, sellingPrice: number){
  return Math.round(((originalPrice - sellingPrice) / sellingPrice) * 100);
}