import { eq, desc } from 'drizzle-orm';
import { db, products, transactions } from '../../db';

export class DashboardService {
	async getDashboardStats() {
		// 1. Fetch completed transactions
		const completedTransactions = await db.select()
			.from(transactions)
			.where(eq(transactions.status, 'completed'))
			.orderBy(desc(transactions.createdAt));

		// 2. Fetch all active products
		const activeProducts = await db.select()
			.from(products)
			.where(eq(products.isActive, true));

		// 3. Aggregate totals for today's transactions
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);
		const endOfToday = new Date();
		endOfToday.setHours(23, 59, 59, 999);

		const todayTrxs = completedTransactions.filter((t) => {
			const date = new Date(t.createdAt);
			return date >= startOfToday && date <= endOfToday;
		});

		const todaySales = todayTrxs.reduce((sum, t) => sum + t.totalAmount, 0);
		const todayProfit = todayTrxs.reduce((sum, t) => sum + t.profit, 0);
		const todayTransactionsCount = todayTrxs.length;

		// 4. Filter low-stock products (stock <= minStock)
		const lowStockProducts = activeProducts.filter(
			(p) => p.stock <= (p.minStock !== null && p.minStock !== undefined ? p.minStock : 10)
		);

		// 5. Fetch 5 most recent transactions
		const recentTransactions = await db.select()
			.from(transactions)
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
				const date = new Date(t.createdAt);
				return date >= startOfDay && date <= endOfDay;
			});

			const amount = dayTrxs.reduce((sum, t) => sum + t.totalAmount, 0);
			const profit = dayTrxs.reduce((sum, t) => sum + t.profit, 0);

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
