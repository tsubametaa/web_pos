/**
 * Light-weight, self-contained Code128 (B-type) Barcode SVG Generator
 * Generates sharp, vector 1D barcodes suitable for thermal printers and web UI displays.
 */

// Code 128 B Character Encoding Table (Bar and Space widths: 6 elements per pattern)
const CODE128_PATTERNS: Record<number, string> = {
	0: "212222", 1: "222122", 2: "222221", 3: "121223", 4: "121322", 5: "131222",
	6: "122213", 7: "122312", 8: "132212", 9: "221213", 10: "221312", 11: "231212",
	12: "112232", 13: "122132", 14: "122231", 15: "113222", 16: "123122", 17: "123221",
	18: "223211", 19: "221132", 20: "221231", 21: "213212", 22: "223112", 23: "312131",
	24: "311222", 25: "321122", 26: "321221", 27: "312212", 28: "322112", 29: "322211",
	30: "212123", 31: "212321", 32: "232121", 33: "111323", 34: "131123", 35: "131321",
	36: "112313", 37: "132113", 38: "132311", 39: "211313", 40: "231113", 41: "231311",
	42: "112133", 43: "112331", 44: "132131", 45: "113123", 46: "113321", 47: "133121",
	48: "313121", 49: "211331", 50: "231131", 51: "213113", 52: "213311", 53: "213131",
	54: "311123", 55: "311321", 56: "331121", 57: "312113", 58: "312311", 59: "332111",
	60: "314111", 61: "221411", 62: "431111", 63: "111224", 64: "111422", 65: "121124",
	66: "121421", 67: "141122", 68: "141221", 69: "112214", 70: "112412", 71: "122114",
	72: "122411", 73: "142112", 74: "142211", 75: "241211", 76: "221114", 77: "413111",
	78: "241112", 79: "134111", 80: "111242", 81: "121142", 82: "121241", 83: "114212",
	84: "124112", 85: "124211", 86: "411212", 87: "421112", 88: "421211", 89: "212141",
	90: "214121", 91: "412121", 92: "111143", 93: "111341", 94: "131141", 95: "114113",
	96: "114311", 97: "411113", 98: "411311", 99: "113141", 100: "114131", 101: "311141",
	102: "411131", 103: "211412", 104: "211214", 105: "211232" // 104 = Start B, 105 = Start C
};

const STOP_PATTERN = "2331112"; // Stop character pattern + final 2-width bar

export interface BarcodeOptions {
	height?: number;
	moduleWidth?: number;
	showText?: boolean;
	fontSize?: number;
	fontFamily?: string;
}

export function generateCode128SVG(codeString: string, options: BarcodeOptions = {}): string {
	const text = (codeString || 'PRD-0000').trim();
	const height = options.height || 50;
	const moduleWidth = options.moduleWidth || 2;
	const showText = options.showText !== false;
	const fontSize = options.fontSize || 12;
	const fontFamily = options.fontFamily || 'monospace';

	// Encode using Code 128 Set B (standard ASCII 32..126)
	const codes: number[] = [104]; // Start Code B
	let checksum = 104;

	for (let i = 0; i < text.length; i++) {
		const charCode = text.charCodeAt(i);
		// ASCII 32..126 map to values 0..94 in Code128 Set B
		let codeVal = charCode - 32;
		if (codeVal < 0 || codeVal > 95) {
			codeVal = 31; // Fallback to '?'
		}
		codes.push(codeVal);
		checksum += codeVal * (i + 1);
	}

	const checkSymbol = checksum % 103;
	codes.push(checkSymbol);

	// Convert code values to bar/space width string
	let patternStr = '';
	for (const codeVal of codes) {
		patternStr += CODE128_PATTERNS[codeVal] || CODE128_PATTERNS[0];
	}
	patternStr += STOP_PATTERN;

	// Calculate total barcode width
	let totalModules = 0;
	for (let i = 0; i < patternStr.length; i++) {
		totalModules += parseInt(patternStr[i], 10);
	}

	const quietZoneModules = 10;
	const fullWidth = (totalModules + quietZoneModules * 2) * moduleWidth;
	const fullHeight = height + (showText ? fontSize + 8 : 0);

	let currentX = quietZoneModules * moduleWidth;
	let pathD = '';

	// Build SVG path for black bars
	for (let i = 0; i < patternStr.length; i++) {
		const width = parseInt(patternStr[i], 10) * moduleWidth;
		const isBar = i % 2 === 0; // Even indices are bars (black), odd are spaces (white)

		if (isBar) {
			pathD += `M${currentX},0 V${height} H${currentX + width} V0 Z `;
		}
		currentX += width;
	}

	const textY = height + fontSize + 2;

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fullWidth} ${fullHeight}" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" />
  <path d="${pathD.trim()}" fill="#000000" />
  ${showText ? `<text x="${fullWidth / 2}" y="${textY}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="bold" fill="#000000" text-anchor="middle" letter-spacing="1.5">${escapeXml(text)}</text>` : ''}
</svg>`;
}

function escapeXml(unsafe: string): string {
	return unsafe.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			case '\'': return '&apos;';
			case '"': return '&quot;';
			default: return c;
		}
	});
}
