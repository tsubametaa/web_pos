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
	.get('/', async ({ set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		const list = await transactionsService.getTransactions(user.id);
		return { success: true, transactions: list };
	})
	.get('/:id', async ({ params, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
			const data = await transactionsService.getTransactionById(user.id, params.id);
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
			const transaction = await transactionsService.createTransaction(user.id, body);
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
					qty: t.Number({ minimum: 1, error: 'Jumlah item minimal 1.' })
				}),
				{ minItems: 1, error: 'Keranjang belanja tidak boleh kosong.' }
			),
			paymentMethod: t.String({ error: 'Metode pembayaran wajib dipilih.' }),
			amountPaid: t.Number({ minimum: 0, error: 'Jumlah uang bayar tidak boleh negatif.' }),
			notes: t.Optional(t.String())
		})
	})
	.post('/void', async ({ body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
			const { id } = body;
			const transaction = await transactionsService.voidTransaction(user.id, id);
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
