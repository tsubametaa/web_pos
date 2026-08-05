import { Elysia } from 'elysia';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';

export const authPlugin = new Elysia({ name: 'auth' })
	.derive(async ({ cookie: { session }, request }) => {
		let email = session?.value;

		// Fallback to Authorization header or X-User-Email if Cookie SameSite policy blocks cross-origin cookies
		if (!email || typeof email !== 'string') {
			const authHeader = request.headers.get('authorization');
			if (authHeader && authHeader.startsWith('Bearer ')) {
				email = authHeader.substring(7);
			} else {
				email = request.headers.get('x-user-email') || undefined;
			}
		}

		if (!email || typeof email !== 'string') {
			return { user: null };
		}

		try {
			const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
			return { user: userList[0] || null };
		} catch (err) {
			console.error('[authPlugin] DB Error:', err);
			return { user: null };
		}
	})
	.macro(({ onBeforeHandle }) => ({
		requireAuth(value: boolean) {
			if (!value) return;

			onBeforeHandle(({ user, set }: any) => {
				if (!user) {
					set.status = 401;
					return { success: false, error: 'Sesi tidak valid atau belum login.' };
				}
			});
		}
	}));
