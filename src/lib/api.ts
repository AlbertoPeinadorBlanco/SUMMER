export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_URL || API_BASE_URL.replace('/api', '');

export function getMediaUrl(path: string | undefined | null): string {
	if (!path) return '';
	if (path.startsWith('http')) return path;
	return `${MEDIA_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function getAvatarPlaceholder(nameFallback: string | undefined | null, color: string | undefined | null = 'random'): string {
	const cleanColor = (!color || color === 'random') ? 'random' : color.replace('#', '');
	const cleanName = nameFallback || 'U';
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=${cleanColor}`;
}

// Attempt a silent token refresh using the refresh cookie
async function refreshAccessToken(): Promise<boolean> {
	try {
		const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
			method: 'POST',
			credentials: 'include' // sends the refreshToken cookie
		});
		return res.ok;
	} catch {
		return false;
	}
}

export async function fetchApi(endpoint: string, init?: RequestInit) {
	const options: RequestInit = {
		...init,
		credentials: 'include', // Always send cookies (accessToken, refreshToken)
		headers: {
			...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
			...init?.headers
		}
	};

	let response = await fetch(`${API_BASE_URL}${endpoint}`, options);

	// If access token expired, try to refresh silently and retry once
	if (response.status === 401) {
		const refreshed = await refreshAccessToken();
		if (refreshed) {
			response = await fetch(`${API_BASE_URL}${endpoint}`, options);
		}
	}

	if (!response.ok) {
		let errorData: any = {};
		try {
			errorData = await response.json();
		} catch {
			// ignore parse error
		}
		const error: any = new Error(errorData.message || `API request failed: ${response.statusText}`);
		error.errors = errorData.errors;
		error.status = response.status;
		throw error;
	}

	// Handle empty responses (e.g. 204 No Content)
	const text = await response.text();
	return text ? JSON.parse(text) : null;
}
