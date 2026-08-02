// Formats a Date object or date string into Indonesian readable date
export function formatDate(date: Date | string | number): string {
	if (!date) return '-';
	const d = new Date(date);
	if (isNaN(d.getTime())) return '-';

	return new Intl.DateTimeFormat('id-ID', {
		dateStyle: 'long',
		timeStyle: 'medium'
	}).format(d);
}

// Formats a Date object or date string into short Indonesian readable date (no time)
export function formatDateShort(date: Date | string | number): string {
	if (!date) return '-';
	const d = new Date(date);
	if (isNaN(d.getTime())) return '-';

	return new Intl.DateTimeFormat('id-ID', {
		dateStyle: 'medium'
	}).format(d);
}
