export interface Product {
  id: string;
  slug: string;
  price: number;
  cost: number;
  images: string[];
  category: "kitchen" | "home" | "lifestyle" | "tech" | "organization" | "wellness";
  featured: boolean;
  inStock: boolean;
  cjProductId?: string;
  cjSku?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
