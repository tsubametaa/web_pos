import { Elysia, t } from 'elysia';
import { SettingsService } from './settings.service';
import { authPlugin } from '../../middlewares/auth';

const settingsService = new SettingsService();

export const settingsController = new Elysia({ prefix: '/settings' })
	.use(authPlugin)
	.guard({ requireAuth: true })
	.get('/', async ({ user }: any) => {
		const data = await settingsService.getSettings(user.id);
		return { success: true, settings: data };
	})
	.put('/', async ({ body, user, set }: any) => {
		try {
			const data = await settingsService.updateSettings(user.id, body, user?.email);
			return { success: true, settings: data, message: 'Profil bisnis berhasil diperbarui!' };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			businessName: t.String({ minLength: 1, error: 'Nama bisnis wajib diisi.' }),
			businessAddress: t.Optional(t.String()),
			businessPhone: t.Optional(t.String()),
			currencySymbol: t.Optional(t.String()),
			lowStockThreshold: t.Optional(t.Number()),
			taxRate: t.Optional(t.Number()),
			receiptFooter: t.Optional(t.String())
		})
	})
	.put('/password', async ({ body, user, set }: any) => {
		try {
			if (!user?.email || !user?.id) {
				set.status = 401;
				return { success: false, error: 'Sesi tidak valid.' };
			}
			await settingsService.updatePassword(user.id, user.email, body.oldPassword, body.newPassword);
			return { success: true, message: 'Password berhasil diperbarui!' };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			oldPassword: t.String({ minLength: 1, error: 'Password lama wajib diisi.' }),
			newPassword: t.String({ minLength: 6, error: 'Password baru minimal 6 karakter.' })
		})
	});
