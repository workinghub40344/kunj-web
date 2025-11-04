import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import type { ProductState } from "@/pages/Products";
import { getOptimizedImage } from "@/lib/cloudinary";

interface ProductGridProps {
  products: Product[];
  productStates: Record<string, ProductState>;
  handleSizeSelect: (
    productId: string,
    size: string,
    type: "metal" | "marble"
  ) => void;
  handleOtherStateChange: (
    productId: string,
    field: "quantity" | "customization",
    value: string | number
  ) => void;
  handleAddToCart: (product: Product) => void;
  setSelectedProduct: (product: Product) => void;
  getProductPrice: (
    product: Product,
    size?: string,
    type?: "metal" | "marble"
  ) => number;
  getStockBadge: (status: Product["stock_status"]) => React.ReactNode;
}

export const ProductGrid = ({
    products,
    productStates,
    handleSizeSelect,
    handleOtherStateChange,
    handleAddToCart,
    setSelectedProduct,
    getProductPrice,
    getStockBadge,
}: ProductGridProps) => {

  // Pagination Logics
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const totalPages = Math.ceil(products.length / productsPerPage);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return products.slice(start, start + productsPerPage);
  }, [products, currentPage]);

  useEffect(() => {
  setCurrentPage(1);
}, [products]);

if (products.length === 0) {
    return (
      <div className="text-center py-16 col-span-full">
        <p className="text-muted-foreground text-xl">
          No products found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className=""> 
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {currentProducts.map((product) => {
        const state = productStates[product._id];
        return (
          <Card key={product._id} className="product-card group flex flex-col">
            <div
              className="aspect-square overflow-hidden relative cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <img
                src={getOptimizedImage(product.images?.[0], 1000)}
                loading="lazy"
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />

              {getStockBadge(product.stock_status)}
              {product.stock_status !== "IN_STOCK" && (
                <div className="absolute inset-0 bg-black/30"></div>
              )}
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
              <Badge variant="secondary" className="mb-2 w-fit rounded-[2px]">
                {product.category}
              </Badge>
              <h3
                className="font-semibold text-lg mb-2 line-clamp-1 cursor-pointer hover:text-primary"
                onClick={() => setSelectedProduct(product)}
              >
                {product.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                {product.description}
              </p>
              
              <div className="space-y-3 mt-auto">
                {/* Metal Size Section */}
                <div>
                  <label className="text-xs text-muted-foreground">Metal Size</label>
                  {product.metal_sizes && product.metal_sizes.length > 0 ? (
                    <Select
                      value={state?.selectedSizeType === "metal" ? state.selectedSize : ""}
                      onValueChange={(size) => handleSizeSelect(product._id, size, "metal")}
                      disabled={product.stock_status !== "IN_STOCK"}
                    >
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {product.metal_sizes.map((s) => (
                          <SelectItem key={s.size} value={s.size}>{s.size} - ₹{s.price}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input className="h-9 text-sm bg-gray-100" value="Not Available" disabled />
                  )}
                </div>

                {/* Marble Size Section */}
                <div>
                  <label className="text-xs text-muted-foreground">Marble Size</label>
                  {product.marble_sizes && product.marble_sizes.length > 0 ? (
                    <Select
                      value={state?.selectedSizeType === "marble" ? state.selectedSize : ""}
                      onValueChange={(size) => handleSizeSelect(product._id, size, "marble")}
                      disabled={product.stock_status !== "IN_STOCK"}
                    >
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {product.marble_sizes.map((s) => (
                          <SelectItem key={s.size} value={s.size}>{s.size} - ₹{s.price}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input className="h-9 text-sm bg-gray-100" value="Not Available" disabled />
                  )}
                </div>
                {/* ======================================= */}
                
                <div className="flex items-center gap-2">
                  <Select value={String(state?.quantity || 1)} onValueChange={(qty) => handleOtherStateChange(product._id, "quantity", parseInt(qty))} disabled={product.stock_status !== "IN_STOCK"}>
                    <SelectTrigger className="w-20 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4, 5].map((num) => (<SelectItem key={num} value={String(num)}>{num}</SelectItem>))}</SelectContent>
                  </Select>
                  <span className="font-bold text-primary flex-1 text-right text-lg">
                    ₹{getProductPrice(product, state?.selectedSize, state?.selectedSizeType) * (state?.quantity || 1)}
                  </span>
                </div>
                <textarea
                  placeholder="Customization (optional)"
                  value={state?.customization || ""}
                  onChange={(e) => handleOtherStateChange(product._id, "customization", e.target.value)}
                  className="w-full border rounded-md p-2 text-xs"
                  rows={1}
                  disabled={product.stock_status !== "IN_STOCK"}
                />
                <Button onClick={() => handleAddToCart(product)} className="w-full bg-primary hover:bg-primary/90 h-9 text-sm" disabled={product.stock_status !== "IN_STOCK"}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
          {/* Prev */}
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </Button>

          {/* Dynamic Pages with ... */}
          {(() => {
            const pagesToShow: (number | string)[] = [];
            const maxButtons = 5;
          
            if (currentPage > 3) pagesToShow.push(1);
            if (currentPage > 4) pagesToShow.push("...");
          
            for (
              let i = Math.max(1, currentPage - 1);
              i <= Math.min(totalPages, currentPage + 1);
              i++
            ) {
              pagesToShow.push(i);
            }
          
            if (currentPage < totalPages - 3) pagesToShow.push("...");
            if (currentPage < totalPages - 2) pagesToShow.push(totalPages);
          
            return pagesToShow.map((page, i) =>
              page === "..." ? (
                <span key={i} className="px-2 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={i}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page as number)}
                >
                  {page}
                </Button>
              )
            );
          })()}

          {/* Next */}
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
};