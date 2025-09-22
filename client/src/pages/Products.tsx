// src/pages/Products.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, ShoppingCart, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { products as sampleProducts } from "@/data/products";

const Products = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [productQuantities, setProductQuantities] = useState<
    Record<number, { size: string; quantity: number }>
  >({});
  const [customizations, setCustomizations] = useState<Record<number, string>>(
    {}
  );
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await axios.get(`${API_URL}/api/products`);
      setProducts(data);
    };
    fetchProducts();
  }, [API_URL]);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  const sizes = [
    "all",
    ...Array.from(
      new Set(products.flatMap((p) => p.sizes.map((s) => s.size)))
    ).sort((a, b) => {
      const numA = parseInt(a); // "3-inch" => 3
      const numB = parseInt(b); // "8-inch" => 8
      return numA - numB;
    }),
  ];

  // Filter sizes by price range
  const filterSizesByPriceRange = (
    sizes: { size: string; price: number }[]
  ) => {
    if (priceRange === "all") return sizes;
    if (priceRange === "under-1500") return sizes.filter((s) => s.price < 1500);
    if (priceRange === "1500-3000")
      return sizes.filter((s) => s.price >= 1500 && s.price <= 3000);
    if (priceRange === "over-3000") return sizes.filter((s) => s.price > 3000);
    return sizes;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSize =
      selectedSize === "all" ||
      product.sizes.some((s) => s.size === selectedSize);

    let matchesPrice = true;
    if (priceRange !== "all") {
      if (priceRange === "under-1500")
        matchesPrice = product.sizes.some((s) => s.price < 1500);
      if (priceRange === "1500-3000")
        matchesPrice = product.sizes.some(
          (s) => s.price >= 1500 && s.price <= 3000
        );
      if (priceRange === "over-3000")
        matchesPrice = product.sizes.some((s) => s.price > 3000);
    }

    return matchesSearch && matchesCategory && matchesSize && matchesPrice;
  });

  const handleCustomizationChange = (index: number, text: string) => {
    setCustomizations((prev) => ({ ...prev, [index]: text }));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSize("all");
    setPriceRange("all");
  };

  const handleSizeChange = (index: number, size: string) => {
    setProductQuantities((prev) => ({
      ...prev,
      [index]: { size, quantity: prev[index]?.quantity || 1 },
    }));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setProductQuantities((prev) => ({
      ...prev,
      [index]: { ...prev[index], quantity },
    }));
  };

  const handleAddToCart = (index: number, product: Product) => {
    const selection = productQuantities[index];
    if (!selection?.size) {
      toast({
        variant: "destructive",
        title: "Size Required",
        description: "Please select a size first!",
        duration: 2000,
        className:
          "bg-destructive text-destructive-foreground border-destructive",
      });
      return;
    }

    const sizeOption = product.sizes.find((s) => s.size === selection.size);
    if (!sizeOption) return;

    addToCart({
      productId: `${index}`,
      productName: product.name,
      size: selection.size,
      quantity: selection.quantity,
      price: sizeOption.price,
      image: product.images[0],
      customization: customizations[index] || "",
    });
  };

  // const getProductPrice = (product: Product, selectedSize?: string) => {
  //   if (selectedSize) {
  //     const sizeOption = product.sizes.find(s => s.size === selectedSize);
  //     return sizeOption?.price || product.sizes[0].price;
  //   }
  //   return filterSizesByPriceRange(product.sizes)[0]?.price || product.sizes[0].price;
  // };

  const getProductPrice = (
    product: Product,
    selectedSize?: string,
    quantity?: number
  ) => {
    const basePrice = selectedSize
      ? product.sizes.find((s) => s.size === selectedSize)?.price ||
        product.sizes[0].price
      : filterSizesByPriceRange(product.sizes)[0]?.price ||
        product.sizes[0].price;

    if (quantity) {
      return basePrice * quantity;
    }
    return basePrice;
  };

  const ProductModal = ({
    product,
    index,
  }: {
    product: Product;
    index: number;
  }) => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Size:
              </label>
              <Select
                value={productQuantities[index]?.size || ""}
                onValueChange={(size) => handleSizeChange(index, size)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose size" />
                </SelectTrigger>
                <SelectContent>
                  {filterSizesByPriceRange(product.sizes)
                    .sort((a, b) => {
                      const numA = parseInt(a.size);
                      const numB = parseInt(b.size);
                      return numA - numB;
                    })
                    .map((sizeOption) => (
                      <SelectItem key={sizeOption.size} value={sizeOption.size}>
                        {sizeOption.size} - ₹{sizeOption.price}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Quantity:
              </label>
              <Select
                value={String(productQuantities[index]?.quantity || 1)}
                onValueChange={(qty) =>
                  handleQuantityChange(index, parseInt(qty))
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="font-bold text-primary flex-1 text-right">
              ₹
              {getProductPrice(
                product,
                productQuantities[index]?.size,
                productQuantities[index]?.quantity
              )}
            </span>

            <Button
              onClick={() => handleAddToCart(index, product)}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!productQuantities[index]?.size}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="container mx-auto px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Our Divine Collection
        </h1>
        <p className="text-muted-foreground text-lg">
          Handcrafted Poshak and accessories for Lord Krishna and Radha Rani
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger>
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size === "all" ? "All Sizes" : size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under-1500">Under ₹1,500</SelectItem>
              <SelectItem value="1500-3000">₹1,500 - ₹3,000</SelectItem>
              <SelectItem value="over-3000">Over ₹3,000</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredProducts.map((product, index) => {
          const availableSizes = filterSizesByPriceRange(product.sizes).sort(
            (a, b) => {
              const numA = parseInt(a.size); // "3-inch" => 3
              const numB = parseInt(b.size); // "8-inch" => 8
              return numA - numB;
            }
          );
          return (
            <Card key={index} className="product-card group">
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-white/80 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <Badge
                  variant="secondary"
                  className="mb-2 text-xs rounded-[3px]"
                >
                  {product.category}
                </Badge>
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="space-y-3">
                  <Select
                    value={productQuantities[index]?.size || ""}
                    onValueChange={(size) => handleSizeChange(index, size)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSizes.map((sizeOption) => (
                        <SelectItem
                          key={sizeOption.size}
                          value={sizeOption.size}
                        >
                          {sizeOption.size} - ₹{sizeOption.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Select
                      value={String(productQuantities[index]?.quantity || 1)}
                      onValueChange={(qty) =>
                        handleQuantityChange(index, parseInt(qty))
                      }
                    >
                      <SelectTrigger className="w-16 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="font-bold text-primary flex-1 text-right">
                      ₹
                      {getProductPrice(
                        product,
                        productQuantities[index]?.size,
                        productQuantities[index]?.quantity
                      )}
                    </span>
                  </div>

                  <textarea
                    placeholder="Customization (optional)"
                    value={customizations[index] || ""}
                    onChange={(e) =>
                      handleCustomizationChange(index, e.target.value)
                    }
                    className="w-full border rounded-md p-2 text-xs mb-2"
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(index, product)}
                      className="flex-1 bg-primary hover:bg-primary/90 h-8 text-sm"
                    >
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      Add to Cart
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <ProductModal product={product} index={index} />
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No products found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
