import { Elysia } from 'elysia';
import { DashboardService } from './dashboard.service';
import { requireAuthPlugin } from '../../middlewares/auth';

const dashboardService = new DashboardService();

export const dashboardController = new Elysia({ prefix: '/dashboard' })
	.use(requireAuthPlugin)
	.get('/stats', async ({ user }: any) => {
		const stats = await dashboardService.getDashboardStats(user.id);
		return { success: true, ...stats };
	});
