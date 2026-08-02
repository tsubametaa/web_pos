import { eq, desc } from 'drizzle-orm';
import { db, products, transactions, transactionItems, settings } from '../../db';

export interface CartItemInput {
	productId: string;
	qty: number;
}

export interface CheckoutInput {
	items: CartItemInput[];
	paymentMethod: string;
	amountPaid: number;
	notes?: string;
}

export class TransactionsService {
	async getTransactions() {
		const transactionsList = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
		const allItems = await db.select().from(transactionItems);

		// Map relational transactionItems back into nested array
		return transactionsList.map((tx) => ({
			...tx,
			items: allItems.filter((item) => item.transactionId === tx.id)
		}));
	}

	async getTransactionById(id: string) {
		const txResult = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
		const transaction = txResult[0];
		if (!transaction) {
			throw new Error('Transaksi tidak ditemukan.');
		}

		const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, id));
		const settingsResult = await db.select().from(settings).limit(1);
		const shopSettings = settingsResult[0] || null;

		return {
			transaction: {
				...transaction,
				items
			},
			settings: shopSettings
				? {
						businessName: shopSettings.businessName,
						businessAddress: shopSettings.businessAddress || '',
						businessPhone: shopSettings.businessPhone || '',
						currencySymbol: shopSettings.currencySymbol,
						receiptFooter: shopSettings.receiptFooter || ''
					}
				: null
		};
	}

	async createTransaction(data: CheckoutInput) {
		const { items, paymentMethod, amountPaid, notes } = data;

		if (!items || items.length === 0) {
			throw new Error('Keranjang belanja kosong.');
		}

		return await db.transaction(async (tx) => {
			let totalAmount = 0;
			let totalCost = 0;
			const resolvedItems = [];

			// 1. Verify stock levels and gather snapshots
			for (const cartItem of items) {
				const prodList = await tx.select().from(products).where(eq(products.id, cartItem.productId)).limit(1);
				const product = prodList[0];

				if (!product) {
					throw new Error(`Produk dengan ID ${cartItem.productId} tidak ditemukan.`);
				}

				if (!product.isActive) {
					throw new Error(`Produk "${product.name}" sudah tidak aktif.`);
				}

				if (product.stock < cartItem.qty) {
					throw new Error(`Stok produk "${product.name}" tidak mencukupi (Tersedia: ${product.stock}, Diminta: ${cartItem.qty}).`);
				}

				const subtotal = cartItem.qty * product.sellingPrice;
				totalAmount += subtotal;
				totalCost += cartItem.qty * product.costPrice;

				resolvedItems.push({
					productId: product.id,
					productName: product.name,
					sku: product.sku,
					qty: cartItem.qty,
					costPrice: product.costPrice,
					sellingPrice: product.sellingPrice,
					subtotal
				});
			}

			// 2. Validate payments
			let change = 0;
			if (paymentMethod === 'cash') {
				if (amountPaid < totalAmount) {
					throw new Error(`Pembayaran tunai kurang dari total belanja (${amountPaid} < ${totalAmount}).`);
				}
				change = amountPaid - totalAmount;
			}

			const profit = totalAmount - totalCost;

			// 3. Deduct stock levels atomically
			for (const item of resolvedItems) {
				const prodList = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
				const product = prodList[0];
				if (!product) throw new Error('Produk tidak ditemukan');

				const updatedStock = product.stock - item.qty;
				if (updatedStock < 0) {
					throw new Error(`Stok produk "${item.productName}" tidak mencukupi.`);
				}

				await tx.update(products)
					.set({ stock: updatedStock, updatedAt: new Date() })
					.where(eq(products.id, item.productId));
			}

			// Generate transaction code
			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			const hours = String(now.getHours()).padStart(2, '0');
			const minutes = String(now.getMinutes()).padStart(2, '0');
			const seconds = String(now.getSeconds()).padStart(2, '0');
			const rand = Math.floor(1000 + Math.random() * 9000);
			const transactionCode = `TRX-${year}${month}${day}-${hours}${minutes}${seconds}-${rand}`;

			// 4. Create Transaction log
			const txResult = await tx.insert(transactions).values({
				transactionCode,
				totalAmount,
				totalCost,
				profit,
				paymentMethod,
				amountPaid: paymentMethod === 'cash' ? amountPaid : totalAmount,
				change,
				notes: notes || null,
				status: 'completed'
			}).returning();

			const insertedTx = txResult[0];

			// 5. Insert Transaction Items in bulk
			const itemsToInsert = resolvedItems.map((item) => ({
				transactionId: insertedTx.id,
				productId: item.productId,
				productName: item.productName,
				sku: item.sku,
				qty: item.qty,
				costPrice: item.costPrice,
				sellingPrice: item.sellingPrice,
				subtotal: item.subtotal
			}));

			await tx.insert(transactionItems).values(itemsToInsert);

			return {
				...insertedTx,
				items: itemsToInsert
			};
		});
	}

	async voidTransaction(id: string) {
		return await db.transaction(async (tx) => {
			const txList = await tx.select().from(transactions).where(eq(transactions.id, id)).limit(1);
			const transaction = txList[0];

			if (!transaction) {
				throw new Error('Transaksi tidak ditemukan.');
			}

			if (transaction.status === 'voided') {
				throw new Error('Transaksi ini sudah dibatalkan sebelumnya.');
			}

			const itemsList = await tx.select().from(transactionItems).where(eq(transactionItems.transactionId, id));

			// Restore stock for all items
			for (const item of itemsList) {
				const prodList = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
				const product = prodList[0];
				if (product) {
					await tx.update(products)
						.set({
							stock: product.stock + item.qty,
							updatedAt: new Date()
						})
						.where(eq(products.id, item.productId));
				}
			}

			// Update transaction status
			const updatedTx = await tx.update(transactions)
				.set({
					status: 'voided',
					updatedAt: new Date()
				})
				.where(eq(transactions.id, id))
				.returning();

			return updatedTx[0];
		});
	}
}
