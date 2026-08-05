export const API_BASE_URL = ((import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api').replace(/\/+$/, '');


class ApiClient {
	private async request(method: string, path: string, body?: any) {
		const url = `${API_BASE_URL}${path}`;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};

		const savedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_email') : null;
		if (savedEmail) {
			headers['Authorization'] = `Bearer ${savedEmail}`;
		}

		const options: RequestInit = {
			method,
			headers,
			credentials: 'include'
		};

		if (body) {
			options.body = JSON.stringify(body);
		}

		const response = await fetch(url, options);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
		}

		return response.json();
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
