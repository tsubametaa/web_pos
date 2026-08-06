import { Elysia, t } from 'elysia';
import { EtalaseService } from './etalase.service';
import { resolveUser } from '../../middlewares/resolveUser';

const etalaseService = new EtalaseService();

export const etalaseController = new Elysia({ prefix: '/etalase' })
	.get('/', async ({ query, request }: any) => {
		const user = await resolveUser(request);
		const userId = user?.id || query.userId || undefined;
		const data = await etalaseService.getCatalog(userId);
		return { success: true, ...data };
	}, {
		query: t.Object({
			userId: t.Optional(t.String())
		})
	})
	.get('/:id', async ({ query, params, set, request }: any) => {
		try {
			const user = await resolveUser(request);
			const userId = user?.id || query.userId || undefined;
			const data = await etalaseService.getCatalogProductById(params.id, userId);
			return { success: true, ...data };
		} catch (err: any) {
			set.status = 404;
			return { success: false, error: err.message };
		}
	}, {
		params: t.Object({
			id: t.String({ minLength: 1 })
		}),
		query: t.Object({
			userId: t.Optional(t.String())
		})
	});

