export interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  sizes: {
    size: string;
    price: number;
  }[];
  featured?: boolean;
}

export const products: Product[] = [];
