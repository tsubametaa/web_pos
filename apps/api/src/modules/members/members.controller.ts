import { Elysia, t } from 'elysia';
import { MembersService } from './members.service';
import { resolveUser, unauthorized, serviceUnavailable } from '../../middlewares/resolveUser';

const membersService = new MembersService();

async function getUser(request: Request, set: any) {
	try {
		return await resolveUser(request);
	} catch (err) {
		console.error('[members] resolveUser DB error:', err);
		serviceUnavailable(set);
		return undefined;
	}
}

export const membersController = new Elysia({ prefix: '/members' })
	.get('/', async ({ query, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);

		try {
			const list = await membersService.getMembers(query.search);
			return { success: true, members: list };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		query: t.Object({
			search: t.Optional(t.String())
		})
	})
	.get('/lookup', async ({ query, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);

		if (!query.phone || !query.phone.trim()) {
			set.status = 400;
			return { success: false, error: 'Nomor telepon wajib diisi.' };
		}

		try {
			const member = await membersService.getMemberByPhone(query.phone);
			if (!member) {
				return { success: true, member: null, message: 'Member tidak ditemukan.' };
			}
			return { success: true, member };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		query: t.Object({
			phone: t.String()
		})
	})
	.get('/:id', async ({ params, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);

		try {
			const member = await membersService.getMemberById(params.id);
			if (!member) {
				set.status = 404;
				return { success: false, error: 'Member tidak ditemukan.' };
			}
			return { success: true, member };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	})
	.post('/', async ({ body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);

		try {
			const newMember = await membersService.createMember(body);
			return { success: true, message: 'Member berhasil ditambahkan!', member: newMember };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			name: t.String({ minLength: 1, error: 'Nama member wajib diisi.' }),
			phone: t.String({ minLength: 5, error: 'Nomor telepon minimal 5 karakter.' }),
			email: t.Optional(t.String()),
			address: t.Optional(t.String()),
			notes: t.Optional(t.String())
		})
	})
	.put('/:id', async ({ params, body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);

		try {
			const updated = await membersService.updateMember(params.id, body);
			return { success: true, message: 'Data member berhasil diperbarui!', member: updated };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			name: t.Optional(t.String()),
			phone: t.Optional(t.String()),
			email: t.Optional(t.String()),
			address: t.Optional(t.String()),
			notes: t.Optional(t.String()),
			isActive: t.Optional(t.Boolean())
		})
	})
	.delete('/:id', async ({ params, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);

		try {
			await membersService.deleteMember(params.id);
			return { success: true, message: 'Member berhasil dihapus.' };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	})
	.post('/:id/prices', async ({ params, body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);

		try {
			const price = await membersService.setMemberPrice(params.id, body.sku, body.customPrice);
			return { success: true, message: 'Harga khusus member berhasil disimpan!', price };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			sku: t.String({ minLength: 1, error: 'SKU produk wajib diisi.' }),
			customPrice: t.Number({ minimum: 1, error: 'Harga khusus harus lebih dari 0.' })
		})
	})
	.delete('/:id/prices/:sku', async ({ params, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);

		try {
			await membersService.deleteMemberPrice(params.id, params.sku);
			return { success: true, message: 'Harga khusus berhasil dihapus.' };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	});
