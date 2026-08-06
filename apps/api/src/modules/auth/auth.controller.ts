import { Elysia, t } from 'elysia';
import { AuthService } from './auth.service';
import { resolveUser } from '../../middlewares/resolveUser';

const authService = new AuthService();

export const authController = new Elysia({ prefix: '/auth' })
	.post('/login', async ({ body, cookie: { session }, set }) => {
		try {
			const { email, password } = body;
			const user = await authService.login(email, password);

			const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
			session.set({
				value: user.email,
				path: '/',
				httpOnly: true,
				sameSite: isProduction ? 'none' : 'lax',
				secure: isProduction,
				maxAge: 60 * 60 * 24 * 30
			});

			return { success: true, message: 'Login berhasil!', user };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			email: t.String({ format: 'email', error: 'Email tidak valid.' }),
			password: t.String({ minLength: 1, error: 'Password wajib diisi.' })
		})
	})
	.post('/logout', ({ cookie: { session } }) => {
		session.remove();
		return { success: true, message: 'Logout berhasil!' };
	})
	.get('/me', async ({ set, request }: any) => {
		let user;
		try {
			user = await resolveUser(request);
		} catch (err) {
			// DB error — return 503 so frontend knows to retry, not to clear session
			console.error('[auth/me] DB error resolving user:', err);
			set.status = 503;
			return { success: false, error: 'Server sedang bermasalah, coba beberapa saat lagi.' };
		}
		if (!user) {
			set.status = 401;
			return { success: false, error: 'Belum login.' };
		}
		return {
			success: true,
			user: {
				id: user.id,
				email: user.email,
				businessName: user.businessName,
				role: user.role || 'super_admin',
				createdById: user.createdById || null
			}
		};
	});

