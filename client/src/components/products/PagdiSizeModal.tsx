import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import type { ProductState } from "@/pages/Products";
import { getOptimizedImage } from "@/lib/cloudinary";
import { useEffect, useState } from "react";

interface PagdiOption { size: string; price: number; type: string; }

interface PagdiModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    productState: ProductState | undefined;
    onConfirm: (product: Product, pagdi?: PagdiOption) => void;
}

export const PagdiModal = ({
    isOpen,
    onClose,
    product,
    productState,
    onConfirm,
}: PagdiModalProps) => {
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!product || !productState) return null;

  const pagdiArray =
    productState.selectedSizeType === "metal"
      ? product.metal_pagdi
      : product.marble_pagdi;
  const matchingPagdi = pagdiArray?.find(
    (p) => p.size === productState.selectedSize
  );

  const pagdiOption: PagdiOption | undefined = matchingPagdi
    ? {
        size: matchingPagdi.size,
        price: matchingPagdi.price,
        type: `${
          productState.selectedSizeType === "metal" ? "Metal" : "Marble"
        } Pagdi`,
      }
    : undefined;





  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add an Optional Pagdi</DialogTitle>
          <DialogDescription>
            Complete your look by adding a matching Pagdi.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          {loading ? (
              <div className="h-40 w-full flex items-center justify-center">Loading...</div>
            ) : (
              <img
                src={getOptimizedImage(product.images?.[0], 400)}
                alt={product.name}
                className="w-40 h-40 object-cover mx-auto rounded-lg mb-4 shadow-lg"
              />
            )}
          <p>
            You've selected: <strong>{product.name}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Size: {productState.selectedSize} ({productState.selectedSizeType})
          </p>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => onConfirm(product)}>
            Skip Pagdi
          </Button>
          <Button
            onClick={() => onConfirm(product, pagdiOption)}
            disabled={!matchingPagdi}
          >
            {matchingPagdi
              ? `Add Pagdi (+₹${matchingPagdi.price})`
              : "Pagdi Not Available"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
