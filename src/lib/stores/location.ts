import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const regions = [
    {
        name: 'Costa Occidental',
        beaches: [
            { name: 'Tapia de Casariego', lat: 43.57, lon: -6.94 },
            { name: 'Playa de Navia', lat: 43.55, lon: -6.72 },
            { name: 'Luarca (Playa del Barco)', lat: 43.55, lon: -6.54 },
            { name: 'Cabo Busto', lat: 43.57, lon: -6.24 }
        ]
    },
    {
        name: 'Costa Central',
        beaches: [
            { name: 'Salinas', lat: 43.57, lon: -5.96 },
            { name: 'Xagó', lat: 43.60, lon: -5.91 },
            { name: 'San Lorenzo (Gijón)', lat: 43.54, lon: -5.65 },
            { name: 'El Arbeyal (Gijón)', lat: 43.54, lon: -5.69 },
            { name: 'Playa de Verdicio', lat: 43.59, lon: -5.87 }
        ]
    },
    {
        name: 'Costa Oriental',
        beaches: [
            { name: 'Rodiles', lat: 43.53, lon: -5.38 },
            { name: 'Playa de Poo', lat: 43.43, lon: -4.80 },
            { name: 'San Antolín', lat: 43.44, lon: -4.87 },
            { name: 'Playa de Toró (Llanes)', lat: 43.42, lon: -4.76 },
            { name: 'Playa de Borizo (Llanes)', lat: 43.42, lon: -4.74 }
        ]
    }
];

export const selectedBeach = writable(regions[1].beaches[2]); // San Lorenzo as default
export const userLocationName = writable<string | null>(null);
export const isGeolocationEnabled = writable<boolean>(true);

if (browser) {
    const stored = localStorage.getItem('isGeolocationEnabled');
    if (stored !== null) {
        isGeolocationEnabled.set(stored === 'true');
    }
    isGeolocationEnabled.subscribe(val => {
        localStorage.setItem('isGeolocationEnabled', val.toString());
    });
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export function findNearestBeach(userLat: number, userLon: number) {
    let nearest = null;
    let minDistance = Infinity;
    for (const region of regions) {
        for (const beach of region.beaches) {
            const distance = calculateDistance(userLat, userLon, beach.lat, beach.lon);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = beach;
            }
        }
    }
    return { beach: nearest, distance: minDistance };
}

let enabled = true;
isGeolocationEnabled.subscribe(v => enabled = v);

export function initGeolocation() {
    if (browser && navigator.geolocation && enabled) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            const nearestInfo = findNearestBeach(lat, lon);
            const defaultBeach = regions[1].beaches[2];

            // 1. Set the weather report location
            if (nearestInfo.beach && nearestInfo.distance <= 100) {
                selectedBeach.set(nearestInfo.beach);
            } else {
                selectedBeach.set(defaultBeach);
            }

            // 2. Always get actual location name for the header via reverse geocoding
            try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                if (res.ok) {
                    const data = await res.json();
                    const locationName = data.city || data.locality || data.principalSubdivision || 'Unknown Location';
                    userLocationName.set(locationName);
                } else {
                    userLocationName.set('Current Location');
                }
            } catch (e) {
                console.error('Reverse geocoding failed', e);
                userLocationName.set('Current Location');
            }
        }, (error) => {
            console.warn("Geolocation denied or failed", error);
            userLocationName.set('Unknown Location');
        });
    } else if (browser) {
        userLocationName.set('Unknown Location');
    }
}
