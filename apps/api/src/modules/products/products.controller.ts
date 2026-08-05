import { Elysia, t } from 'elysia';
import { ProductsService } from './products.service';
import { resolveUser, unauthorized } from '../../middlewares/resolveUser';

const productsService = new ProductsService();

export const productsController = new Elysia({ prefix: '/products' })
	.get('/', async ({ query, set, request }: any) => {
		const user = await resolveUser(request);
		if (!user) return unauthorized(set);
		const activeOnly = query.active === 'true';
		const list = await productsService.getProducts(user.id, query.category, activeOnly);
		return { success: true, products: list };
	}, {
		query: t.Object({
			category: t.Optional(t.String()),
			active: t.Optional(t.String())
		})
	})
	.post('/', async ({ body, set, request }: any) => {
		const user = await resolveUser(request);
		if (!user) return unauthorized(set);
		try {
			const product = await productsService.createProduct(user.id, body);
			return { success: true, product };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			name: t.String({ minLength: 1, error: 'Nama produk wajib diisi.' }),
			category: t.String({ minLength: 1, error: 'Kategori wajib diisi.' }),
			unit: t.String({ minLength: 1, error: 'Satuan wajib diisi.' }),
			costPrice: t.Union([t.Number({ minimum: 0 }), t.String()], { error: 'HPP tidak boleh negatif.' }),
			sellingPrice: t.Union([t.Number({ minimum: 0 }), t.String()], { error: 'Harga jual tidak boleh negatif.' }),
			stock: t.Optional(t.Union([t.Number({ minimum: 0 }), t.Null()])),
			minStock: t.Optional(t.Union([t.Number({ minimum: 0 }), t.Null()])),
			imageUrl: t.Optional(t.Union([t.String(), t.Null()])),
			notes: t.Optional(t.Union([t.String(), t.Null()]))
		})
	})
	.put('/', async ({ body, set, request }: any) => {
		const user = await resolveUser(request);
		if (!user) return unauthorized(set);
		try {
			const { id, stockAdjustment, adjustmentNotes, ...updateData } = body;
			if (!id) {
				set.status = 400;
				return { success: false, error: 'ID produk wajib disertakan.' };
			}

			// Handle Stock Adjustment if stockAdjustment is provided
			if (stockAdjustment !== undefined) {
				const adjustment = parseInt(stockAdjustment as any);
				if (isNaN(adjustment)) {
					set.status = 400;
					return { success: false, error: 'Jumlah penyesuaian stok harus angka.' };
				}

				const product = await productsService.adjustStock(user.id, id, adjustment, adjustmentNotes);
				return { success: true, product };
			}

			// Regular Product Update
			const product = await productsService.updateProduct(user.id, id, updateData);
			return { success: true, product };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			id: t.String({ minLength: 1 }),
			name: t.Optional(t.String({ minLength: 1 })),
			category: t.Optional(t.String({ minLength: 1 })),
			unit: t.Optional(t.String({ minLength: 1 })),
			costPrice: t.Optional(t.Number({ minimum: 0 })),
			sellingPrice: t.Optional(t.Number({ minimum: 0 })),
			stock: t.Optional(t.Number({ minimum: 0 })),
			minStock: t.Optional(t.Number({ minimum: 0 })),
			imageUrl: t.Optional(t.String()),
			notes: t.Optional(t.String()),
			stockAdjustment: t.Optional(t.Union([t.Number(), t.String()])),
			adjustmentNotes: t.Optional(t.String())
		})
	})
	.delete('/', async ({ query, set, request }: any) => {
		const user = await resolveUser(request);
		if (!user) return unauthorized(set);
		try {
			const id = query.id;
			if (!id) {
				set.status = 400;
				return { success: false, error: 'ID produk wajib disertakan.' };
			}

			const product = await productsService.toggleStatus(user.id, id);
			return {
				success: true,
				message: `Status produk berhasil diubah menjadi ${product.isActive ? 'aktif' : 'non-aktif'}.`,
				product
			};
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		query: t.Object({
			id: t.String({ minLength: 1, error: 'ID produk wajib disertakan.' })
		})
	});
