import { Elysia, t } from 'elysia';
import { TransactionsService } from './transactions.service';
import { authPlugin } from '../../middlewares/auth';

const transactionsService = new TransactionsService();

export const transactionsController = new Elysia({ prefix: '/transactions' })
	.use(authPlugin)
	.guard({ requireAuth: true })
	.get('/', async () => {
		const list = await transactionsService.getTransactions();
		return { success: true, transactions: list };
	})
	.get('/:id', async ({ params, set }) => {
		try {
			const data = await transactionsService.getTransactionById(params.id);
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
	.post('/', async ({ body, set }) => {
		try {
			const transaction = await transactionsService.createTransaction(body);
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
	.post('/void', async ({ body, set }) => {
		try {
			const { id } = body;
			const transaction = await transactionsService.voidTransaction(id);
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
