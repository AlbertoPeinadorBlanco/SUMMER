export const API_BASE_URL = 'http://127.0.0.1:5000/api';

export async function fetchApi(endpoint: string, init?: RequestInit) {
	const isBrowser = typeof window !== 'undefined';
	const token = isBrowser ? localStorage.getItem('auth_token') : null;

	const headers: HeadersInit = {
		...init?.headers
	};

	if (isBrowser && init?.body instanceof FormData) {
		// Browser will automatically set multipart/form-data with boundary
	} else if (!headers['Content-Type']) {
		headers['Content-Type'] = 'application/json';
	}

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...init,
		headers
	});

	if (!response.ok) {
		throw new Error(`API request failed: ${response.statusText}`);
	}

	return response.json();
}
