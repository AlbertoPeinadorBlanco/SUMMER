import { fetchApi } from '$lib/api';

class NotificationsStore {
    items = $state<any[]>([]);

    async fetch() {
        try {
            const data = await fetchApi(`/notifications?t=${Date.now()}`);
            console.log("Fetched notifications API response:", data);
            this.items = Array.isArray(data) ? data : [];
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }

    async markAsRead(id: number | string) {
        try {
            await fetchApi(`/notifications/${id}/read`, { method: 'PUT' });
            this.items = this.items.map(n => n.id === id ? { ...n, is_read: 1 } : n);
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    }

    clear() {
        this.items = [];
    }
}

export const notifications = new NotificationsStore();
