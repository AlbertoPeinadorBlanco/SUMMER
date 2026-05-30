import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

// Initial value defaults to 'light' if not in browser
const initialValue: Theme = 'light';

export const theme = writable<Theme>(initialValue);

if (browser) {
	const storedTheme = localStorage.getItem('theme') as Theme | null;
	const osPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	
	const currentTheme = storedTheme || (osPrefersDark ? 'dark' : 'light');
	theme.set(currentTheme);

	theme.subscribe((value) => {
		localStorage.setItem('theme', value);
		if (value === 'dark') {
			document.documentElement.setAttribute('data-theme', 'dark');
		} else {
			document.documentElement.removeAttribute('data-theme');
		}
	});
}

export function toggleTheme() {
	theme.update((t) => (t === 'light' ? 'dark' : 'light'));
}
