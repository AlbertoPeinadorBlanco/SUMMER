import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type PricingItem = {
    id: number;
    item_key: string;
    price: string;
    currency: string;
    description: string;
};

// Fallbacks in case API fails
export const pricings = writable<Record<string, number>>({
    premium_subscription: 9.99,
    summer_pass: 49.99,
    video_upgrade: 9.99,
    link_upgrade: 4.99,
    badge_upgrade: 14.99,
    shop_advert: 29.99,
    featured_instructor: 20.00,
    bump_advert: 2.00
});

if (browser) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_URL}/pricings`)
        .then(res => res.json())
        .then((data: PricingItem[]) => {
            const priceMap: Record<string, number> = {};
            data.forEach(item => {
                priceMap[item.item_key] = parseFloat(item.price);
            });
            pricings.update(current => ({ ...current, ...priceMap }));
        })
        .catch(err => {
            console.error('Failed to fetch pricings:', err);
        });
}
