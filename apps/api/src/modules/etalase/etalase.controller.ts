import { Elysia, t } from 'elysia';
import { EtalaseService } from './etalase.service';

const etalaseService = new EtalaseService();

export const etalaseController = new Elysia({ prefix: '/etalase' })
	.get('/', async () => {
		const data = await etalaseService.getCatalog();
		return { success: true, ...data };
	})
	.get('/:id', async ({ params, set }) => {
		try {
			const data = await etalaseService.getCatalogProductById(params.id);
			return { success: true, ...data };
		} catch (err: any) {
			set.status = 404;
			return { success: false, error: err.message };
		}
	}, {
		params: t.Object({
			id: t.String({ minLength: 1 })
		})
	});
