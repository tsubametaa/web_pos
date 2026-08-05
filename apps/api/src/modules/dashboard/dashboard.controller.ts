import { Elysia } from 'elysia';
import { DashboardService } from './dashboard.service';
import { resolveUser, unauthorized } from '../../middlewares/resolveUser';

const dashboardService = new DashboardService();

export const dashboardController = new Elysia({ prefix: '/dashboard' })
	.get('/stats', async ({ set, request }: any) => {
		const user = await resolveUser(request);
		if (!user) return unauthorized(set);
		const stats = await dashboardService.getDashboardStats(user.id);
		return { success: true, ...stats };
	});
