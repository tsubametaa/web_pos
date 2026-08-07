import { Elysia, t } from 'elysia';
import { StoresService } from './stores.service';
import { resolveUser, unauthorized, serviceUnavailable } from '../../middlewares/resolveUser';

const storesService = new StoresService();

async function getUser(request: Request, set: any) {
	try {
		return await resolveUser(request);
	} catch (err) {
		console.error('[stores] resolveUser DB error:', err);
		serviceUnavailable(set);
		return undefined;
	}
}

export const storesController = new Elysia({ prefix: '/stores' })
	.get('/', async ({ set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		const ownerId = user.createdById || user.id;
		const list = await storesService.getStores(ownerId, user.businessName);
		return { success: true, stores: list };
	})
	.post('/', async ({ body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		if (user.role !== 'super_admin') {
			set.status = 403;
			return { success: false, error: 'Hanya Super Admin yang dapat membuat brand baru.' };
		}
		try {
			const ownerId = user.id;
			const newStore = await storesService.createStore(ownerId, body);
			return { success: true, message: 'Brand baru berhasil dibuat!', store: newStore };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			name: t.String({ minLength: 1, error: 'Nama brand wajib diisi.' }),
			logoUrl: t.Optional(t.String()),
			address: t.Optional(t.String()),
			phone: t.Optional(t.String()),
			receiptFooter: t.Optional(t.String()),
			taxRate: t.Optional(t.Number()),
			currencySymbol: t.Optional(t.String())
		})
	})
	.put('/:id', async ({ params, body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		if (user.role !== 'super_admin') {
			set.status = 403;
			return { success: false, error: 'Hanya Super Admin yang dapat mengubah profil brand.' };
		}
		try {
			const ownerId = user.id;
			const updated = await storesService.updateStore(params.id, ownerId, body);
			return { success: true, message: 'Profil brand berhasil diperbarui!', store: updated };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			name: t.Optional(t.String()),
			logoUrl: t.Optional(t.String()),
			address: t.Optional(t.String()),
			phone: t.Optional(t.String()),
			receiptFooter: t.Optional(t.String()),
			taxRate: t.Optional(t.Number()),
			currencySymbol: t.Optional(t.String())
		})
	})
	.delete('/:id', async ({ params, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		if (user.role !== 'super_admin') {
			set.status = 403;
			return { success: false, error: 'Hanya Super Admin yang dapat menghapus brand.' };
		}
		try {
			const ownerId = user.id;
			await storesService.deleteStore(params.id, ownerId);
			return { success: true, message: 'Brand berhasil dihapus.' };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	});
