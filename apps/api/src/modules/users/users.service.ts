import bcrypt from 'bcryptjs';
import { eq, and, or } from 'drizzle-orm';
import { db, users } from '../../db';
import type { AuthUser } from '../../middlewares/resolveUser';

export class UsersService {
	async getUsers(ownerUser: AuthUser) {
		if (ownerUser.role !== 'super_admin') {
			throw new Error('Hanya Super Admin yang dapat mengelola pengguna.');
		}

		const ownerId = ownerUser.id;
		const userList = await db
			.select({
				id: users.id,
				email: users.email,
				businessName: users.businessName,
				role: users.role,
				createdById: users.createdById,
				createdAt: users.createdAt
			})
			.from(users)
			.where(or(eq(users.id, ownerId), eq(users.createdById, ownerId)));

		return userList;
	}

	async createUser(ownerUser: AuthUser, data: { email: string; password: string; businessName?: string }) {
		if (ownerUser.role !== 'super_admin') {
			throw new Error('Hanya Super Admin yang dapat menambah pengguna.');
		}

		const email = data.email.trim().toLowerCase();
		const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
		if (existingUser.length > 0) {
			throw new Error('Email sudah terdaftar.');
		}

		const passwordHash = await bcrypt.hash(data.password, 10);
		const businessName = data.businessName?.trim() || ownerUser.businessName;

		const newUser = await db
			.insert(users)
			.values({
				email,
				passwordHash,
				businessName,
				role: 'admin',
				createdById: ownerUser.id,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning({
				id: users.id,
				email: users.email,
				businessName: users.businessName,
				role: users.role,
				createdById: users.createdById,
				createdAt: users.createdAt
			});

		return newUser[0];
	}

	async deleteUser(ownerUser: AuthUser, targetUserId: string) {
		if (ownerUser.role !== 'super_admin') {
			throw new Error('Hanya Super Admin yang dapat menghapus pengguna.');
		}

		if (targetUserId === ownerUser.id) {
			throw new Error('Anda tidak dapat menghapus akun Anda sendiri.');
		}

		const existing = await db
			.select()
			.from(users)
			.where(and(eq(users.id, targetUserId), eq(users.createdById, ownerUser.id)))
			.limit(1);

		if (existing.length === 0) {
			throw new Error('Pengguna tidak ditemukan atau Anda tidak memiliki akses.');
		}

		await db.delete(users).where(eq(users.id, targetUserId));
		return { success: true, message: 'Pengguna berhasil dihapus.' };
	}
}
