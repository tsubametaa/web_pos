import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { sanitizeInput } from './middlewares/sanitizer';
import { authController } from './modules/auth/auth.controller';
import { productsController } from './modules/products/products.controller';
import { transactionsController } from './modules/transactions/transactions.controller';
import { settingsController } from './modules/settings/settings.controller';
import { dashboardController } from './modules/dashboard/dashboard.controller';
import { etalaseController } from './modules/etalase/etalase.controller';
import { uploadsController } from './modules/uploads/uploads.controller';
import { usersController } from './modules/users/users.controller';
import { storesController } from './modules/stores/stores.controller';
import { getLandingPageHtml } from './views/landing';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = new Elysia()
	.use(swagger({
		path: '/swagger',
		documentation: {
			info: {
				title: 'ArthaPOS REST API Documentation',
				version: '1.0.0',
				description: 'Spesifikasi REST API ArthaPOS untuk integrasi aplikasi Web & Mobile (Android / iOS)'
			},
			tags: [
				{ name: 'Auth', description: 'Autentikasi & Sesi Pengguna' },
				{ name: 'Products', description: 'Manajemen Produk & Inventori Toko' },
				{ name: 'Transactions', description: 'Transaksi Kasir POS & Void' },
				{ name: 'Dashboard', description: 'Statistik & Ringkasan Laporan Performa Toko' },
				{ name: 'Users', description: 'Manajemen Staff Admin Biasa (Khusus Super Admin)' },
				{ name: 'Stores', description: 'Manajemen Multi-Brand / Unit Perusahaan' },
				{ name: 'Etalase', description: 'Katalog Publik Toko (Bebas Akses)' },
				{ name: 'Settings', description: 'Pengaturan Profil Toko' },
				{ name: 'Uploads', description: 'Unggah Berkas / Gambar Produk' },
			]
		}
	}))
	.use(cors({
		credentials: true,
		origin: (request: Request) => {
			const origin = request.headers.get('origin');
			if (!origin) return true;
			if (
				origin.startsWith('http://localhost:') ||
				origin.startsWith('http://127.0.0.1:') ||
				origin.endsWith('.vercel.app') ||
				origin.includes('karyasejati') ||
				origin.includes('web-pos-test')
			) {
				return true;
			}
			const allowedOrigins = [
				process.env.APP_WEB_URL,
				process.env.APP_HOME_URL,
				...(process.env.CORS_ORIGIN || '').split(','),
			]
				.filter(Boolean)
				.map((o) => (o as string).trim());
			return allowedOrigins.includes(origin);
		},
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'X-User-Email',
			'X-Store-Id',
			'Accept',
			'Origin',
			'X-Requested-With',
		],
		maxAge: 86400,
	}))

	.onTransform(({ body, query }) => {
		if (body && typeof body === 'object') {
			const sanitizedBody = sanitizeInput(body);
			for (const key of Object.keys(sanitizedBody)) {
				(body as any)[key] = sanitizedBody[key];
			}
		}
		if (query && typeof query === 'object') {
			const sanitizedQuery = sanitizeInput(query);
			for (const key of Object.keys(sanitizedQuery)) {
				(query as any)[key] = sanitizedQuery[key];
			}
		}
	})
	.onError(({ code, error, set }) => {
		if (code === 'NOT_FOUND') {
			set.status = 404;
			return {
				success: false,
				error: 'Endpoint tidak ditemukan.'
			};
		}

		console.error(`[Elysia Error ${code}]:`, error);
		const message = error && typeof error === 'object' && 'message' in error
			? String((error as any).message)
			: 'Internal Server Error';
		return {
			success: false,
			message
		};
	})
	.group('/api', (api) =>
		api
			.get('/health', () => ({
				status: 'healthy',
				service: 'POS Elysia API',
				timestamp: new Date().toISOString()
			}))
			.use(authController)
			.use(storesController)
			.use(productsController)
			.use(transactionsController)
			.use(settingsController)
			.use(dashboardController)
			.use(etalaseController)
			.use(uploadsController)
			.use(usersController)
	)
	.get('/', () => new Response(getLandingPageHtml(), {
		headers: { 'Content-Type': 'text/html; charset=utf-8' }
	}));

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
	app.listen(port, () => {
		console.log(`🦊 Elysia is running on http://localhost:${port}`);
	});
}

export default app;

