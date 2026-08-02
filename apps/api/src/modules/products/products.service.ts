import { eq, and, desc } from 'drizzle-orm';
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
	notes?: string;
}

export class ProductsService {
	async getProducts(category?: string, activeOnly?: boolean) {
		const conditions = [];
		if (category) {
			conditions.push(eq(products.category, category));
		}
		if (activeOnly) {
			conditions.push(eq(products.isActive, true));
		}

		const selectQuery = db.select().from(products);
		const list = await (conditions.length > 0
			? selectQuery.where(and(...conditions)).orderBy(desc(products.createdAt))
			: selectQuery.orderBy(desc(products.createdAt)));

		return list;
	}

	async createProduct(data: ProductInput) {
		// Generate SKU
		let isUnique = false;
		let attempts = 0;
		let sku = '';
		while (!isUnique && attempts < 20) {
			const rand = Math.floor(1000 + Math.random() * 9000);
			const tempSku = `PRD-${rand}`;
			const existing = await db.select().from(products).where(eq(products.sku, tempSku)).limit(1);
			if (existing.length === 0) {
				sku = tempSku;
				isUnique = true;
			}
			attempts++;
		}
		if (!sku) {
			sku = `PRD-${Date.now().toString().slice(-4)}`;
		}

		const result = await db.insert(products).values({
			name: data.name,
			category: data.category,
			unit: data.unit,
			costPrice: data.costPrice,
			sellingPrice: data.sellingPrice,
			stock: data.stock ?? 0,
			minStock: data.minStock ?? 10,
			imageUrl: data.imageUrl || null,
			notes: data.notes || null,
			sku
		}).returning();

		return result[0];
	}

	async updateProduct(id: string, updateData: Partial<ProductInput>) {
		const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
		const product = result[0];
		if (!product) {
			throw new Error('Produk tidak ditemukan.');
		}

		const updateRes = await db.update(products)
			.set({
				...updateData,
				updatedAt: new Date()
			})
			.where(eq(products.id, id))
			.returning();

		return updateRes[0];
	}

	async adjustStock(id: string, adjustment: number, notes?: string) {
		const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
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
				updatedAt: new Date()
			})
			.where(eq(products.id, id))
			.returning();

		return updateRes[0];
	}

	async toggleStatus(id: string) {
		const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
		const product = result[0];
		if (!product) {
			throw new Error('Produk tidak ditemukan.');
		}

		const updateRes = await db.update(products)
			.set({
				isActive: !product.isActive,
				updatedAt: new Date()
			})
			.where(eq(products.id, id))
			.returning();

		return updateRes[0];
	}
}
