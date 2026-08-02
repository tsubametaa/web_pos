export interface UIProduct {
	id: string;
	name: string;
	sku: string;
	category: string;
	unit: string;
	costPrice: number;
	sellingPrice: number;
	stock: number;
	minStock: number;
	imageUrl?: string;
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

export interface UITransaction {
	id: string;
	transactionCode: string;
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
	businessName: string;
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
