// Centralized Type Definitions for POS API Backend

export interface AuthUser {
	id: string;
	email: string;
	businessName: string;
	role: string;
	createdById?: string | null;
	storeId?: string | null;
}

export interface ProductInput {
	name: string;
	sku?: string;
	category: string;
	unit: string;
	costPrice: number;
	sellingPrice: number;
	stock?: number;
	minStock?: number;
	imageUrl?: string;
	barcode?: string;
	notes?: string;
}

export interface StoreInput {
	name: string;
	logoUrl?: string;
	address?: string;
	phone?: string;
	receiptFooter?: string;
	taxRate?: number;
	currency?: string;
	currencySymbol?: string;
}

export interface SettingsInput {
	businessName?: string;
	logoUrl?: string;
	businessAddress?: string;
	businessPhone?: string;
	currency?: string;
	currencySymbol?: string;
	lowStockThreshold?: number;
	taxRate?: number;
	receiptFooter?: string;
	ownerPassword?: string;
}

export interface CartItemInput {
	productId: string;
	qty: number;
	customPrice?: number;
}

export interface CheckoutInput {
	items: CartItemInput[];
	paymentMethod: string;
	amountPaid: number;
	notes?: string;
	recipientName?: string;
	recipientPhone?: string;
	recipientAddress?: string;
	memberId?: string;
	isMemberTransaction?: boolean;
}

export interface CreateUserInput {
	email: string;
	password: string;
	businessName?: string;
	storeId?: string;
}
