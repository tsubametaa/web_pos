import { eq, and, gt, asc, isNull, or } from 'drizzle-orm';
import { db, products, settings } from '../../db';

export class EtalaseService {
	private getUserCondition(userId: string | undefined, field: any) {
		return userId
			? or(eq(field, userId), isNull(field))
			: isNull(field);
	}

	async getCatalog(userId?: string) {
		const settingsCondition = this.getUserCondition(userId, settings.userId);
		const prodCondition = this.getUserCondition(userId, products.userId);

		const settingsResult = await db.select().from(settings).where(settingsCondition).limit(1);
		const shopSettings = settingsResult[0] || null;

		const productsList = await db.select()
			.from(products)
			.where(and(eq(products.isActive, true), gt(products.stock, 0), prodCondition))
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

	async getCatalogProductById(id: string, userId?: string) {
		const prodCondition = this.getUserCondition(userId, products.userId);
		const settingsCondition = this.getUserCondition(userId, settings.userId);

		const prodResult = await db.select()
			.from(products)
			.where(and(eq(products.id, id), eq(products.isActive, true), prodCondition))
			.limit(1);
		const product = prodResult[0];

		if (!product) {
			throw new Error('Produk tidak ditemukan atau sudah tidak aktif.');
		}

		const settingsResult = await db.select().from(settings).where(settingsCondition).limit(1);
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
