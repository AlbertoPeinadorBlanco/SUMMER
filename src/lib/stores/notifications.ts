import { writable } from 'svelte/store';
import { auth } from './auth';
import { fetchApi } from '$lib/api';

let authState: any = null;
auth.subscribe(value => {
    authState = value;
});

function createNotificationsStore() {
    const { subscribe, set, update } = writable<any[]>([]);

    return {
        subscribe,
        fetch: async () => {
            if (!authState || !authState.isAuthenticated) return;
            try {
                const data = await fetchApi('/notifications');
                set(data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        },
        markAsRead: async (id: number | string) => {
            if (!authState || !authState.isAuthenticated) return;
            try {
                await fetchApi(`/notifications/${id}/read`, {
                    method: 'PUT'
                });
                update(nots => nots.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            } catch (err) {
                console.error("Failed to mark notification as read", err);
            }
        },
        clear: () => set([])
    };
}

export const notifications = createNotificationsStore();
