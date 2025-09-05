import { writable } from 'svelte/store';

console.log('stores.js: Initializing stores');

export const gameRecords = writable([]);
export const isLoading = writable(true);
export const basePath = writable(import.meta.env?.BASE_URL || "");

// Function to create URL-friendly slugs from game names
export function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Remove duplicate hyphens
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
}

console.log('stores.js: Stores initialized - gameRecords, isLoading, and basePath');