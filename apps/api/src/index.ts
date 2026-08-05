import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { sanitizeInput } from './middlewares/sanitizer';
import { authController } from './modules/auth/auth.controller';
import { productsController } from './modules/products/products.controller';
import { transactionsController } from './modules/transactions/transactions.controller';
import { settingsController } from './modules/settings/settings.controller';
import { dashboardController } from './modules/dashboard/dashboard.controller';
import { etalaseController } from './modules/etalase/etalase.controller';
import { uploadsController } from './modules/uploads/uploads.controller';
import { getLandingPageHtml } from './views/landing';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = new Elysia()
	.use(cors({
		credentials: true,
		origin: process.env.CORS_ORIGIN || true
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
	.onError(({ code, error }) => {
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
			.use(productsController)
			.use(transactionsController)
			.use(settingsController)
			.use(dashboardController)
			.use(etalaseController)
			.use(uploadsController)
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

