import { Elysia } from 'elysia';
import { DashboardService } from './dashboard.service';
import { resolveUser, unauthorized, serviceUnavailable } from '../../middlewares/resolveUser';

const dashboardService = new DashboardService();

export const dashboardController = new Elysia({ prefix: '/dashboard' })
	.get('/stats', async ({ set, request }: any) => {
		try {
			const user = await resolveUser(request);
			if (!user) return unauthorized(set);

			const ownerId = user.createdById || user.id;
			const stats = await dashboardService.getDashboardStats(ownerId);
			return { success: true, ...stats };
		} catch (err: any) {
			console.error('[dashboard/stats] Error:', err);
			set.status = 500;
			return { success: false, error: err.message || 'Gagal mengambil data statistik dashboard.' };
		}
	});
