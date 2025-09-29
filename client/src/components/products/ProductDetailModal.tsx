// src/components/products/ProductDetailModal.tsx

import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductDetailModalProps {
    product: Product;
    selectedSize: string;
    selectedQuantity: number;
    customizationText: string;
    onSizeChange: (size: string) => void;
    onQuantityChange: (quantity: number) => void;
    onCustomizationChange: (text: string) => void;
    onAddToCart: () => void;
    getProductPrice: (product: Product, size?: string, quantity?: number) => number;
}

export const ProductDetailModal = ({
    product,
    selectedSize,
    selectedQuantity,
    customizationText,
    onSizeChange,
    onQuantityChange,
    onCustomizationChange,
    onAddToCart,
    getProductPrice,
}: ProductDetailModalProps) => {

    const availableSizes = product.sizes.sort((a, b) => parseInt(a.size) - parseInt(b.size));
    
    return (
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                <div className="aspect-square overflow-hidden rounded-lg">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col space-y-6">
                    <div>
                        <Badge variant="secondary" className="mb-2 rounded-[2px]">{product.category}</Badge>
                        <p className="text-muted-foreground">{product.description}</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Select Size:</label>
                            <Select value={selectedSize} onValueChange={onSizeChange}>
                                <SelectTrigger><SelectValue placeholder="Choose size" /></SelectTrigger>
                                <SelectContent>
                                    {availableSizes.map((sizeOption) => (
                                        <SelectItem key={sizeOption.size} value={sizeOption.size}>
                                            {sizeOption.size} - ₹{sizeOption.price}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Quantity:</label>
                            <Select value={String(selectedQuantity)} onValueChange={(qty) => onQuantityChange(parseInt(qty))}>
                                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Customization (optional):</label>
                            <textarea
                                placeholder="Any special requests?"
                                value={customizationText}
                                onChange={(e) => onCustomizationChange(e.target.value)}
                                className="w-full border rounded-md p-2 text-sm"
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-3xl font-bold text-primary">
                            ₹{getProductPrice(product, selectedSize, selectedQuantity)}
                        </span>
                        <Button 
                            onClick={onAddToCart} size="lg" 
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