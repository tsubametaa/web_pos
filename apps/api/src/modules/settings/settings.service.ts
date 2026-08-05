import bcrypt from 'bcryptjs';
import { eq, isNull, or } from 'drizzle-orm';
import { db, settings, users } from '../../db';

export interface SettingsInput {
	businessName: string;
	businessAddress?: string;
	businessPhone?: string;
	currencySymbol?: string;
	lowStockThreshold?: number;
	taxRate?: number;
	receiptFooter?: string;
}

export class SettingsService {
	private getUserCondition(userId: string) {
		return or(eq(settings.userId, userId), isNull(settings.userId));
	}

	async getSettings(userId: string) {
		const condition = this.getUserCondition(userId);
		const result = await db.select().from(settings).where(condition).limit(1);
		return result[0] || null;
	}

	async updateSettings(userId: string, data: SettingsInput, userEmail?: string) {
		const condition = this.getUserCondition(userId);
		const list = await db.select().from(settings).where(condition).limit(1);

		let updated;
		if (list.length > 0) {
			const res = await db.update(settings)
				.set({
					...data,
					userId,
					updatedAt: new Date()
				})
				.where(eq(settings.id, list[0].id))
				.returning();
			updated = res[0];
		} else {
			const ownerPasswordHash = await bcrypt.hash('123456', 10);
			const res = await db.insert(settings).values({
				...data,
				userId,
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
