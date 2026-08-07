import type { UIMember } from '../../../types';
import { cart } from './cart.svelte';
import { api } from '../../../core/api';

class MemberStore {
	current = $state<UIMember | null>(null);
	loading = $state(false);
	error = $state<string | null>(null);

	get priceMap(): Map<string, number> {
		const map = new Map<string, number>();
		if (this.current?.prices) {
			for (const p of this.current.prices) {
				map.set(p.sku.toUpperCase(), p.customPrice);
			}
		}
		return map;
	}

	getCustomPrice(sku: string): number | undefined {
		if (!sku) return undefined;
		return this.priceMap.get(sku.trim().toUpperCase());
	}

	async selectMember(member: UIMember): Promise<boolean> {
		if (!member.isActive) {
			this.error = 'Akun member ini statusnya tidak aktif.';
			this.current = null;
			return false;
		}

		this.loading = true;
		this.error = null;

		try {
			if (!member.prices) {
				const res = await api.get(`/members/${member.id}`);
				if (res.success && res.member) {
					this.current = res.member;
				} else {
					this.current = member;
				}
			} else {
				this.current = member;
			}

			this._applyPricesToCart();
			return true;
		} catch {
			this.current = member;
			this._applyPricesToCart();
			return true;
		} finally {
			this.loading = false;
		}
	}

	async confirm(phone: string): Promise<boolean> {
		const cleanPhone = phone.trim();
		if (!cleanPhone) {
			this.error = 'Masukkan nomor HP member terlebih dahulu.';
			return false;
		}

		this.loading = true;
		this.error = null;

		try {
			const res = await api.get(`/members/lookup?phone=${encodeURIComponent(cleanPhone)}`);
			if (res.success && res.member) {
				if (!res.member.isActive) {
					this.error = 'Akun member ini statusnya tidak aktif.';
					this.current = null;
					return false;
				}
				this.current = res.member;
				this._applyPricesToCart();
				return true;
			} else {
				this.error = 'Nomor HP tidak terdaftar sebagai member.';
				this.current = null;
				return false;
			}
		} catch (err: any) {
			this.error = err.message || 'Gagal mengecek member.';
			this.current = null;
			return false;
		} finally {
			this.loading = false;
		}
	}

	remove() {
		this._resetCartPrices();
		this.current = null;
		this.error = null;
	}

	private _applyPricesToCart() {
		for (const item of cart.items) {
			item.customPrice = this.getCustomPrice(item.product.sku);
		}
	}

	private _resetCartPrices() {
		for (const item of cart.items) {
			item.customPrice = undefined;
		}
	}
}

export const memberStore = new MemberStore();
