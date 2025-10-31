import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductDetailModalProps {
  product: Product;
  relatedProducts: Product[];
  onSelectVariant: (product: Product) => void;
  selectedSize?: string;
  selectedSizeType?: "metal" | "marble";
  selectedQuantity: number;
  customizationText: string;
  onSizeSelect: (size: string, type: "metal" | "marble") => void;
  onQuantityChange: (quantity: number) => void;
  onCustomizationChange: (text: string) => void;
  onAddToCart: () => void;
  getProductPrice: (
    product: Product,
    size?: string,
    quantity?: number
  ) => number;
}

export const ProductDetailModal = ({
  product,
  relatedProducts,
  onSelectVariant,
  selectedSize,
  selectedSizeType,
  selectedQuantity,
  customizationText,
  onSizeSelect,
  onQuantityChange,
  onCustomizationChange,
  onAddToCart,
  getProductPrice,
}: ProductDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  if (!product) return null;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 py-4">
        {/* Product Image */}
        <div className="lg:col-span-2 lg:order-2 relative flex items-start justify-center">
          {/* Left Arrow */}
          {product.images?.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setCurrentImageIndex((prev) =>
                  prev === 0 ? product.images.length - 1 : prev - 1
                )
              }
              className="absolute left-1 top-[30%] bg-white/70 hover:bg-white text-gray-700 hover:text-black shadow-md rounded-full p-2 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-lg shadow-sm">
            <img
              src={product.images?.[currentImageIndex] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        
          {/* Right Arrow */}
          {product.images?.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setCurrentImageIndex((prev) =>
                  prev === product.images.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-1 top-[30%] bg-white/70 hover:bg-white text-gray-700 hover:text-black shadow-md rounded-full p-2 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Colour Options */}
        <div className="lg:col-span-1 lg:order-1">
          {relatedProducts && relatedProducts.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Available Colours:
              </label>
              <div className="flex flex-row overflow-x-auto gap-3 lg:flex-col lg:overflow-y-auto lg:max-h-[24rem] lg:gap-2 lg:pr-2">
                {relatedProducts.map((variant) => (
                  <div
                    key={variant._id}
                    onClick={() => onSelectVariant(variant)}
                    className={`cursor-pointer rounded-lg border-2 p-1 transition-all ${
                      product._id === variant._id
                        ? "border-primary"
                        : "border-slate-200 hover:border-primary/50"
                    }`}
                  >
                    <div className="w-16 h-16 lg:w-full lg:h-20 overflow-hidden rounded-md">
                      <img
                        src={variant.images[0]}
                        alt={variant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="block lg:block text-xs text-center text-muted-foreground mt-1 truncate">
                      {variant.colour}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Section */}
        <div className="flex flex-col space-y-6 lg:col-span-2 lg:order-3">
          <div>
            <Badge variant="secondary" className="mb-2 rounded-[2px]">
              {product.category}
            </Badge>
            <p className="text-xs mb-2">
              IC : <span className="text-secondary">{product.itemCode}</span>
            </p>

            <p className="text-muted-foreground whitespace-normal break-words">
              {product.description}
            </p>
          </div>

          {/* Size, Quantity & Customization */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.metal_sizes && product.metal_sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Metal Size:
                  </label>
                  <Select
                    value={selectedSizeType === "metal" ? selectedSize : ""}
                    onValueChange={(size) => onSizeSelect(size, "metal")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose metal size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.metal_sizes.map((sizeOption) => (
                        <SelectItem
                          key={sizeOption.size}
                          value={sizeOption.size}
                        >
                          {sizeOption.size} - ₹{sizeOption.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {product.marble_sizes && product.marble_sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Marble Size:
                  </label>
                  <Select
                    value={selectedSizeType === "marble" ? selectedSize : ""}
                    onValueChange={(size) => onSizeSelect(size, "marble")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose marble size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.marble_sizes.map((sizeOption) => (
                        <SelectItem
                          key={sizeOption.size}
                          value={sizeOption.size}
                        >
                          {sizeOption.size} - ₹{sizeOption.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Quantity:
              </label>
              <Select
                value={String(selectedQuantity)}
                onValueChange={(qty) => onQuantityChange(parseInt(qty))}
              >
                <SelectTrigger className="w-24">
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

            {/* Customization */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Customization (optional):
              </label>
              <textarea
                placeholder="Any special requests?"
                value={customizationText}
                onChange={(e) => onCustomizationChange(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
                rows={2}
              />
            </div>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-3xl font-bold text-primary">
              ₹{getProductPrice(product, selectedSize, selectedQuantity)}
            </span>
            <Button
              onClick={onAddToCart}
              size="lg"
              className="bg-primary hover:bg-primary/90"
              disabled={product.stock_status !== "IN_STOCK"}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};
