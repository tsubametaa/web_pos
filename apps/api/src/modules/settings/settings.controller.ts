import { Elysia, t } from 'elysia';
import { SettingsService } from './settings.service';
import { resolveUser, unauthorized, serviceUnavailable } from '../../middlewares/resolveUser';

const settingsService = new SettingsService();

async function getUser(request: Request, set: any) {
	try {
		return await resolveUser(request);
	} catch (err) {
		console.error('[settings] resolveUser DB error:', err);
		serviceUnavailable(set);
		return undefined;
	}
}

export const settingsController = new Elysia({ prefix: '/settings' })
	.get('/', async ({ set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		const ownerId = user.createdById || user.id;
		const data = await settingsService.getSettings(ownerId, user.storeId);
		return { success: true, settings: data };
	})
	.put('/', async ({ body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
			const ownerId = user.createdById || user.id;
			const data = await settingsService.updateSettings(ownerId, user.storeId, body, user.email);
			return { success: true, settings: data, message: 'Profil bisnis berhasil diperbarui!' };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			businessName: t.String({ minLength: 1, error: 'Nama bisnis wajib diisi.' }),
			logoUrl: t.Optional(t.String()),
			businessAddress: t.Optional(t.String()),
			businessPhone: t.Optional(t.String()),
			currencySymbol: t.Optional(t.String()),
			lowStockThreshold: t.Optional(t.Number()),
			taxRate: t.Optional(t.Number()),
			receiptFooter: t.Optional(t.String())
		})
	})
	.put('/password', async ({ body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
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
