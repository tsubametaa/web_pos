import { eq, and, desc, isNull, or, gte, lte, inArray } from 'drizzle-orm';
import { db, products, transactions, transactionItems, settings, stores, members } from '../../db';
import type { CartItemInput, CheckoutInput } from '../../types';

export class TransactionsService {
	private getUserCondition(userId: string, storeId?: string | null, field: any = transactions.userId) {
		if (storeId) {
			return or(eq(transactions.storeId, storeId), and(eq(field, userId), isNull(transactions.storeId)));
		}
		return or(eq(field, userId), isNull(field));
	}

	async getTransactions(
		userId: string,
		storeId?: string | null,
		options: {
			startDate?: Date | null;
			endDate?: Date | null;
			paymentMethod?: string | null;
			limit?: number;
			offset?: number;
		} = {}
	) {
		const conditions: any[] = [this.getUserCondition(userId, storeId, transactions.userId)];

		if (options.startDate) {
			conditions.push(gte(transactions.createdAt, options.startDate));
		}
		if (options.endDate) {
			conditions.push(lte(transactions.createdAt, options.endDate));
		}
		if (options.paymentMethod && options.paymentMethod !== 'all') {
			conditions.push(eq(transactions.paymentMethod, options.paymentMethod));
		}

		const fetchLimit = Math.min(options.limit || 1000, 2000);
		const fetchOffset = Math.max(options.offset || 0, 0);

		// Optimized Drizzle Selection
		const rawTransactions = await db
			.select({
				id: transactions.id,
				userId: transactions.userId,
				storeId: transactions.storeId,
				memberId: transactions.memberId,
				isMemberTransaction: transactions.isMemberTransaction,
				transactionCode: transactions.transactionCode,
				recipientName: transactions.recipientName,
				recipientPhone: transactions.recipientPhone,
				recipientAddress: transactions.recipientAddress,
				totalAmount: transactions.totalAmount,
				totalCost: transactions.totalCost,
				profit: transactions.profit,
				paymentMethod: transactions.paymentMethod,
				amountPaid: transactions.amountPaid,
				change: transactions.change,
				notes: transactions.notes,
				status: transactions.status,
				createdAt: transactions.createdAt,
				updatedAt: transactions.updatedAt,
				memberName: members.name,
				memberPhone: members.phone
			})
			.from(transactions)
			.leftJoin(members, eq(transactions.memberId, members.id))
			.where(and(...conditions))
			.orderBy(desc(transactions.createdAt))
			.limit(fetchLimit)
			.offset(fetchOffset);

		if (rawTransactions.length === 0) {
			return [];
		}

		// Batch fetch items ONLY for the returned transaction IDs
		const txIds = rawTransactions.map((tx) => tx.id);
		const relevantItems = await db
			.select()
			.from(transactionItems)
			.where(inArray(transactionItems.transactionId, txIds));

		// Map grouping for items
		const itemsByTxId = new Map<string, typeof relevantItems>();
		for (const item of relevantItems) {
			if (!itemsByTxId.has(item.transactionId)) {
				itemsByTxId.set(item.transactionId, []);
			}
			itemsByTxId.get(item.transactionId)!.push(item);
		}

		return rawTransactions.map((tx) => ({
			...tx,
			items: itemsByTxId.get(tx.id) || []
		}));
	}

	async getTransactionById(userId: string, storeId: string | null | undefined, id: string) {
		const condition = this.getUserCondition(userId, storeId, transactions.userId);
		const txResult = await db
			.select({
				id: transactions.id,
				userId: transactions.userId,
				storeId: transactions.storeId,
				memberId: transactions.memberId,
				isMemberTransaction: transactions.isMemberTransaction,
				transactionCode: transactions.transactionCode,
				recipientName: transactions.recipientName,
				recipientPhone: transactions.recipientPhone,
				recipientAddress: transactions.recipientAddress,
				totalAmount: transactions.totalAmount,
				totalCost: transactions.totalCost,
				profit: transactions.profit,
				paymentMethod: transactions.paymentMethod,
				amountPaid: transactions.amountPaid,
				change: transactions.change,
				notes: transactions.notes,
				status: transactions.status,
				createdAt: transactions.createdAt,
				updatedAt: transactions.updatedAt,
				memberName: members.name,
				memberPhone: members.phone
			})
			.from(transactions)
			.leftJoin(members, eq(transactions.memberId, members.id))
			.where(and(eq(transactions.id, id), condition))
			.limit(1);

		const transaction = txResult[0];
		if (!transaction) {
			throw new Error('Transaksi tidak ditemukan.');
		}

		const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, id));

		// Retrieve store/brand settings
		let shopSettings: any = null;
		if (transaction.storeId) {
			const storeList = await db.select().from(stores).where(eq(stores.id, transaction.storeId)).limit(1);
			if (storeList.length > 0) {
				const s = storeList[0];
				shopSettings = {
					businessName: s.name,
					logoUrl: s.logoUrl || null,
					businessAddress: s.address || '',
					businessPhone: s.phone || '',
					currencySymbol: s.currencySymbol || 'Rp',
					receiptFooter: s.receiptFooter || ''
				};
			}
		}

		if (!shopSettings) {
			const settingsCondition = or(eq(settings.userId, userId), isNull(settings.userId));
			const settingsResult = await db.select().from(settings).where(settingsCondition).limit(1);
			const s = settingsResult[0];
			if (s) {
				shopSettings = {
					businessName: s.businessName,
					logoUrl: s.logoUrl || null,
					businessAddress: s.businessAddress || '',
					businessPhone: s.businessPhone || '',
					currencySymbol: s.currencySymbol,
					receiptFooter: s.receiptFooter || ''
				};
			}
		}

		return {
			transaction: {
				...transaction,
				items
			},
			settings: shopSettings
		};
	}

	async createTransaction(userId: string, storeId: string | null | undefined, data: CheckoutInput) {
		const { items, paymentMethod, amountPaid, notes, recipientName, recipientPhone, recipientAddress, memberId, isMemberTransaction } = data;

		if (!items || items.length === 0) {
			throw new Error('Keranjang belanja kosong.');
		}

		return await db.transaction(async (tx) => {
			let totalAmount = 0;
			let totalCost = 0;
			const resolvedItems = [];

			const prodCondition = storeId
				? eq(products.storeId, storeId)
				: or(eq(products.userId, userId), isNull(products.userId));

			// 1. Verify stock levels and gather snapshots
			for (const cartItem of items) {
				const prodList = await tx.select().from(products).where(and(eq(products.id, cartItem.productId), prodCondition)).limit(1);
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

				const sellingPrice = (cartItem.customPrice && cartItem.customPrice > 0) ? cartItem.customPrice : product.sellingPrice;
				const subtotal = cartItem.qty * sellingPrice;
				totalAmount += subtotal;
				totalCost += cartItem.qty * product.costPrice;

				resolvedItems.push({
					productId: product.id,
					productName: product.name,
					sku: product.sku,
					qty: cartItem.qty,
					costPrice: product.costPrice,
					sellingPrice,
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
				const prodList = await tx.select().from(products).where(and(eq(products.id, item.productId), prodCondition)).limit(1);
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
				userId,
				storeId: storeId || null,
				memberId: memberId || null,
				isMemberTransaction: Boolean(memberId || isMemberTransaction),
				transactionCode,
				recipientName: recipientName || null,
				recipientPhone: recipientPhone || null,
				recipientAddress: recipientAddress || null,
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

			// Fetch member info if memberId attached
			let memberName: string | undefined;
			let memberPhone: string | undefined;
			if (insertedTx.memberId) {
				const memberResult = await tx.select().from(members).where(eq(members.id, insertedTx.memberId)).limit(1);
				if (memberResult[0]) {
					memberName = memberResult[0].name;
					memberPhone = memberResult[0].phone;
				}
			}

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
				memberName,
				memberPhone,
				items: itemsToInsert
			};
		});
	}

	async voidTransaction(userId: string, storeId: string | null | undefined, id: string) {
		const condition = this.getUserCondition(userId, storeId, transactions.userId);
		return await db.transaction(async (tx) => {
			const txList = await tx.select().from(transactions).where(and(eq(transactions.id, id), condition)).limit(1);
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
