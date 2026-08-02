// Calculates profit margin percentage: ((sellingPrice - costPrice) / sellingPrice) * 100
export function calculateMargin(costPrice: number, sellingPrice: number): number {
	if (!sellingPrice || sellingPrice <= 0) return 0;
	return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

// Calculates markup percentage: ((sellingPrice - costPrice) / costPrice) * 100
export function calculateMarkup(costPrice: number, sellingPrice: number): number {
	if (!costPrice || costPrice <= 0) return 0;
	return ((sellingPrice - costPrice) / costPrice) * 100;
}

// Calculates cost of goods sold and net profit for a list of items
export function calculateTransactionProfit(items: { qty: number; costPrice: number; sellingPrice: number }[]) {
	let totalAmount = 0;
	let totalCost = 0;

	for (const item of items) {
		totalAmount += item.qty * item.sellingPrice;
		totalCost += item.qty * item.costPrice;
	}

	const profit = totalAmount - totalCost;
	return {
		totalAmount,
		totalCost,
		profit
	};
}
