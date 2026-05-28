import { writable } from 'svelte/store';
import { auth } from './auth';

let authState = null;
auth.subscribe(value => {
    authState = value;
});

function createNotificationsStore() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        fetch: async () => {
            if (!authState || !authState.isAuthenticated) return;
            try {
                const res = await fetch('http://127.0.0.1:5000/api/notifications', {
                    headers: { 'Authorization': `Bearer ${authState.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    set(data);
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        },
        markAsRead: async (id) => {
            if (!authState || !authState.isAuthenticated) return;
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/notifications/${id}/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${authState.token}` }
                });
                if (res.ok) {
                    update(nots => nots.map(n => n.id === id ? { ...n, is_read: 1 } : n));
                }
            } catch (err) {
                console.error("Failed to mark notification as read", err);
            }
        },
        clear: () => set([])
    };
}

export const notifications = createNotificationsStore();
