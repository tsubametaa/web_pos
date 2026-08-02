import { Elysia } from 'elysia';
import { DashboardService } from './dashboard.service';
import { authPlugin } from '../../middlewares/auth';

const dashboardService = new DashboardService();

export const dashboardController = new Elysia({ prefix: '/dashboard' })
	.use(authPlugin)
	.guard({ requireAuth: true })
	.get('/stats', async () => {
		const stats = await dashboardService.getDashboardStats();
		return { success: true, ...stats };
	});
