import { Elysia, t } from 'elysia';
import { UsersService } from './users.service';
import { resolveUser, unauthorized, serviceUnavailable } from '../../middlewares/resolveUser';

const usersService = new UsersService();

async function getUser(request: Request, set: any) {
	try {
		return await resolveUser(request);
	} catch (err) {
		console.error('[users] resolveUser DB error:', err);
		serviceUnavailable(set);
		return undefined;
	}
}

export const usersController = new Elysia({ prefix: '/users' })
	.get('/', async ({ set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
			const list = await usersService.getUsers(user);
			return { success: true, users: list };
		} catch (err: any) {
			set.status = 403;
			return { success: false, error: err.message };
		}
	})
	.post('/', async ({ body, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
			const newUser = await usersService.createUser(user, body);
			return { success: true, message: 'User (Admin Biasa) berhasil ditambahkan!', user: newUser };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	}, {
		body: t.Object({
			email: t.String({ format: 'email', error: 'Email tidak valid.' }),
			password: t.String({ minLength: 6, error: 'Password minimal 6 karakter.' }),
			businessName: t.Optional(t.String())
		})
	})
	.delete('/:id', async ({ params, set, request }: any) => {
		const user = await getUser(request, set);
		if (user === undefined) return { success: false, error: 'Server sedang bermasalah.' };
		if (!user) return unauthorized(set);
		try {
			const result = await usersService.deleteUser(user, params.id);
			return { success: true, message: result.message };
		} catch (err: any) {
			set.status = 400;
			return { success: false, error: err.message };
		}
	});
