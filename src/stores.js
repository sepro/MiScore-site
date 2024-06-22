import { writable } from 'svelte/store';

export const gameRecords = writable([]);
export const isLoading = writable(true);