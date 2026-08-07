import type { EtalaseResponse, Product, ShopSettings, Store } from './types';

const API_BASE_URL = (import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

export async function fetchEtalaseCatalog(): Promise<{ products: Product[]; stores: Store[]; settings: ShopSettings | null }> {
  try {
    const res = await fetch(`${API_BASE_URL}/etalase`);
    if (!res.ok) {
      throw new Error(`HTTP error status: ${res.status}`);
    }
    const data: EtalaseResponse = await res.json();
    if (data.success) {
      return {
        products: data.products || [],
        stores: data.stores || [],
        settings: data.settings || null,
      };
    }
    return { products: [], stores: [], settings: null };
  } catch (error) {
    console.warn('API fetchEtalaseCatalog failed, fallbacking to client mock if offline:', error);
    return { products: [], stores: [], settings: null };
  }
}


export async function fetchProductDetail(id: string): Promise<{ product: Product | null; settings: ShopSettings | null }> {
  try {
    const res = await fetch(`${API_BASE_URL}/etalase/${id}`);
    if (!res.ok) {
      throw new Error(`HTTP error status: ${res.status}`);
    }
    const data = await res.json();
    if (data.success) {
      return {
        product: data.product || null,
        settings: data.settings || null,
      };
    }
    return { product: null, settings: null };
  } catch (error) {
    console.warn('API fetchProductDetail failed:', error);
    return { product: null, settings: null };
  }
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getProductImageUrl(imagePath?: string): string {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80';
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const apiServerHost = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${apiServerHost}${cleanPath}`;
}

