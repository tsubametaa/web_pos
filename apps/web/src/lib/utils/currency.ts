// Formats a numeric value into a currency string (defaulting to Indonesian Rupiah)
export function formatCurrency(amount: number, symbol = 'Rp'): string {
	if (amount === undefined || amount === null || isNaN(amount)) {
		amount = 0;
	}

	const formatted = new Intl.NumberFormat('id-ID', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);

	return `${symbol} ${formatted}`;
}
