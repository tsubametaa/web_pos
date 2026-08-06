import { api } from './api';

class AppState {
	user = $state<any>(null);
	settings = $state<any>(null);
	needSetup = $state<boolean>(false);
	initialized = $state<boolean>(false);
	theme = $state<'light' | 'dark'>('light');

	setUser(user: any) {
		this.user = user;
		if (typeof localStorage !== 'undefined') {
			if (user && user.email) {
				localStorage.setItem('auth_email', user.email);
				localStorage.setItem('auth_user', JSON.stringify(user));
			} else {
				localStorage.removeItem('auth_email');
				localStorage.removeItem('auth_user');
			}
		}
	}

	async initialize() {
		// Load cached user from localStorage first to prevent flash of login screen
		if (typeof localStorage !== 'undefined') {
			const storedUser = localStorage.getItem('auth_user');
			if (storedUser) {
				try {
					this.user = JSON.parse(storedUser);
				} catch (e) {
					this.user = null;
				}
			}

			const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
			if (storedTheme) {
				this.theme = storedTheme;
				document.documentElement.setAttribute('data-theme', storedTheme);
			} else {
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				this.theme = prefersDark ? 'dark' : 'light';
				document.documentElement.setAttribute('data-theme', this.theme);
			}
		}

		try {
			// Check if setup is needed
			const setupRes = await api.get('/auth/setup-needed').catch(() => ({ needSetup: false }));
			this.needSetup = setupRes.needSetup;

			// Verify auth session with backend
			const meRes = await api.get('/auth/me');
			if (meRes && meRes.success) {
				this.setUser(meRes.user);
			} else {
				this.setUser(null);
			}
		} catch (err) {
			console.warn('[appState] Session check error:', err);
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
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('theme', target);
		}
		document.documentElement.setAttribute('data-theme', target);
	}

	async logout() {
		try {
			await api.post('/auth/logout', {});
		} catch (err) {
			console.error('Logout error:', err);
		} finally {
			this.setUser(null);
			window.location.hash = '#/login';
		}
	}
}

export const appState = new AppState();
