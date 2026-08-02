function sanitizeString(str: string): string {
	let clean = str.trim();
	// Escape basic HTML tag indicators to prevent HTML/JS injection (XSS)
	clean = clean
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	return clean;
}

export function sanitizeInput(val: any): any {
	if (typeof val === 'string') {
		return sanitizeString(val);
	}
	if (Array.isArray(val)) {
		return val.map(sanitizeInput);
	}
	// Skip File/Blob objects — do not attempt to recurse into binary file data
	if (val instanceof File || val instanceof Blob) {
		return val;
	}
	if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
		const cleanObj: Record<string, any> = {};
		for (const key of Object.keys(val)) {
			cleanObj[key] = sanitizeInput(val[key]);
		}
		return cleanObj;
	}
	return val;
}
