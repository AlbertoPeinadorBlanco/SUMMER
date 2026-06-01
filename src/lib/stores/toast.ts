import { writable } from 'svelte/store';

export const toastMessage = writable<string | null>(null);
export const toastType = writable<'success' | 'error' | 'info'>('info');

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    toastMessage.set(message);
    toastType.set(type);
    setTimeout(() => {
        toastMessage.set(null);
    }, 4000);
}
