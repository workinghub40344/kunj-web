import product1 from "@/assets/product-1.jpg";
// import product2 from "@/assets/01.jpg";
// import product3 from "@/assets/05.jpg";
// import product5 from "@/assets/product-5.jpg";



export interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  colour:string;
  style_code:string;
  metal_sizes: {
    size: string;
    price: number;
  }[];
  marble_sizes: {
    size: string;
    price: number;
  }[];
  featured?: boolean;
  stock_status: "IN_STOCK" | "OUT_OF_STOCK" | "BOOKING_CLOSED";
}

export const products: Product[] = [
  {
    _id:"1",
    name: "Radha Ji Red Lehenga",
    description: "Traditional red lehenga for Radha Ji, perfect for festive occasions.",
    images: [product1],
    category: "Radha Poshak",
    colour:"Red",
    style_code:"RJL001",
    metal_sizes: [
      { size: "3-inch", price: 299 },
      { size: "4-inch", price: 349 },
      { size: "5-inch", price: 3909 }
    ],
    marble_sizes: [
      { size: "3-inch", price: 299 },
      { size: "4-inch", price: 349 },
      { size: "5-inch", price: 3909 }
    ],
    featured: true,
    stock_status: 'IN_STOCK',
  },
  // {
  //   _id:"2",
  //   name: "Krishna Ji Yellow Poshak",
  //   description: "Beautiful yellow poshak for Krishna Ji, lightweight and elegant.",
  //   images: [product2],
  //   category: "Krishna Poshak",
  //   metal_sizes: [
  //     { size: "3-inch", price: 319 },
  //     { size: "4-inch", price: 369 },
  //     { size: "5-inch", price: 419 }
  //   ],
  //   featured: true,
  //   stock_status: 'IN_STOCK',
  // },
  // {
  //   _id:"3",
  //   name: "Radha Ji Yellow Lehenga",
  //   description: "Vibrant yellow lehenga for Radha Ji, perfect for celebrations.",
  //   images: [product5],
  //   category: "Radha Poshak",
  //   metal_sizes: [
  //     { size: "3-inch", price: 359 },
  //     { size: "4-inch", price: 409 },
  //     { size: "5-inch", price: 459 }
  //   ],
  //   featured: true,
  //   stock_status: 'IN_STOCK',
  // },
  // {
  //   _id:"4",
  //   name: "Krishna Ji Red Poshak",
  //   description: "Soft red poshak for Krishna Ji, decorated with intricate embroidery.",
  //   images: [product3],
  //   category: "Krishna Poshak",
  //   metal_sizes: [
  //     { size: "3-inch", price: 349 },
  //     { size: "4-inch", price: 399 },
  //     { size: "5-inch", price: 449 }
  //   ],
  //   featured: true,
  //   stock_status: 'OUT_OF_STOCK',
  // },
];
