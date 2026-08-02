import { eq, and, gt, asc } from 'drizzle-orm';
import { db, products, settings } from '../../db';

export class EtalaseService {
	async getCatalog() {
		const settingsResult = await db.select().from(settings).limit(1);
		const shopSettings = settingsResult[0] || null;

		const productsList = await db.select()
			.from(products)
			.where(and(eq(products.isActive, true), gt(products.stock, 0)))
			.orderBy(asc(products.name));

		return {
			products: productsList,
			settings: shopSettings
				? {
						businessName: shopSettings.businessName,
						businessAddress: shopSettings.businessAddress || '',
						businessPhone: shopSettings.businessPhone || '',
						currencySymbol: shopSettings.currencySymbol
					}
				: null
		};
	}

	async getCatalogProductById(id: string) {
		const prodResult = await db.select()
			.from(products)
			.where(and(eq(products.id, id), eq(products.isActive, true)))
			.limit(1);
		const product = prodResult[0];

		if (!product) {
			throw new Error('Produk tidak ditemukan atau sudah tidak aktif.');
		}

		const settingsResult = await db.select().from(settings).limit(1);
		const shopSettings = settingsResult[0] || null;

		return {
			product,
			settings: shopSettings
				? {
						businessName: shopSettings.businessName,
						businessAddress: shopSettings.businessAddress || '',
						businessPhone: shopSettings.businessPhone || '',
						currencySymbol: shopSettings.currencySymbol
					}
				: null
		};
	}
}
