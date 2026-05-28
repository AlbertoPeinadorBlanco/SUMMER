import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { currency, exchangeRates, formatPrice } from './currency';

describe('currency store', () => {
	it('formats price correctly with default mock rates', () => {
		// Set to USD
		currency.set('USD');
		// Force fallback rates for test
		exchangeRates.set({
			EUR: 1,
			USD: 1.09,
			GBP: 0.86
		});

		const formatter = get(formatPrice);
		
		// 100 EUR = 109 USD
		const price = formatter(100);
		expect(price).toBe('$109/hr');
		
		// as course (no /hr)
		const coursePrice = formatter(100, true);
		expect(coursePrice).toBe('$109');
	});
});
