import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
	throw new Error('TURSO_DATABASE_URL is not defined in the environment variables');
}

export const client = createClient({
	url,
	authToken
});

export const db = drizzle(client, { schema, logger: true });
export * from './schema';

/**
 * Auto-migrate missing columns on production Turso DB.
 * Runs non-blocking on startup to ensure new schema additions (like `barcode`)
 * exist in the remote SQLite database without breaking existing tables.
 */
export async function ensureDbMigrations() {
	const safeMigrations = [
		'ALTER TABLE products ADD COLUMN barcode TEXT;',
		'ALTER TABLE products ADD COLUMN notes TEXT;',
		'ALTER TABLE products ADD COLUMN image_url TEXT;',
		'ALTER TABLE products ADD COLUMN min_stock INTEGER DEFAULT 10;',
		'ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1;'
	];

	for (const sql of safeMigrations) {
		try {
			await client.execute(sql);
			console.log(`[DB Migration] Executed: ${sql}`);
		} catch (err: any) {
			// Silently ignore if column already exists
		}
	}
}

// Trigger auto-migration asynchronously on startup
ensureDbMigrations().catch((err) => {
	console.error('[DB Migration Error]:', err);
});
