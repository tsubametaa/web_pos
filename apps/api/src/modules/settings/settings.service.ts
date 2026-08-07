import bcrypt from 'bcryptjs';
import { eq, isNull, or } from 'drizzle-orm';
import { db, settings, stores, users } from '../../db';
import type { SettingsInput } from '../../types';

export class SettingsService {
	private getUserCondition(userId: string, storeId?: string | null) {
		if (storeId) {
			return eq(settings.storeId, storeId);
		}
		return or(eq(settings.userId, userId), isNull(settings.userId));
	}

	async getSettings(userId: string, storeId?: string | null) {
		if (storeId) {
			const storeList = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
			if (storeList.length > 0) {
				const s = storeList[0];
				return {
					id: s.id,
					userId,
					storeId: s.id,
					businessName: s.name,
					logoUrl: s.logoUrl || null,
					businessAddress: s.address || '',
					businessPhone: s.phone || '',
					currency: s.currency,
					currencySymbol: s.currencySymbol,
					lowStockThreshold: 10,
					taxRate: s.taxRate,
					receiptFooter: s.receiptFooter || '',
					createdAt: s.createdAt,
					updatedAt: s.updatedAt
				};
			}
		}

		const condition = this.getUserCondition(userId, storeId);
		const result = await db.select().from(settings).where(condition).limit(1);
		return result[0] || null;
	}

	async updateSettings(userId: string, storeId: string | null | undefined, data: SettingsInput, userEmail?: string) {
		if (storeId) {
			const storeList = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
			if (storeList.length > 0) {
				const updatedStore = await db.update(stores).set({
					name: data.businessName,
					logoUrl: data.logoUrl !== undefined ? data.logoUrl : storeList[0].logoUrl,
					address: data.businessAddress !== undefined ? data.businessAddress : storeList[0].address,
					phone: data.businessPhone !== undefined ? data.businessPhone : storeList[0].phone,
					receiptFooter: data.receiptFooter !== undefined ? data.receiptFooter : storeList[0].receiptFooter,
					taxRate: data.taxRate !== undefined ? Number(data.taxRate) : storeList[0].taxRate,
					currencySymbol: data.currencySymbol !== undefined ? data.currencySymbol : storeList[0].currencySymbol,
					updatedAt: new Date()
				}).where(eq(stores.id, storeId)).returning();
				return this.getSettings(userId, storeId);
			}
		}

		const condition = this.getUserCondition(userId, storeId);
		const list = await db.select().from(settings).where(condition).limit(1);

		const { ownerPassword, ...updateData } = data;

		let updated;
		if (list.length > 0) {
			const payload: Record<string, any> = {
				...updateData,
				userId,
				storeId: storeId || null,
				updatedAt: new Date()
			};
			const res = await db.update(settings)
				.set(payload)
				.where(eq(settings.id, list[0].id))
				.returning();
			updated = res[0];
		} else {
			const ownerPasswordHash = await bcrypt.hash('123456', 10);
			const res = await db.insert(settings).values({
				businessName: data.businessName || 'Brand Utama',
				logoUrl: data.logoUrl || null,
				businessAddress: data.businessAddress || null,
				businessPhone: data.businessPhone || null,
				currency: data.currency || 'IDR',
				currencySymbol: data.currencySymbol || 'Rp',
				lowStockThreshold: data.lowStockThreshold ?? 10,
				taxRate: data.taxRate ?? 0,
				receiptFooter: data.receiptFooter || null,
				userId,
				storeId: storeId || null,
				ownerPasswordHash
			}).returning();
			updated = res[0];
		}

		// Sync businessName back to users table
		if (userEmail && data.businessName) {
			try {
				await db.update(users)
					.set({
						businessName: data.businessName,
						updatedAt: new Date()
					})
					.where(eq(users.email, userEmail));
			} catch (err) {
				console.error('[SettingsService] Failed to sync business name to user:', err);
			}
		}

		return updated;
	}

	async updatePassword(userId: string, email: string, oldPass: string, newPass: string) {
		const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
		const user = userList[0];
		if (!user) {
			throw new Error('User tidak ditemukan.');
		}

		const isValid = await bcrypt.compare(oldPass, user.passwordHash);
		if (!isValid) {
			throw new Error('Password lama salah.');
		}

		const passwordHash = await bcrypt.hash(newPass, 10);

		// Update users table
		await db.update(users)
			.set({
				passwordHash,
				updatedAt: new Date()
			})
			.where(eq(users.id, user.id));

		// Update settings table
		const condition = this.getUserCondition(userId);
		const list = await db.select().from(settings).where(condition).limit(1);
		if (list[0]) {
			await db.update(settings)
				.set({
					ownerPasswordHash: passwordHash,
					userId,
					updatedAt: new Date()
				})
				.where(eq(settings.id, list[0].id));
		}

		return { success: true };
	}
}
