import Fuse, { type IFuseOptions } from 'fuse.js';
import type { UIProduct } from '../../types';

// Fuse.js configuration for product search.
const PRODUCT_FUSE_OPTIONS: IFuseOptions<UIProduct> = {
	threshold: 0.35,
	distance: 100,
	minMatchCharLength: 2,
	includeScore: true,
	shouldSort: true,
	keys: [
		{ name: 'name', weight: 0.6 },
		{ name: 'sku', weight: 0.3 },
		{ name: 'category', weight: 0.1 }
	]
};

// Creates a Fuse instance for a given product list.

export function createProductFuse(products: UIProduct[]): Fuse<UIProduct> {
	return new Fuse(products, PRODUCT_FUSE_OPTIONS);
}

// Filters products using fuzzy search.
export function fuzzySearchProducts(
	fuse: Fuse<UIProduct>,
	products: UIProduct[],
	query: string
): UIProduct[] {
	const trimmed = query.trim();
	if (trimmed.length < 2) return products;
	return fuse.search(trimmed).map((result) => result.item);
}

// Convenience: create a Fuse from a subset and search immediately.
export function fuzzySearchSubset(products: UIProduct[], query: string): UIProduct[] {
	const trimmed = query.trim();
	if (trimmed.length < 2) return products;
	const fuse = new Fuse(products, PRODUCT_FUSE_OPTIONS);
	return fuse.search(trimmed).map((result) => result.item);
}
