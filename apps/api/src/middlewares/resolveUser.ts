import { db, users } from '../db';
import { eq } from 'drizzle-orm';

export type AuthUser = {
	id: string;
	email: string;
	businessName: string;
};


export async function resolveUser(request: Request): Promise<AuthUser | null> {
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

	// Lookup user in DB — let DB errors propagate (they'll become 500, not 401)
	const userList = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	if (!userList || userList.length === 0) {
		// Email provided but user not found in DB → invalid credential
		console.warn(`[resolveUser] No user found for email: ${email}`);
		return null;
	}

	return userList[0] as AuthUser;
}

/**
 * Helper to return a 401 response object.
 */
export function unauthorized(set: any) {
	set.status = 401;
	return { success: false, error: 'Sesi tidak valid atau belum login.' };
}

export function serviceUnavailable(set: any, message?: string) {
	set.status = 503;
	return { success: false, error: message || 'Server sedang bermasalah, coba beberapa saat lagi.' };
}
