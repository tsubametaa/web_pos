export interface UIStore {
	id: string;
	name: string;
	logoUrl?: string;
	address?: string;
	phone?: string;
	receiptFooter?: string;
	taxRate?: number;
	currency?: string;
	currencySymbol?: string;
	createdById?: string;
	createdAt?: string | Date;
	updatedAt?: string | Date;
}

export interface UIProduct {
	id: string;
	storeId?: string;
	name: string;
	sku: string;
	category: string;
	unit: string;
	costPrice: number;
	sellingPrice: number;
	stock: number;
	minStock: number;
	imageUrl?: string;
	barcode?: string;
	isActive: boolean;
	notes?: string;
	createdAt?: string | Date;
	updatedAt?: string | Date;
}

export interface UICartItem {
	product: UIProduct;
	qty: number;
	customPrice?: number;
}

export interface UITransactionItem {
	productId: string;
	productName: string;
	sku: string;
	qty: number;
	costPrice: number;
	sellingPrice: number;
	subtotal: number;
}

export interface UIMemberPrice {
	id?: string;
	memberId?: string;
	sku: string;
	customPrice: number;
	createdAt?: string | Date;
	updatedAt?: string | Date;
}

export interface UIMember {
	id: string;
	name: string;
	phone: string;
	email?: string;
	address?: string;
	notes?: string;
	isActive: boolean;
	prices?: UIMemberPrice[];
	createdAt?: string | Date;
	updatedAt?: string | Date;
}

export interface UITransaction {
	id: string;
	storeId?: string;
	memberId?: string;
	memberName?: string;
	memberPhone?: string;
	isMemberTransaction?: boolean;
	transactionCode: string;
	recipientName?: string;
	recipientPhone?: string;
	recipientAddress?: string;
	items: UITransactionItem[];
	totalAmount: number;
	totalCost: number;
	profit: number;
	paymentMethod: 'cash' | 'transfer' | 'qris' | 'other';
	amountPaid: number;
	change: number;
	notes?: string;
	status: 'completed' | 'voided';
	createdAt: string | Date;
	updatedAt?: string | Date;
}

export interface UISettings {
	id?: string;
	storeId?: string;
	businessName: string;
	logoUrl?: string;
	businessAddress?: string;
	businessPhone?: string;
	currency: string;
	currencySymbol: string;
	lowStockThreshold: number;
	taxRate: number;
	receiptFooter?: string;
}

export interface ToastMessage {
	id: string;
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
}
