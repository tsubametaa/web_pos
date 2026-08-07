import type { UICartItem, UIProduct } from '../../../types';
import { memberStore } from './member.svelte';

class CartStore {
	items = $state<UICartItem[]>([]);

	add(product: UIProduct) {
		if (product.stock <= 0) {
			return 'Stok produk habis.';
		}

		const existing = this.items.find((item) => item.product.id === product.id);
		if (existing) {
			if (existing.qty >= product.stock) {
				return `Stok tidak mencukupi. Hanya tersedia ${product.stock} ${product.unit}.`;
			}
			existing.qty += 1;
		} else {
			const customPrice = memberStore.getCustomPrice(product.sku);
			this.items.push({ product, qty: 1, customPrice });
		}
	}

	updateQty(productId: string, qty: number) {
		const existing = this.items.find((item) => item.product.id === productId);
		if (existing) {
			if (qty <= 0) {
				this.remove(productId);
				return;
			}
			if (qty > existing.product.stock) {
				existing.qty = existing.product.stock;
				return `Jumlah disesuaikan ke stok maksimal (${existing.product.stock} ${existing.product.unit}).`;
			}
			existing.qty = qty;
		}
	}

	remove(productId: string) {
		this.items = this.items.filter((item) => item.product.id !== productId);
	}

	clear() {
		this.items = [];
	}

	get totalItems() {
		return this.items.reduce((sum, item) => sum + item.qty, 0);
	}

	get totalCost() {
		return this.items.reduce((sum, item) => sum + item.qty * item.product.costPrice, 0);
	}

	get totalAmount() {
		return this.items.reduce((sum, item) => sum + item.qty * (item.customPrice ?? item.product.sellingPrice), 0);
	}
}

export const cart = new CartStore();
