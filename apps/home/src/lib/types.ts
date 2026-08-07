export interface Product {
  id: string;
  storeId?: string;
  name: string;
  sku: string;
  category: string;
  sellingPrice: number;
  costPrice?: number;
  description?: string;
  imageUrl?: string;
  image?: string;
  unit?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Store {
  id: string;
  name: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
}

export interface ShopSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  currencySymbol: string;
}

export interface EtalaseResponse {
  success: boolean;
  products: Product[];
  stores?: Store[];
  settings: ShopSettings | null;
  error?: string;
}


export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'furnitur' | 'aluminium';
  description: string;
  features: string[];
  icon: string;
  badge: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  client: string;
  location: string;
  image: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatar?: string;
}
