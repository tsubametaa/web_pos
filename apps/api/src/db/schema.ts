import {
	sqliteTable,
	text,
	integer,
	real,
	index,
	AnySQLiteColumn
} from 'drizzle-orm/sqlite-core';

export function generateRandomId(length = 7): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	for (let i = 0; i < length; i++) {
		result += chars[bytes[i] % chars.length];
	}
	return result;
}

// Stores Table (Brand / Business Unit)
export const stores = sqliteTable('stores', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	logoUrl: text('logo_url'),
	address: text('address'),
	phone: text('phone'),
	receiptFooter: text('receipt_footer'),
	taxRate: real('tax_rate').notNull().default(0),
	currency: text('currency').notNull().default('IDR'),
	currencySymbol: text('currency_symbol').notNull().default('Rp'),
	createdById: text('created_by_id').references((): AnySQLiteColumn => users.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

// Users Table
export const users = sqliteTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateRandomId(7)),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	businessName: text('business_name').notNull(),
	role: text('role').notNull().default('super_admin'),
	createdById: text('created_by_id'),
	storeId: text('store_id').references((): AnySQLiteColumn => stores.id, { onDelete: 'set null' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

// Products Table
export const products = sqliteTable('products', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	storeId: text('store_id').references(() => stores.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	sku: text('sku').notNull(),
	category: text('category').notNull(),
	unit: text('unit').notNull(),
	costPrice: integer('cost_price').notNull(),
	sellingPrice: integer('selling_price').notNull(),
	stock: integer('stock').notNull().default(0),
	minStock: integer('min_stock').notNull().default(10),
	imageUrl: text('image_url'),
	barcode: text('barcode'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	notes: text('notes'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

// Members Table
export const members = sqliteTable('members', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	phone: text('phone').notNull().unique(),
	email: text('email'),
	address: text('address'),
	notes: text('notes'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

// Member Prices Table (Custom pricing per SKU per member)
export const memberPrices = sqliteTable('member_prices', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	memberId: text('member_id')
		.references(() => members.id, { onDelete: 'cascade' })
		.notNull(),
	sku: text('sku').notNull(),
	customPrice: integer('custom_price').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
}, (table) => ({
	memberSkuUniq: index('idx_member_prices_member_sku').on(table.memberId, table.sku)
}));

// Transactions Table
export const transactions = sqliteTable('transactions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	storeId: text('store_id').references(() => stores.id, { onDelete: 'cascade' }),
	memberId: text('member_id').references(() => members.id, { onDelete: 'set null' }),
	isMemberTransaction: integer('is_member_transaction', { mode: 'boolean' }).notNull().default(false),
	transactionCode: text('transaction_code').notNull().unique(),
	recipientName: text('recipient_name'),
	recipientPhone: text('recipient_phone'),
	recipientAddress: text('recipient_address'),
	totalAmount: integer('total_amount').notNull(),
	totalCost: integer('total_cost').notNull(),
	profit: integer('profit').notNull(),
	paymentMethod: text('payment_method').notNull(), // 'cash' | 'transfer' | 'qris' | 'other'
	amountPaid: integer('amount_paid').notNull(),
	change: integer('change').notNull().default(0),
	notes: text('notes'),
	status: text('status').notNull().default('completed'), // 'completed' | 'voided'
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
}, (table) => ({
	storeUserIdx: index('idx_transactions_store_user').on(table.storeId, table.userId),
	createdAtIdx: index('idx_transactions_created_at').on(table.createdAt),
	statusMethodIdx: index('idx_transactions_status_method').on(table.status, table.paymentMethod)
}));

// Transaction Items Table
export const transactionItems = sqliteTable('transaction_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	transactionId: text('transaction_id')
		.references(() => transactions.id, { onDelete: 'cascade' })
		.notNull(),
	productId: text('product_id')
		.references(() => products.id)
		.notNull(),
	productName: text('product_name').notNull(),
	sku: text('sku').notNull(),
	qty: integer('qty').notNull(),
	costPrice: integer('cost_price').notNull(),
	sellingPrice: integer('selling_price').notNull(),
	subtotal: integer('subtotal').notNull()
}, (table) => ({
	trxIdIdx: index('idx_trx_items_trx_id').on(table.transactionId)
}));

// Settings Table
export const settings = sqliteTable('settings', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	storeId: text('store_id').references(() => stores.id, { onDelete: 'cascade' }),
	businessName: text('business_name').notNull(),
	logoUrl: text('logo_url'),
	businessAddress: text('business_address'),
	businessPhone: text('business_phone'),
	currency: text('currency').notNull().default('IDR'),
	currencySymbol: text('currency_symbol').notNull().default('Rp'),
	lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
	taxRate: real('tax_rate').notNull().default(0), // 0 - 100 percentage
	receiptFooter: text('receipt_footer'),
	ownerPasswordHash: text('owner_password_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull()
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type TransactionType = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type TransactionItem = typeof transactionItems.$inferSelect;
export type InsertTransactionItem = typeof transactionItems.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;
export type MemberPrice = typeof memberPrices.$inferSelect;
export type InsertMemberPrice = typeof memberPrices.$inferInsert;


