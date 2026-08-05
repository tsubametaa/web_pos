import { Elysia } from 'elysia';
import { DashboardService } from './dashboard.service';
import { authPlugin } from '../../middlewares/auth';

const dashboardService = new DashboardService();

export const dashboardController = new Elysia({ prefix: '/dashboard' })
	.use(authPlugin)
	.guard({ requireAuth: true })
	.get('/stats', async ({ user }: any) => {
		const stats = await dashboardService.getDashboardStats(user.id);
		return { success: true, ...stats };
	});
