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
		// Step 1: Immediately load cached user from localStorage to prevent login flash
		if (typeof localStorage !== 'undefined') {
			const storedUser = localStorage.getItem('auth_user');
			if (storedUser) {
				try {
					this.user = JSON.parse(storedUser);
				} catch {
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

		// Step 2: Check if initial setup is needed (non-critical, ignore errors)
		try {
			const setupRes = await api.get('/auth/setup-needed');
			this.needSetup = setupRes.needSetup ?? false;
		} catch {
			// Not critical — keep previous needSetup value
		}

		// Step 3: Verify session with backend
		// CRITICAL RULE: Only clear local session if the server EXPLICITLY returns 401.
		// Network errors, timeouts, or cold-start failures must NOT clear the session —
		// the user should remain logged in and retry on next page load.
		try {
			const meRes = await api.get('/auth/me');
			if (meRes && meRes.success && meRes.user) {
				// Session confirmed — update local storage with fresh data
				this.setUser(meRes.user);
			} else if (meRes && !meRes.success) {
				// Server explicitly says session is invalid
				console.warn('[appState] Server rejected session — clearing local auth.');
				this.setUser(null);
			}
			// If meRes is null/undefined for any reason, keep existing user from localStorage
		} catch (err: any) {
			// If it's a server-confirmed 401, clear session
			if (err?.isAuthError || err?.status === 401) {
				console.warn('[appState] 401 from server — clearing local auth.');
				this.setUser(null);
			} else {
				// Network error / timeout / cold start — keep the user logged in!
				console.warn('[appState] Session check failed (network/timeout), keeping cached session:', err?.message);
			}
		}

		// Step 4: Fetch settings (non-critical — keep null on error)
		if (this.user) {
			try {
				const settingsRes = await api.get('/settings');
				if (settingsRes?.success) {
					this.settings = settingsRes.settings;
				}
			} catch {
				// Settings are nice-to-have; don't crash the app
			}
		}

		this.initialized = true;
	}

	// Refresh only the settings data without re-checking auth session
	async refreshSettings() {
		try {
			const settingsRes = await api.get('/settings');
			if (settingsRes?.success) {
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
