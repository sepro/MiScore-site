import { writable } from 'svelte/store';

console.log('stores.js: Initializing stores');

export const gameRecords = writable([]);
export const isLoading = writable(true);
export const basePath = writable(import.meta.env?.BASE_URL || "");

console.log('stores.js: Stores initialized - gameRecords, isLoading, and basePath');