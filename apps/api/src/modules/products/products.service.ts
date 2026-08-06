import { eq, and, desc, isNull, or } from 'drizzle-orm';
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
	async getProducts(userId: string, category?: string, activeOnly?: boolean) {
		const userCondition = or(eq(products.userId, userId), isNull(products.userId));

		const conditions = [userCondition];
		if (category) {
			conditions.push(eq(products.category, category));
		}
		if (activeOnly) {
			conditions.push(eq(products.isActive, true));
		}

		const list = await db.select().from(products)
			.where(and(...conditions))
			.orderBy(desc(products.createdAt));

		return list;
	}

	async createProduct(userId: string, data: ProductInput) {
		// Generate SKU
		let isUnique = false;
		let attempts = 0;
		let sku = '';
		while (!isUnique && attempts < 20) {
			const rand = Math.floor(1000 + Math.random() * 9000);
			const tempSku = `PRD-${rand}`;
			const existing = await db.select().from(products).where(and(eq(products.sku, tempSku), eq(products.userId, userId))).limit(1);
			if (existing.length === 0) {
				sku = tempSku;
				isUnique = true;
			}
			attempts++;
		}
		if (!sku) {
			sku = `PRD-${Date.now().toString().slice(-4)}`;
		}

		const barcode = data.barcode ? data.barcode.trim() : sku;

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
		const userCondition = or(eq(products.userId, userId), isNull(products.userId));

		const result = await db.select().from(products).where(and(eq(products.id, id), userCondition)).limit(1);
		const product = result[0];
		if (!product) {
			throw new Error('Produk tidak ditemukan.');
		}

		const updateRes = await db.update(products)
			.set({
				...updateData,
				userId: product.userId || userId,
				updatedAt: new Date()
			})
			.where(eq(products.id, id))
			.returning();

		return updateRes[0];
	}

	async adjustStock(userId: string, id: string, adjustment: number, notes?: string) {
		const userCondition = or(eq(products.userId, userId), isNull(products.userId));

		const result = await db.select().from(products).where(and(eq(products.id, id), userCondition)).limit(1);
		const product = result[0];
		if (!product) {
			throw new Error('Produk tidak ditemukan.');
		}

		const targetStock = product.stock + adjustment;
		if (targetStock < 0) {
			throw new Error('Penyesuaian menyebabkan stok negatif.');
		}

		let updatedNotes = product.notes || '';
		if (notes) {
			updatedNotes = `${updatedNotes}\n[Penyesuaian Stok: ${adjustment > 0 ? '+' : ''}${adjustment} - ${notes} pada ${new Date().toLocaleDateString('id-ID')}]`.trim();
		}

		const updateRes = await db.update(products)
			.set({
				stock: targetStock,
				notes: updatedNotes,
				userId: product.userId || userId,
				updatedAt: new Date()
			})
			.where(eq(products.id, id))
			.returning();

		return updateRes[0];
	}

	async toggleStatus(userId: string, id: string) {
		const userCondition = or(eq(products.userId, userId), isNull(products.userId));

		const result = await db.select().from(products).where(and(eq(products.id, id), userCondition)).limit(1);
		const product = result[0];
		if (!product) {
			throw new Error('Produk tidak ditemukan.');
		}

		const updateRes = await db.update(products)
			.set({
				isActive: !product.isActive,
				userId: product.userId || userId,
				updatedAt: new Date()
			})
			.where(eq(products.id, id))
			.returning();

		return updateRes[0];
	}
}
