import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

// Fallback rates relative to EUR in case the API fails
const fallbackRates: Record<CurrencyCode, number> = {
	EUR: 1,
	USD: 1.09,
	GBP: 0.86
};

export const exchangeRates = writable<Record<CurrencyCode, number>>(fallbackRates);

if (browser) {
	// Fetch live rates from open.er-api.com
	fetch('https://open.er-api.com/v6/latest/EUR')
		.then((res) => res.json())
		.then((data) => {
			if (data && data.rates) {
				exchangeRates.set({
					EUR: 1,
					USD: data.rates.USD || fallbackRates.USD,
					GBP: data.rates.GBP || fallbackRates.GBP
				});
			}
		})
		.catch((err) => {
			console.error('Failed to fetch live exchange rates, using fallbacks:', err);
		});
}

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
export const formatPrice = derived([currency, exchangeRates], ([$currency, $rates]) => {
	return (basePriceEur: number, isCourse: boolean = false) => {
		const converted = basePriceEur * $rates[$currency];
		const symbol = symbols[$currency];
		// Return formatted string, e.g., "€50/hr" or "€150"
		return `${symbol}${Math.round(converted)}${isCourse ? '' : '/hr'}`;
	};
});
