import { Elysia, t } from 'elysia';
import { AuthService } from './auth.service';
import { authPlugin } from '../../middlewares/auth';

const authService = new AuthService();

export const authController = new Elysia({ prefix: '/auth' })
	.use(authPlugin)
	.get('/setup-needed', async () => {
		const needSetup = await authService.checkSetupNeeded();
		return { success: true, needSetup };
	})
	.post('/register', async ({ body, cookie: { session }, set }) => {
		try {
			const { businessName, email, password } = body;
			const user = await authService.register(businessName, email, password);

			const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
			session.set({
				value: user.email,
				path: '/',
				httpOnly: true,
				sameSite: isProduction ? 'none' : 'lax',
				secure: isProduction,
				maxAge: 60 * 60 * 24 * 30
			});

			return { success: true, message: 'Registrasi berhasil!', user };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			businessName: t.String({ minLength: 1, error: 'Nama bisnis wajib diisi.' }),
			email: t.String({ format: 'email', error: 'Email tidak valid.' }),
			password: t.String({ minLength: 6, error: 'Password minimal 6 karakter.' })
		})
	})
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
	.get('/me', ({ user, set }: any) => {
		if (!user) {
			set.status = 401;
			return { success: false, error: 'Belum login.' };
		}
		return {
			success: true,
			user: {
				id: user.id,
				email: user.email,
				businessName: user.businessName
			}
		};
	});
