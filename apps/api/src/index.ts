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

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = new Elysia()
	.use(cors({
		credentials: true,
		origin: true // Enable CORS for development
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
	.group('/api', (api) =>
		api
			.use(authController)
			.use(productsController)
			.use(transactionsController)
			.use(settingsController)
			.use(dashboardController)
			.use(etalaseController)
			.use(uploadsController)
	)
	.get('/', () => ({ status: 'ok', service: 'POS Elysia API' }))
	.listen(port);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
