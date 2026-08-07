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
		`CREATE TABLE IF NOT EXISTS stores (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			logo_url TEXT,
			address TEXT,
			phone TEXT,
			receipt_footer TEXT,
			tax_rate REAL DEFAULT 0,
			currency TEXT DEFAULT 'IDR',
			currency_symbol TEXT DEFAULT 'Rp',
			created_by_id TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS members (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			phone TEXT NOT NULL UNIQUE,
			email TEXT,
			address TEXT,
			notes TEXT,
			is_active INTEGER DEFAULT 1 NOT NULL,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		);`,
		`ALTER TABLE members ADD COLUMN address TEXT;`,
		`CREATE TABLE IF NOT EXISTS member_prices (
			id TEXT PRIMARY KEY,
			member_id TEXT NOT NULL,
			sku TEXT NOT NULL,
			custom_price INTEGER NOT NULL,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		);`,
		'ALTER TABLE products ADD COLUMN barcode TEXT;',
		'ALTER TABLE products ADD COLUMN notes TEXT;',
		'ALTER TABLE products ADD COLUMN image_url TEXT;',
		'ALTER TABLE products ADD COLUMN min_stock INTEGER DEFAULT 10;',
		'ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1;',
		'ALTER TABLE products ADD COLUMN store_id TEXT;',
		'ALTER TABLE users ADD COLUMN role TEXT DEFAULT "super_admin";',
		'ALTER TABLE users ADD COLUMN created_by_id TEXT;',
		'ALTER TABLE users ADD COLUMN store_id TEXT;',
		'ALTER TABLE transactions ADD COLUMN store_id TEXT;',
		'ALTER TABLE transactions ADD COLUMN recipient_name TEXT;',
		'ALTER TABLE transactions ADD COLUMN recipient_phone TEXT;',
		'ALTER TABLE transactions ADD COLUMN recipient_address TEXT;',
		'ALTER TABLE transactions ADD COLUMN member_id TEXT;',
		'ALTER TABLE transactions ADD COLUMN is_member_transaction INTEGER DEFAULT 0;',
		'ALTER TABLE settings ADD COLUMN store_id TEXT;',
		'ALTER TABLE settings ADD COLUMN logo_url TEXT;',
		'UPDATE users SET role = "super_admin" WHERE role IS NULL OR role = "";'
	];

	for (const sql of safeMigrations) {
		try {
			await client.execute(sql);
			console.log(`[DB Migration] Executed successfully`);
		} catch (err: any) {
			// Silently ignore if column/table already exists
		}
	}
}

// Trigger auto-migration asynchronously on startup
ensureDbMigrations().catch((err) => {
	console.error('[DB Migration Error]:', err);
});
