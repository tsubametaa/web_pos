import { api } from './api';
import type { UIStore } from '../types';

class ActiveStoreManager {
	stores = $state<UIStore[]>([]);
	activeStoreId = $state<string | null>(
		typeof localStorage !== 'undefined' ? localStorage.getItem('active_store_id') : null
	);
	isLoading = $state(false);

	get currentStore(): UIStore | null {
		if (!this.stores.length) return null;
		if (this.activeStoreId) {
			const found = this.stores.find((s) => s.id === this.activeStoreId);
			if (found) return found;
		}
		return this.stores[0] || null;
	}

	async loadStores(): Promise<UIStore[]> {
		this.isLoading = true;
		try {
			const res = await api.get('/stores');
			if (res.success && Array.isArray(res.stores)) {
				this.stores = res.stores;

				// If no active store selected or invalid ID, default to first store
				if (this.stores.length > 0) {
					const validActive = this.stores.find((s) => s.id === this.activeStoreId);
					if (!validActive) {
						this.selectStore(this.stores[0].id, false);
					}
				}
			}
		} catch (err) {
			console.error('[activeStore] Error loading stores:', err);
		} finally {
			this.isLoading = false;
		}
		return this.stores;
	}

	selectStore(storeId: string, reload = true) {
		this.activeStoreId = storeId;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('active_store_id', storeId);
		}
		if (reload && typeof window !== 'undefined') {
			window.location.reload();
		}
	}
}

export const activeStore = new ActiveStoreManager();
