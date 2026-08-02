import { api } from './api';

class AppState {
	user = $state<any>(null);
	settings = $state<any>(null);
	needSetup = $state<boolean>(false);
	initialized = $state<boolean>(false);
	theme = $state<'light' | 'dark'>('light');

	async initialize() {
		// Load theme from localStorage
		const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
		if (storedTheme) {
			this.theme = storedTheme;
			document.documentElement.setAttribute('data-theme', storedTheme);
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			this.theme = prefersDark ? 'dark' : 'light';
			document.documentElement.setAttribute('data-theme', this.theme);
		}

		try {
			// Check if setup is needed
			const setupRes = await api.get('/auth/setup-needed');
			this.needSetup = setupRes.needSetup;

			// Check auth session
			const meRes = await api.get('/auth/me');
			if (meRes.success) {
				this.user = meRes.user;
			}
		} catch (err) {
			this.user = null;
		}

		try {
			// Fetch settings
			const settingsRes = await api.get('/settings');
			if (settingsRes.success) {
				this.settings = settingsRes.settings;
			}
		} catch (err) {
			this.settings = null;
		}

		this.initialized = true;
	}

	// Refresh only the settings data without re-checking auth session
	async refreshSettings() {
		try {
			const settingsRes = await api.get('/settings');
			if (settingsRes.success) {
				this.settings = settingsRes.settings;
			}
		} catch (err) {
			console.error('[appState] Failed to refresh settings:', err);
		}
	}

	toggleTheme() {
		const target = this.theme === 'light' ? 'dark' : 'light';
		this.theme = target;
		localStorage.setItem('theme', target);
		document.documentElement.setAttribute('data-theme', target);
	}

	async logout() {
		try {
			await api.post('/auth/logout', {});
		} catch (err) {
			console.error('Logout error:', err);
		} finally {
			this.user = null;
			window.location.hash = '#/login';
		}
	}
}

export const appState = new AppState();
