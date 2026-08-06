import bcrypt from 'bcryptjs';
import { eq, count } from 'drizzle-orm';
import { db, users, settings } from '../../db';

export class AuthService {
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

		return {
			id: user.id,
			email: user.email,
			businessName: user.businessName,
			role: user.role || 'super_admin',
			createdById: user.createdById || null
		};
	}
}
