import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

// Exchange rates relative to EUR (mocked for demo)
const rates: Record<CurrencyCode, number> = {
	EUR: 1,
	USD: 1.09,
	GBP: 0.86
};

const symbols: Record<CurrencyCode, string> = {
	USD: '$',
	EUR: '€',
	GBP: '£'
};

const initialCurrency =
	(browser ? (window.localStorage.getItem('currency') as CurrencyCode) : null) || 'EUR';

export const currency = writable<CurrencyCode>(initialCurrency);
export const currencySymbol = derived(currency, ($c) => symbols[$c]);

if (browser) {
	currency.subscribe((value) => {
		window.localStorage.setItem('currency', value);
	});
}

// Helper to format a base EUR price to the selected currency
export const formatPrice = derived(currency, ($currency) => {
	return (basePriceEur: number) => {
		const converted = basePriceEur * rates[$currency];
		const symbol = symbols[$currency];
		// Return formatted string, e.g., "€50/hr"
		return `${symbol}${Math.round(converted)}/hr`;
	};
});
