import { db, users } from '../db';
import { eq } from 'drizzle-orm';

export type AuthUser = {
	id: string;
	email: string;
	businessName: string;
};

/**
 * Resolve the authenticated user directly from raw request headers/cookies.
 * This completely bypasses Elysia's derive/middleware lifecycle, which can be
 * unreliable on Vercel (Node.js runtime) especially with multipart/form-data.
 *
 * Auth priority: Authorization header → X-User-Email header → session cookie
 */
export async function resolveUser(request: Request): Promise<AuthUser | null> {
	try {
		let email: string | null = null;

		// 1. Authorization: Bearer <email>
		const authHeader = request.headers.get('authorization');
		if (authHeader && authHeader.startsWith('Bearer ')) {
			email = authHeader.substring(7).trim() || null;
		}

		// 2. X-User-Email header
		if (!email) {
			email = request.headers.get('x-user-email');
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

		if (!email || !email.includes('@')) {
			return null;
		}

		const userList = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		return (userList[0] as AuthUser) || null;
	} catch (err) {
		console.error('[resolveUser] Error:', err);
		return null;
	}
}

/**
 * Helper to return a 401 response object.
 */
export function unauthorized(set: any) {
	set.status = 401;
	return { success: false, error: 'Sesi tidak valid atau belum login.' };
}
