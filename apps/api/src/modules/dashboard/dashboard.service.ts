import { eq, and, desc, isNull, or } from 'drizzle-orm';
import { db, products, transactions } from '../../db';

export class DashboardService {
	private getTxCondition(userId: string, storeId?: string | null) {
		if (storeId) return or(eq(transactions.storeId, storeId), and(eq(transactions.userId, userId), isNull(transactions.storeId)));
		return or(eq(transactions.userId, userId), isNull(transactions.userId));
	}

	private getProdCondition(userId: string, storeId?: string | null) {
		if (storeId) return or(eq(products.storeId, storeId), and(eq(products.userId, userId), isNull(products.storeId)));
		return or(eq(products.userId, userId), isNull(products.userId));
	}

	private parseDate(val: any): Date {
		if (!val) return new Date(0);
		if (val instanceof Date) {
			return isNaN(val.getTime()) ? new Date(0) : val;
		}
		if (typeof val === 'number') {
			// If Unix timestamp in seconds (< 1e11), convert to ms
			return new Date(val < 100000000000 ? val * 1000 : val);
		}
		if (typeof val === 'string') {
			const num = Number(val);
			if (!isNaN(num)) {
				return new Date(num < 100000000000 ? num * 1000 : num);
			}
			const parsed = new Date(val);
			return isNaN(parsed.getTime()) ? new Date(0) : parsed;
		}
		return new Date(0);
	}

	async getDashboardStats(userId: string, storeId?: string | null) {
		const txUserCondition = this.getTxCondition(userId, storeId);
		const prodUserCondition = this.getProdCondition(userId, storeId);

		// 1. Fetch completed transactions for user
		const completedTransactions = await db.select()
			.from(transactions)
			.where(and(eq(transactions.status, 'completed'), txUserCondition))
			.orderBy(desc(transactions.createdAt));

		// 2. Fetch all active products for user
		const activeProducts = await db.select()
			.from(products)
			.where(and(eq(products.isActive, true), prodUserCondition));

		// 3. Aggregate totals for today's transactions
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);
		const endOfToday = new Date();
		endOfToday.setHours(23, 59, 59, 999);

		const todayTrxs = completedTransactions.filter((t) => {
			const date = this.parseDate(t.createdAt);
			return date >= startOfToday && date <= endOfToday;
		});

		const todaySales = todayTrxs.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);
		const todayProfit = todayTrxs.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
		const todayTransactionsCount = todayTrxs.length;

		// 4. Filter low-stock products (stock <= minStock)
		const lowStockProducts = activeProducts.filter(
			(p) => (Number(p.stock) || 0) <= (p.minStock !== null && p.minStock !== undefined ? Number(p.minStock) : 10)
		);

		// 5. Fetch 5 most recent transactions for user
		const recentTransactions = await db.select()
			.from(transactions)
			.where(txUserCondition)
			.orderBy(desc(transactions.createdAt))
			.limit(5);

		// 6. Generate 7-day sales history trend
		const salesTrend = [];
		for (let i = 6; i >= 0; i--) {
			const targetDate = new Date();
			targetDate.setDate(targetDate.getDate() - i);
			const dateStr = targetDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

			const startOfDay = new Date(targetDate);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(targetDate);
			endOfDay.setHours(23, 59, 59, 999);

			const dayTrxs = completedTransactions.filter((t) => {
				const date = this.parseDate(t.createdAt);
				return date >= startOfDay && date <= endOfDay;
			});

			const amount = dayTrxs.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);
			const profit = dayTrxs.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);

			salesTrend.push({
				dateStr,
				amount,
				profit
			});
		}

		return {
			stats: {
				todaySales,
				todayProfit,
				todayTransactions: todayTransactionsCount,
				totalProducts: activeProducts.length,
				lowStockCount: lowStockProducts.length
			},
			lowStockProducts: lowStockProducts.slice(0, 5),
			recentTransactions,
			salesTrend
		};
	}
}
