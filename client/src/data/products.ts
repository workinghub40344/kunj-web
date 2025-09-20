import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";


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


export const products: Product[] = [
  {
    _id: "1",
    id: "rkj001",
    name: "Radha Ji Red Lehenga",
    description: "Traditional red lehenga for Radha Ji, perfect for festive occasions.",
    images: [product1],
    category: "Radha Poshak",
    sizes: [
      { size: "3-inch", price: 299 },
      { size: "4-inch", price: 349 },
      { size: "5-inch", price: 399 }
    ],
    featured: true
  },
  {
    _id: "2",
    id: "rkj002",
    name: "Radha Ji Blue Saree",
    description: "Beautiful blue saree for Radha Ji, lightweight and elegant.",
    images: [product2],
    category: "Radha Poshak",
    sizes: [
      { size: "3-inch", price: 319 },
      { size: "4-inch", price: 369 },
      { size: "5-inch", price: 419 }
    ],
    featured: true
  },
  {
    _id: "3",
    id: "rkj003",
    name: "Radha Ji Pink Ghagra",
    description: "Soft pink ghagra for Radha Ji, decorated with intricate embroidery.",
    images: [product3],
    category: "Radha Poshak",
    sizes: [
      { size: "3-inch", price: 349 },
      { size: "4-inch", price: 399 },
      { size: "5-inch", price: 449 }
    ],
    featured: true
  },
  {
    _id: "4",
    id: "rkj004",
    name: "Radha Ji Yellow Lehenga",
    description: "Vibrant yellow lehenga for Radha Ji, perfect for celebrations.",
    images: [product4],
    category: "Radha Poshak",
    sizes: [
      { size: "3-inch", price: 359 },
      { size: "4-inch", price: 409 },
      { size: "5-inch", price: 459 }
    ]
  },
  {
    _id: "5",
    id: "rkj005",
    name: "Krishna Ji Dhoti White",
    description: "Elegant white dhoti for Krishna Ji, simple and traditional.",
    images: [product5],
    category: "Krishna Poshak",
    sizes: [
      { size: "3-inch", price: 299 },
      { size: "4-inch", price: 349 },
      { size: "5-inch", price: 399 }
    ]
  },
  {
    _id: "6",
    id: "rkj006",
    name: "Krishna Ji Yellow Dhoti",
    description: "Bright yellow dhoti for Krishna Ji, festive look.",
    images: [product6],
    category: "Krishna Poshak",
    sizes: [
      { size: "3-inch", price: 319 },
      { size: "4-inch", price: 369 },
      { size: "5-inch", price: 419 }
    ]
  },
  {
    _id: "7",
    id: "rkj007",
    name: "Krishna Ji Blue Angarkha",
    description: "Blue angarkha for Krishna Ji, adorned with small embellishments.",
    images: [product7],
    category: "Krishna Poshak",
    sizes: [
      { size: "3-inch", price: 349 },
      { size: "4-inch", price: 399 },
      { size: "5-inch", price: 449 }
    ]
  },
  {
    _id: "8",
    id: "rkj008",
    name: "Krishna Ji Peacock Dhoti",
    description: "Peacock color dhoti for Krishna Ji, vibrant and stylish.",
    images: [product8],
    category: "Krishna Poshak",
    sizes: [
      { size: "3-inch", price: 359 },
      { size: "4-inch", price: 409 },
      { size: "5-inch", price: 459 }
    ],
    featured: true
  }
];

