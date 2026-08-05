import { Elysia, t } from 'elysia';
import { resolveUser, unauthorized } from '../../middlewares/resolveUser';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

const isVercel = !!process.env.VERCEL;

// Local filesystem uploads dir (used on local dev & VPS)
const uploadsDir = join(process.cwd(), 'uploads');
if (!isVercel && !existsSync(uploadsDir)) {
	mkdirSync(uploadsDir, { recursive: true });
}

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];
const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadsController = new Elysia({ prefix: '/uploads' })
	// Public route: serve static uploaded files (local dev & VPS only)
	.get('/:filename', async ({ params: { filename }, set }) => {
		if (isVercel) {
			set.status = 404;
			return { success: false, error: 'File serving tidak tersedia di platform ini.' };
		}
		const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
		const filePath = join(uploadsDir, safeFilename);
		if (!existsSync(filePath)) {
			set.status = 404;
			return { success: false, error: 'File tidak ditemukan.' };
		}
		const buffer = readFileSync(filePath);
		const ext = safeFilename.split('.').pop()?.toLowerCase() ?? 'jpg';
		const mimeMap: Record<string, string> = {
			jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
			webp: 'image/webp', heic: 'image/heic'
		};
		return new Response(buffer, {
			headers: { 'Content-Type': mimeMap[ext] ?? 'application/octet-stream' }
		});
	})
	// Protected route: upload a file - auth resolved directly from request (no middleware dependency)
	.post('/upload', async ({ body, set, request }) => {
		const user = await resolveUser(request);
		if (!user) return unauthorized(set);

		try {
			const file = (body as any).file as File | undefined;

			if (!file || typeof file.name !== 'string') {
				set.status = 400;
				return { success: false, error: 'File gambar wajib disertakan.' };
			}

			const originalName = file.name;
			const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
			const mime = file.type || 'image/jpeg';

			if (!VALID_EXTENSIONS.includes(ext) && !VALID_MIME_TYPES.includes(mime)) {
				set.status = 400;
				return { success: false, error: 'Format tidak didukung. Gunakan JPG, PNG, WEBP, atau HEIC.' };
			}

			const arrayBuffer = await file.arrayBuffer();

			if (arrayBuffer.byteLength > MAX_FILE_SIZE_BYTES) {
				set.status = 413;
				return { success: false, error: 'Ukuran file terlalu besar. Maksimal 5 MB.' };
			}

			const buffer = Buffer.from(arrayBuffer);

			if (isVercel) {
				const safeMime = VALID_MIME_TYPES.includes(mime) ? mime : 'image/jpeg';
				const base64 = buffer.toString('base64');
				const dataUrl = `data:${safeMime};base64,${base64}`;
				return { success: true, url: dataUrl };
			}

			// On local dev / VPS: save to filesystem and return URL
			const safeExt = VALID_EXTENSIONS.includes(ext) ? ext : '.jpg';
			const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${safeExt}`;
			const filePath = join(uploadsDir, filename);

			writeFileSync(filePath, buffer);

			const urlObj = new URL(request.url);
			const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
			const fileUrl = `${baseUrl}/api/uploads/${filename}`;

			return { success: true, url: fileUrl };
		} catch (err: any) {
			console.error('[uploadsController] Error:', err);
			set.status = 500;
			return { success: false, error: 'Gagal menyimpan file: ' + err.message };
		}
	}, {
		body: t.Object({
			file: t.File()
		}),
		type: 'multipart/form-data'
	});
