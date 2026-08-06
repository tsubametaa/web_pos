import { db, users, ensureDbMigrations } from '../db';
import { eq } from 'drizzle-orm';

export type AuthUser = {
	id: string;
	email: string;
	businessName: string;
};

let migrationTriggered = false;

export async function resolveUser(request: Request): Promise<AuthUser | null> {
	// Guarantee DB auto-migrations (like adding missing barcode column to products) on first request
	if (!migrationTriggered) {
		migrationTriggered = true;
		ensureDbMigrations().catch((err) => console.error('[resolveUser] Migration error:', err));
	}

	let email: string | null = null;

	// 1. Authorization: Bearer <email>
	const authHeader = request.headers.get('authorization');
	if (authHeader && authHeader.startsWith('Bearer ')) {
		email = authHeader.substring(7).trim() || null;
	}

	// 2. X-User-Email header (redundant fallback)
	if (!email) {
		email = request.headers.get('x-user-email')?.trim() || null;
	}

	// 3. Session cookie (parse manually from Cookie header)
	if (!email) {
		const cookieHeader = request.headers.get('cookie') || '';
		const sessionMatch = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
		if (sessionMatch) {
			try {
				email = decodeURIComponent(sessionMatch[1]).trim() || null;
			} catch {
				email = null;
			}
		}
	}

	// No credentials at all → anonymous request
	if (!email || !email.includes('@')) {
		return null;
	}

	const userList = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	if (!userList || userList.length === 0) {
		console.warn(`[resolveUser] No user found for email: ${email}`);
		return null;
	}

	return userList[0] as AuthUser;
}

export function unauthorized(set: any) {
	set.status = 401;
	return { success: false, error: 'Sesi tidak valid atau belum login.' };
}

export function serviceUnavailable(set: any, message?: string) {
	set.status = 503;
	return { success: false, error: message || 'Server sedang bermasalah, coba beberapa saat lagi.' };
}
