import { Elysia } from 'elysia';
import { DashboardService } from './dashboard.service';
import { resolveUser, unauthorized, serviceUnavailable } from '../../middlewares/resolveUser';

const dashboardService = new DashboardService();

export const dashboardController = new Elysia({ prefix: '/dashboard' })
	.get('/stats', async ({ set, request }: any) => {
		let user;
		try {
			user = await resolveUser(request);
		} catch (err) {
			console.error('[dashboard] resolveUser DB error:', err);
			return serviceUnavailable(set);
		}
		if (!user) return unauthorized(set);
		const stats = await dashboardService.getDashboardStats(user.id);
		return { success: true, ...stats };
	});
