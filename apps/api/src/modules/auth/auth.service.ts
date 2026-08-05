import bcrypt from 'bcryptjs';
import { eq, count } from 'drizzle-orm';
import { db, users, settings } from '../../db';

export class AuthService {
	async register(businessName: string, email: string, password: string) {
		// Check if email already registered
		const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
		if (existingUser.length > 0) {
			throw new Error('Email sudah terdaftar.');
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 10);

		// Insert user
		const newUser = await db.insert(users).values({
			businessName,
			email,
			passwordHash,
			createdAt: new Date(),
			updatedAt: new Date()
		}).returning();

		// Create initial business settings for the registered user
		await db.insert(settings).values({
			userId: newUser[0].id,
			businessName,
			ownerPasswordHash: passwordHash,
			currency: 'IDR',
			currencySymbol: 'Rp',
			lowStockThreshold: 10,
			taxRate: 0,
			receiptFooter: 'Terima kasih atas kunjungan Anda!'
		});

		return { id: newUser[0].id, email: newUser[0].email, businessName: newUser[0].businessName };
	}

	async login(email: string, password: string) {
		const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
		const user = result[0];

		if (!user) {
			throw new Error('Email atau password salah.');
		}

		const isValid = await bcrypt.compare(password, user.passwordHash);
		if (!isValid) {
			throw new Error('Email atau password salah.');
		}

		return { id: user.id, email: user.email, businessName: user.businessName };
	}

	async checkSetupNeeded() {
		const result = await db.select({ value: count() }).from(users);
		return (result[0]?.value || 0) === 0;
	}
}
