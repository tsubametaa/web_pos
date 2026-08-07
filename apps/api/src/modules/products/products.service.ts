import { eq, and, desc, isNull, or, gte } from 'drizzle-orm';
import { db, products } from '../../db';
import type { ProductInput } from '../../types';

export class ProductsService {
	private userCondition(userId: string, storeId?: string | null) {
		if (storeId) {
			return or(eq(products.storeId, storeId), and(eq(products.userId, userId), isNull(products.storeId)));
		}
		return or(eq(products.userId, userId), isNull(products.userId));
	}

	async getProducts(userId: string, storeId?: string | null, category?: string, activeOnly?: boolean) {
		const conditions: any[] = [this.userCondition(userId, storeId)];
		if (category) conditions.push(eq(products.category, category));
		if (activeOnly) conditions.push(eq(products.isActive, true));

		return db.select()
			.from(products)
			.where(and(...conditions))
			.orderBy(desc(products.createdAt));
	}

	private generateRandomBarcode(length: number = 9): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	async createProduct(userId: string, storeId: string | null | undefined, data: ProductInput) {
		// Generate unique SKU
		let sku = '';
		for (let attempts = 0; attempts < 20; attempts++) {
			const rand = Math.floor(1000 + Math.random() * 9000);
			const tempSku = `PRD-${rand}`;
			const existing = await db.select().from(products)
				.where(and(eq(products.sku, tempSku), this.userCondition(userId, storeId)))
				.limit(1);
			if (existing.length === 0) { sku = tempSku; break; }
		}
		if (!sku) sku = `PRD-${Date.now().toString().slice(-4)}`;

		let barcode = data.barcode?.trim();
		if (!barcode) {
			for (let attempts = 0; attempts < 20; attempts++) {
				const tempBarcode = this.generateRandomBarcode(9);
				const existing = await db.select().from(products)
					.where(and(eq(products.barcode, tempBarcode), this.userCondition(userId, storeId)))
					.limit(1);
				if (existing.length === 0) { barcode = tempBarcode; break; }
			}
			if (!barcode) barcode = sku;
		}

		const result = await db.insert(products).values({
			userId,
			storeId: storeId || null,
			name: data.name,
			category: data.category,
			unit: data.unit,
			costPrice: Number(data.costPrice) || 0,
			sellingPrice: Number(data.sellingPrice) || 0,
			stock: Number(data.stock) || 0,
			minStock: Number(data.minStock) || 0,
			imageUrl: data.imageUrl || null,
			barcode,
			notes: data.notes || null,
			sku
		}).returning();

		return result[0];
	}

	async updateProduct(userId: string, id: string, updateData: Partial<ProductInput>) {
		const existing = await db.select().from(products)
			.where(and(eq(products.id, id), this.userCondition(userId)))
			.limit(1);
		const product = existing[0];
		if (!product) throw new Error('Produk tidak ditemukan.');

		const safeUpdate: Record<string, any> = {
			userId,
			updatedAt: new Date()
		};
		if (updateData.name !== undefined)         safeUpdate.name = updateData.name;
		if (updateData.category !== undefined)     safeUpdate.category = updateData.category;
		if (updateData.unit !== undefined)         safeUpdate.unit = updateData.unit;
		if (updateData.costPrice !== undefined)    safeUpdate.costPrice = Number(updateData.costPrice) || 0;
		if (updateData.sellingPrice !== undefined) safeUpdate.sellingPrice = Number(updateData.sellingPrice) || 0;
		if (updateData.stock !== undefined)        safeUpdate.stock = Number(updateData.stock) || 0;
		if (updateData.minStock !== undefined)     safeUpdate.minStock = Number(updateData.minStock) || 0;
		if (updateData.imageUrl !== undefined)     safeUpdate.imageUrl = updateData.imageUrl || null;
		if (updateData.notes !== undefined)        safeUpdate.notes = updateData.notes || null;
		if (updateData.barcode !== undefined)      safeUpdate.barcode = updateData.barcode?.trim() || product.barcode || product.sku;

		const updateRes = await db.update(products)
			.set(safeUpdate)
			.where(and(eq(products.id, id), this.userCondition(userId)))
			.returning();

		return updateRes[0];
	}

	async adjustStock(userId: string, id: string, adjustment: number, notes?: string) {
		const existing = await db.select().from(products)
			.where(and(eq(products.id, id), this.userCondition(userId)))
			.limit(1);
		const product = existing[0];
		if (!product) throw new Error('Produk tidak ditemukan.');

		const targetStock = product.stock + adjustment;
		if (targetStock < 0) throw new Error('Penyesuaian menyebabkan stok negatif.');

		let updatedNotes = product.notes || '';
		if (notes) {
			updatedNotes = `${updatedNotes}\n[Penyesuaian Stok: ${adjustment > 0 ? '+' : ''}${adjustment} - ${notes} pada ${new Date().toLocaleDateString('id-ID')}]`.trim();
		}

		const updateRes = await db.update(products)
			.set({
				stock: targetStock,
				notes: updatedNotes,
				userId,
				updatedAt: new Date()
			})
			.where(and(eq(products.id, id), this.userCondition(userId)))
			.returning();

		return updateRes[0];
	}

	async toggleStatus(userId: string, id: string) {
		const existing = await db.select().from(products)
			.where(and(eq(products.id, id), this.userCondition(userId)))
			.limit(1);
		const product = existing[0];
		if (!product) throw new Error('Produk tidak ditemukan.');

		const updateRes = await db.update(products)
			.set({
				isActive: !product.isActive,
				userId,         // Claim ownership if previously null
				updatedAt: new Date()
			})
			.where(and(eq(products.id, id), this.userCondition(userId)))
			.returning();

		return updateRes[0];
	}

	async deleteProduct(userId: string, id: string) {
		const existing = await db.select().from(products)
			.where(and(eq(products.id, id), this.userCondition(userId)))
			.limit(1);
		const product = existing[0];
		if (!product) throw new Error('Produk tidak ditemukan.');

		await db.delete(products)
			.where(and(eq(products.id, id), this.userCondition(userId)));

		return product;
	}
}
