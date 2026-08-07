import { eq, and, isNull } from 'drizzle-orm';
import { db, stores, settings, users, products, transactions, Store } from '../../db';
import type { StoreInput } from '../../types';

export class StoresService {
	// Get all stores for an owner user.
	async getStores(ownerUserId: string, userBusinessName?: string): Promise<Store[]> {
		let list: Store[] = (await db.select().from(stores).where(eq(stores.createdById, ownerUserId))) as Store[];

		if (list.length === 0) {
			const initialName = userBusinessName || 'Brand Utama';
			const newStore: Store[] = (await db.insert(stores).values({
				name: initialName,
				createdById: ownerUserId,
				createdAt: new Date(),
				updatedAt: new Date()
			}).returning()) as Store[];

			list = newStore;
		}

		// Auto-backfill existing legacy products, transactions, & settings to primary store
		if (list.length > 0) {
			const primaryStoreId = list[0].id;
			await db.update(settings).set({ storeId: primaryStoreId }).where(and(eq(settings.userId, ownerUserId), isNull(settings.storeId)));
			await db.update(products).set({ storeId: primaryStoreId }).where(and(eq(products.userId, ownerUserId), isNull(products.storeId)));
			await db.update(transactions).set({ storeId: primaryStoreId }).where(and(eq(transactions.userId, ownerUserId), isNull(transactions.storeId)));
		}

		return list;
	}

	async getStoreById(storeId: string): Promise<Store | null> {
		const list: Store[] = (await db.select().from(stores).where(eq(stores.id, storeId)).limit(1)) as Store[];
		return list[0] || null;
	}

	async createStore(ownerUserId: string, data: StoreInput): Promise<Store> {
		const result: Store[] = (await db.insert(stores).values({
			name: data.name.trim(),
			logoUrl: data.logoUrl || null,
			address: data.address || null,
			phone: data.phone || null,
			receiptFooter: data.receiptFooter || null,
			taxRate: data.taxRate !== undefined ? Number(data.taxRate) : 0,
			currency: data.currency || 'IDR',
			currencySymbol: data.currencySymbol || 'Rp',
			createdById: ownerUserId,
			createdAt: new Date(),
			updatedAt: new Date()
		}).returning()) as Store[];

		return result[0];
	}

	async updateStore(storeId: string, ownerUserId: string, data: Partial<StoreInput>): Promise<Store> {
		const existing: Store[] = (await db.select().from(stores).where(and(eq(stores.id, storeId), eq(stores.createdById, ownerUserId))).limit(1)) as Store[];
		if (existing.length === 0) {
			throw new Error('Brand / Store tidak ditemukan atau Anda tidak memiliki akses.');
		}

		const updatePayload: Record<string, any> = {
			updatedAt: new Date()
		};

		if (data.name !== undefined) updatePayload.name = data.name.trim();
		if (data.logoUrl !== undefined) updatePayload.logoUrl = data.logoUrl || null;
		if (data.address !== undefined) updatePayload.address = data.address || null;
		if (data.phone !== undefined) updatePayload.phone = data.phone || null;
		if (data.receiptFooter !== undefined) updatePayload.receiptFooter = data.receiptFooter || null;
		if (data.taxRate !== undefined) updatePayload.taxRate = Number(data.taxRate) || 0;
		if (data.currencySymbol !== undefined) updatePayload.currencySymbol = data.currencySymbol || 'Rp';

		const updated: Store[] = (await db.update(stores)
			.set(updatePayload)
			.where(eq(stores.id, storeId))
			.returning()) as Store[];

		return updated[0];
	}

	async deleteStore(storeId: string, ownerUserId: string): Promise<void> {
		const allStores = await this.getStores(ownerUserId);
		if (allStores.length <= 1) {
			throw new Error('Tidak dapat menghapus brand terakhir. Minimal harus ada 1 brand.');
		}

		await db.delete(stores).where(and(eq(stores.id, storeId), eq(stores.createdById, ownerUserId)));
	}
}
