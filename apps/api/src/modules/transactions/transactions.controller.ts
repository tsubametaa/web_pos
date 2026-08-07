import { Elysia, t } from 'elysia';
import { TransactionsService } from './transactions.service';
import { resolveUser, unauthorized, serviceUnavailable } from '../../middlewares/resolveUser';

const transactionsService = new TransactionsService();

async function getUser(request: Request, set: any) {
	try {
		return await resolveUser(request);
	} catch (err) {
		console.error('[transactions] resolveUser DB error:', err);
		serviceUnavailable(set);
		return undefined;
	}
}

export const transactionsController = new Elysia({ prefix: '/transactions' })
	.get('/', async ({ set, request, query }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		const ownerId = user.createdById || user.id;

		let startDate: Date | null = null;
		let endDate: Date | null = null;

		if (query?.month && query.month !== 'all') {
			// Format: "YYYY-MM" (e.g., "2026-08")
			const [yearStr, monthStr] = query.month.split('-');
			if (yearStr && monthStr) {
				const year = parseInt(yearStr, 10);
				const month = parseInt(monthStr, 10) - 1;
				startDate = new Date(year, month, 1, 0, 0, 0, 0);
				endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
			}
		}

		const list = await transactionsService.getTransactions(ownerId, user.storeId, {
			startDate,
			endDate,
			paymentMethod: query?.paymentMethod || null,
			limit: query?.limit ? parseInt(query.limit, 10) : 1000,
			offset: query?.offset ? parseInt(query.offset, 10) : 0
		});
		return { success: true, transactions: list };
	})
	.get('/:id', async ({ params, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
			const ownerId = user.createdById || user.id;
			const data = await transactionsService.getTransactionById(ownerId, user.storeId, params.id);
			return { success: true, ...data };
		} catch (err: any) {
			set.status = 404;
			return { success: false, error: err.message };
		}
	}, {
		params: t.Object({
			id: t.String({ minLength: 1 })
		})
	})
	.post('/', async ({ body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
			const ownerId = user.createdById || user.id;
			const transaction = await transactionsService.createTransaction(ownerId, user.storeId, body);
			return { success: true, transaction };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			items: t.Array(
				t.Object({
					productId: t.String({ minLength: 1 }),
					qty: t.Number({ minimum: 1, error: 'Jumlah item minimal 1.' }),
					customPrice: t.Optional(t.Number())
				}),
				{ minItems: 1, error: 'Keranjang belanja tidak boleh kosong.' }
			),
			paymentMethod: t.String({ error: 'Metode pembayaran wajib dipilih.' }),
			amountPaid: t.Number({ minimum: 0, error: 'Jumlah uang bayar tidak boleh negatif.' }),
			notes: t.Optional(t.String()),
			recipientName: t.Optional(t.String()),
			recipientPhone: t.Optional(t.String()),
			recipientAddress: t.Optional(t.String()),
			memberId: t.Optional(t.String()),
			isMemberTransaction: t.Optional(t.Boolean())
		})
	})
	.post('/void', async ({ body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
			const ownerId = user.createdById || user.id;
			const { id } = body;
			const transaction = await transactionsService.voidTransaction(ownerId, user.storeId, id);
			return { success: true, message: 'Transaksi berhasil dibatalkan dan stok dikembalikan.', transaction };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			id: t.String({ minLength: 1, error: 'ID transaksi wajib disertakan.' })
		})
	});
