import { browser } from '$app/environment';
import { init, register, getLocaleFromNavigator, locale } from 'svelte-i18n';

register('en', () => import('./en.json'));
register('es', () => import('./es.json'));

const defaultLocale = 'es';

export function setupI18n() {
	init({
		fallbackLocale: defaultLocale,
		initialLocale: browser
			? window.localStorage.getItem('lang') || getLocaleFromNavigator()
			: defaultLocale
	});

	if (browser) {
		locale.subscribe((value) => {
			if (value) {
				window.localStorage.setItem('lang', value);
				document.documentElement.lang = value;
			}
		});
	}
}
