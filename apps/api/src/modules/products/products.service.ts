import { eq, and, desc, isNull, or, gte } from 'drizzle-orm';
import { db, products } from '../../db';

export interface ProductInput {
	name: string;
	category: string;
	unit: string;
	costPrice: number;
	sellingPrice: number;
	stock?: number;
	minStock?: number;
	imageUrl?: string;
	barcode?: string;
	notes?: string;
}

export class ProductsService {
	private userCondition(userId: string) {
		return or(eq(products.userId, userId), isNull(products.userId));
	}

	async getProducts(userId: string, category?: string, activeOnly?: boolean) {
		const conditions: any[] = [this.userCondition(userId)];
		if (category) conditions.push(eq(products.category, category));
		if (activeOnly) conditions.push(eq(products.isActive, true));

		return db.select()
			.from(products)
			.where(and(...conditions))
			.orderBy(desc(products.createdAt));
	}

	async createProduct(userId: string, data: ProductInput) {
		// Generate unique SKU
		let sku = '';
		for (let attempts = 0; attempts < 20; attempts++) {
			const rand = Math.floor(1000 + Math.random() * 9000);
			const tempSku = `PRD-${rand}`;
			const existing = await db.select().from(products)
				.where(and(eq(products.sku, tempSku), eq(products.userId, userId)))
				.limit(1);
			if (existing.length === 0) { sku = tempSku; break; }
		}
		if (!sku) sku = `PRD-${Date.now().toString().slice(-4)}`;

		const barcode = data.barcode?.trim() || sku;

		const result = await db.insert(products).values({
			userId,
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
}
