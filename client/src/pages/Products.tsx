import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { ProductDetailModal } from "@/components/products/ProductDetailModal";
import { ProductGrid } from "@/components/products/ProductGrid"; // Naya component import karein
import { useProducts } from "@/context/ProductContext";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { PagdiModal } from "@/components/products/PagdiSizeModal";

export type ProductState = { selectedSize?: string; selectedSizeType?: "metal" | "marble"; quantity: number; customization: string; };

const Products = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedColour, setSelectedColour] = useState("all");
  const [productStates, setProductStates] = useState<Record<string, ProductState>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pagdiModalProduct, setPagdiModalProduct] = useState<Product | null>(null);

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (products.length > 0) {
      const initialStates: Record<string, ProductState> = {};
      products.forEach((product) => {
        let defaultSize: string | undefined = undefined;
        let defaultSizeType: "metal" | "marble" | undefined = undefined;

        if (product.metal_sizes && product.metal_sizes.length > 0) {
          defaultSize = product.metal_sizes[0].size;
          defaultSizeType = "metal";
        } else if (product.marble_sizes && product.marble_sizes.length > 0) {
          defaultSize = product.marble_sizes[0].size;
          defaultSizeType = "marble";
        }

        if (defaultSize) {
          initialStates[product._id] = {
            selectedSize: defaultSize,
            selectedSizeType: defaultSizeType,
            quantity: 1,
            customization: "",
          };
        }
      });
      setProductStates(initialStates);
    }
  }, [products]);

  const getAllSizes = (product: Product) => [
    ...(product.metal_sizes || []),
    ...(product.marble_sizes || []),
  ];

  const handleSizeSelect = ( productId: string, size: string, type: "metal" | "marble" ) => {
    setProductStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: prev[productId]?.quantity || 1,
        customization: prev[productId]?.customization || "",
        selectedSize: size,
        selectedSizeType: type,
      },
    }));
  };

  const handleOtherStateChange = ( productId: string, field: "quantity" | "customization", value: string | number ) => {
    setProductStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity:
          field === "quantity"
            ? (value as number)
            : prev[productId]?.quantity || 1,
        customization:
          field === "customization"
            ? (value as string)
            : prev[productId]?.customization || "",
      },
    }));
  };

  const handleAddToCart = (product: Product) => {
  const state = productStates[product._id];
  if (!state?.selectedSize) {
    toast({ 
      title: "Size Required", 
      description: "Please select a size first!" 
    });
    return;
  }
  setPagdiModalProduct(product); // Modal kholne ke liye state set karein
  };
  
  const handleConfirmAddToCart = (product: Product, pagdiOption?: { size: string; price: number; type: string }) => {
  const state = productStates[product._id];
  const selectedSize = state?.selectedSize;
  const selectedType = state?.selectedSizeType;

  let sizeOption;
  if (selectedType === 'metal') {
    sizeOption = product.metal_sizes?.find(s => s.size === selectedSize);
  } else {
    sizeOption = product.marble_sizes?.find(s => s.size === selectedSize);
  }

  if (!sizeOption) {
    console.error("Could not find matching size option");
    return;
  }

  if (!state || !selectedSize || !selectedType || !sizeOption) {
    toast({ title: "Error", description: "Invalid product state. Please try again." });
    return
  };

  addToCart({
    itemCode: product.itemCode,
    productId: product._id,
    productName: product.name,
    size: selectedSize,
    sizeType: selectedType === "metal" ? "Metal" : "Marble",
    quantity: state.quantity || 1,
    price: sizeOption.price,
    image: product.images[0],
    customization: state.customization || "",
    pagdi: pagdiOption, 
  });

  toast({ title: "Success!", description: `${product.name} has been added to your cart.` });
  setPagdiModalProduct(null); 
};

  const getProductPrice = ( product: Product, size?: string, type?: "metal" | "marble") => {
    if (!size) return 0;
    if (type === "metal") { return product.metal_sizes?.find((s) => s.size === size)?.price || 0; }
    if (type === "marble") { return product.marble_sizes?.find((s) => s.size === size)?.price || 0; }
    const allSizes = getAllSizes(product);
    return allSizes.find((s) => s.size === size)?.price || 0;
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

  const categories = useMemo( () => ["all", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const sizes = useMemo( () => [ 
        "all", ...Array.from( new Set(products.flatMap((p) => getAllSizes(p).map((s) => s.size)))).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      }),
    ],
    [products]
  );
  const colours = useMemo( () => [ "all", ...Array.from(new Set(products.map((p) => p.colour).filter(Boolean))),], [products]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products.filter((p) => p.style_code === selectedProduct.style_code);
  }, [selectedProduct, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const allSizes = getAllSizes(product);
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesColour =
        selectedColour === "all" || product.colour === selectedColour;

      let meetsCriteria = true;
      if (selectedSize !== "all" || priceRange !== "all") {
        const filteredVariants = allSizes.filter((variant) => {
          const sizeMatch =
            selectedSize === "all" || variant.size === selectedSize;
          let priceMatch = true;
          if (priceRange === "under-1500") priceMatch = variant.price < 1500;
          if (priceRange === "1500-3000")
            priceMatch = variant.price >= 1500 && variant.price <= 3000;
          if (priceRange === "over-3000") priceMatch = variant.price > 3000;
          return sizeMatch && priceMatch;
        });
        meetsCriteria = filteredVariants.length > 0;
      }

      return matchesSearch && matchesCategory && matchesColour && meetsCriteria;
    });
  }, [ products, searchTerm, selectedCategory, selectedSize, priceRange, selectedColour ]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSize("all");
    setPriceRange("all");
    setSelectedColour("all");
  };

  if (loading) return <p className="text-center text-lg p-8">Loading products...</p>;
  if (error) return <p className="text-center text-lg p-8 text-destructive">{error}</p>;

  return (
    <div className="container mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Our Divine Collection
        </h1>
        <p className="text-muted-foreground text-lg">
          Handcrafted Poshak and accessories for Lord Krishna and Radha Rani
        </p>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 sticky top-[65px] z-20">
        <div className="hidden lg:grid grid-flow-col auto-cols-max gap-8 items-center">
          <div className="relative ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[30vw]"
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
          <Select value={selectedColour} onValueChange={setSelectedColour}>
            <SelectTrigger>
              <SelectValue placeholder="Colour" />
            </SelectTrigger>
            <SelectContent>
              {colours.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All Colours" : c}
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
        {/* Mobile Filters */}
        <div className="grid grid-cols-5 gap-4 lg:hidden">
          <div className="relative col-span-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[250px] p-4 space-y-4"
              align="end"
            >
              <div>
                <Label>Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
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
              </div>
              <div>
                <Label>Colour</Label>
                <Select
                  value={selectedColour}
                  onValueChange={setSelectedColour}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Colour" />
                  </SelectTrigger>
                  <SelectContent>
                    {colours.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c === "all" ? "All Colours" : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Size</Label>
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
              </div>
              <div>
                <Label>Price Range</Label>
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
              </div>
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="w-full"
              >
                Reset Filters
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Product Cards */}
      <ProductGrid 
        products={filteredProducts}
        productStates={productStates}
        setSelectedProduct={setSelectedProduct}
        handleSizeSelect={handleSizeSelect}
        handleOtherStateChange={handleOtherStateChange}
        handleAddToCart={handleAddToCart}
        getProductPrice={getProductPrice}
        getStockBadge={getStockBadge}
      />
      <Dialog open={!!selectedProduct} onOpenChange={(isOpen) => { if (!isOpen) setSelectedProduct(null); }}>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            relatedProducts={relatedProducts}
            onSelectVariant={setSelectedProduct}
            selectedSize={productStates[selectedProduct._id]?.selectedSize}
            selectedSizeType={productStates[selectedProduct._id]?.selectedSizeType}
            selectedQuantity={productStates[selectedProduct._id]?.quantity || 1}
            customizationText={productStates[selectedProduct._id]?.customization || ""}
            onSizeSelect={(size, type) => handleSizeSelect(selectedProduct._id, size, type)}
            onQuantityChange={(qty) => handleOtherStateChange(selectedProduct._id, "quantity", qty)}
            onCustomizationChange={(text) => handleOtherStateChange(selectedProduct._id, "customization", text)}
            onAddToCart={() => handleAddToCart(selectedProduct)}
            getProductPrice={(p, s, q) =>
              getProductPrice(
                p,
                productStates[p._id]?.selectedSize || s,
                productStates[p._id]?.selectedSizeType
              ) * (q || 1)
            }
          />
        )}
      </Dialog>

      <PagdiModal
        isOpen={!!pagdiModalProduct}
        onClose={() => setPagdiModalProduct(null)}
        product={pagdiModalProduct}
        productState={pagdiModalProduct ? productStates[pagdiModalProduct._id] : undefined}
        onConfirm={handleConfirmAddToCart}
      />

    </div>
  );
};

export default Products;
