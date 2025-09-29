import { useState, useEffect, useMemo } from "react";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ProductDetailModal } from "@/components/products/ProductDetailModal";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  const [productStates, setProductStates] = useState<
    Record<string, { size: string; quantity: number; customization: string }>
  >({});

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/products`);
        setProducts(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch products.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [API_URL, toast]);

  const handleStateChange = (
    productId: string,
    field: "size" | "quantity" | "customization",
    value: string | number
  ) => {
    const defaultSize =
      products.find((p) => p._id === productId)?.sizes[0]?.size || "";
    setProductStates((prev) => ({
      ...prev,
      [productId]: {
        size: prev[productId]?.size || defaultSize,
        quantity: prev[productId]?.quantity || 1,
        customization: prev[productId]?.customization || "",
        [field]: value,
      },
    }));
  };

  const handleAddToCart = (product: Product) => {
    const selection = productStates[product._id];
    const selectedSize = selection?.size || product.sizes[0]?.size;

    if (!selectedSize) {
      toast({
        variant: "destructive",
        title: "Size Required",
        description: "Please select a size first!",
      });
      return;
    }
    const sizeOption = product.sizes.find((s) => s.size === selectedSize);
    if (!sizeOption) return;

    addToCart({
      productId: product._id,
      productName: product.name,
      size: selectedSize,
      quantity: selection?.quantity || 1,
      price: sizeOption.price,
      image: product.images[0],
      customization: selection?.customization || "",
    });
    toast({
      title: "Success!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const getProductPrice = (product: Product, size?: string) => {
    const selected = size || product.sizes[0]?.size;
    return product.sizes.find((s) => s.size === selected)?.price || 0;
  };

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );
  const sizes = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(products.flatMap((p) => p.sizes.map((s) => s.size)))
      ).sort((a, b) => parseInt(a) - parseInt(b)),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
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
  }, [products, searchTerm, selectedCategory, selectedSize, priceRange]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSize("all");
    setPriceRange("all");
  };

  const getStockBadge = (status: Product["stock_status"]) => {
    const baseClasses =
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center";
    switch (status) {
      case "OUT_OF_STOCK":
        return (
          <Badge
            variant="destructive"
            className={`${baseClasses} rounded-none bg-gray-400 text-sm font-bold`}
          >
            Out of Stock
          </Badge>
        );
      case "BOOKING_CLOSED":
        return (
          <Badge
            variant="secondary"
            className={`${baseClasses} rounded-none bg-gray-400 text-sm font-bold`}
          >
            Booking Closed
          </Badge>
        );
      default:
        return null;
    }
  };

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

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 sticky top-[65px] z-20">
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
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger>
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All Sizes" : s}
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
            <Filter className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-lg">Loading products...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product._id}
                className="product-card group flex flex-col"
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="aspect-square overflow-hidden relative cursor-pointer">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {getStockBadge(product.stock_status)}
                      {product.stock_status !== "IN_STOCK" && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center"></div>
                      )}
                    </div>
                  </DialogTrigger>
                  <ProductDetailModal
                    product={product}
                    selectedSize={
                      productStates[product._id]?.size || product.sizes[0]?.size
                    }
                    selectedQuantity={productStates[product._id]?.quantity || 1}
                    customizationText={
                      productStates[product._id]?.customization || ""
                    }
                    onSizeChange={(size) =>
                      handleStateChange(product._id, "size", size)
                    }
                    onQuantityChange={(qty) =>
                      handleStateChange(product._id, "quantity", qty)
                    }
                    onCustomizationChange={(text) =>
                      handleStateChange(product._id, "customization", text)
                    }
                    onAddToCart={() => handleAddToCart(product)}
                    getProductPrice={(p, s, q) =>
                      getProductPrice(p, s || p.sizes[0]?.size) * (q || 1)
                    }
                  />
                </Dialog>

                <CardContent className="p-4 flex flex-col flex-grow">
                  <Badge variant="secondary" className="mb-2 w-fit rounded-[2px]">{product.category}</Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1 cursor-pointer hover:text-primary">
                        {product.name}
                      </h3>
                    </DialogTrigger>
                    <ProductDetailModal
                      product={product}
                      selectedSize={
                        productStates[product._id]?.size ||
                        product.sizes[0]?.size
                      }
                      selectedQuantity={
                        productStates[product._id]?.quantity || 1
                      }
                      customizationText={
                        productStates[product._id]?.customization || ""
                      }
                      onSizeChange={(size) =>
                        handleStateChange(product._id, "size", size)
                      }
                      onQuantityChange={(qty) =>
                        handleStateChange(product._id, "quantity", qty)
                      }
                      onCustomizationChange={(text) =>
                        handleStateChange(product._id, "customization", text)
                      }
                      onAddToCart={() => handleAddToCart(product)}
                      getProductPrice={(p, s, q) =>
                        getProductPrice(p, s || p.sizes[0]?.size) * (q || 1)
                      }
                    />
                  </Dialog>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                    {product.description}
                  </p>

                  <div className="space-y-3 mt-auto">
                    <Select
                      value={
                        productStates[product._id]?.size ||
                        product.sizes[0]?.size
                      }
                      onValueChange={(size) =>
                        handleStateChange(product._id, "size", size)
                      }
                      disabled={product.stock_status !== "IN_STOCK"}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map((s) => (
                          <SelectItem key={s.size} value={s.size}>
                            {s.size} - ₹{s.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Select
                        value={String(
                          productStates[product._id]?.quantity || 1
                        )}
                        onValueChange={(qty) =>
                          handleStateChange(
                            product._id,
                            "quantity",
                            parseInt(qty)
                          )
                        }
                        disabled={product.stock_status !== "IN_STOCK"}
                      >
                        <SelectTrigger className="w-20 h-9 text-sm">
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
                      <span className="font-bold text-primary flex-1 text-right text-lg">
                        ₹
                        {getProductPrice(
                          product,
                          productStates[product._id]?.size
                        ) * (productStates[product._id]?.quantity || 1)}
                      </span>
                    </div>
                    <textarea
                      placeholder="Customization (optional)"
                      value={productStates[product._id]?.customization || ""}
                      onChange={(e) =>
                        handleStateChange(
                          product._id,
                          "customization",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-md p-2 text-xs"
                      rows={1}
                      disabled={product.stock_status !== "IN_STOCK"}
                    />
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-primary hover:bg-primary/90 h-9 text-sm"
                      disabled={product.stock_status !== "IN_STOCK"}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16 col-span-full">
              <p className="text-muted-foreground text-xl">
                No products found matching your criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
