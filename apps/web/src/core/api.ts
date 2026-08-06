export const API_BASE_URL = ((import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api').replace(/\/+$/, '');

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

class ApiClient {
	private async request(method: string, path: string, body?: any, retries = 2): Promise<any> {
		const url = `${API_BASE_URL}${path}`;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};

		const savedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_email') : null;
		if (savedEmail) {
			headers['Authorization'] = `Bearer ${savedEmail}`;
			headers['X-User-Email'] = savedEmail;
		}

		const options: RequestInit = {
			method,
			headers,
			credentials: 'include'
		};

		if (body && method !== 'GET') {
			options.body = JSON.stringify(body);
		}

		let lastError: any;
		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				// Add timeout to each request (15 seconds) — prevents hanging on cold starts
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 15000);
				options.signal = controller.signal;

				const response = await fetch(url, options);
				clearTimeout(timeoutId);

				// Successful response
				if (response.ok) {
					return response.json();
				}

				// Server returned an error status
				const errorData = await response.json().catch(() => ({}));

				// 401 = server explicitly says not authenticated
				if (response.status === 401) {
					// Throw a special error type so the caller knows it is an auth failure
					const authError = new Error(errorData.error || 'Sesi tidak valid atau belum login.');
					(authError as any).isAuthError = true;
					(authError as any).status = 401;
					throw authError;
				}

				// Other 4xx errors — do not retry, throw immediately
				if (response.status >= 400 && response.status < 500) {
					throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
				}

				// 5xx errors — retry
				lastError = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
				if (attempt < retries) {
					console.warn(`[API] ${method} ${path} — server error ${response.status}, retrying in ${(attempt + 1) * 500}ms...`);
					await sleep((attempt + 1) * 500);
					continue;
				}
				throw lastError;
			} catch (err: any) {
				// Auth errors — never retry
				if (err.isAuthError) throw err;

				// AbortError = timeout
				if (err.name === 'AbortError') {
					lastError = new Error('Request timed out. Periksa koneksi internet Anda.');
					console.warn(`[API] ${method} ${path} — timeout on attempt ${attempt + 1}`);
				} else {
					lastError = err;
				}

				// Retry if we have attempts left
				if (attempt < retries) {
					console.warn(`[API] ${method} ${path} — network error, retrying in ${(attempt + 1) * 800}ms...`);
					await sleep((attempt + 1) * 800);
					continue;
				}
				throw lastError;
			}
		}

		throw lastError;
	}

	async get(path: string) {
		return this.request('GET', path);
	}

	async post(path: string, body: any) {
		return this.request('POST', path, body);
	}

	async put(path: string, body: any) {
		return this.request('PUT', path, body);
	}

	async delete(path: string) {
		return this.request('DELETE', path);
	}
}

export const api = new ApiClient();
