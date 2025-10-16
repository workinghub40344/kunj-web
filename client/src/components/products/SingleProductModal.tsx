import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Accessory } from "../../components/admin/AddAccessoryForm";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface SingleProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Accessory;
}

const SingleProductDialog: React.FC<SingleProductDialogProps> = ({
  open,
  onOpenChange,
  product,
}) => {
  const [selectedSingle, setSelectedSingle] = useState(
    product.single_product?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!selectedSingle) return;
    addToCart({
      productId: product._id,
      productName: product.name,
      size: selectedSingle.size,
      sizeType: "Product",
      quantity,
      price: selectedSingle.price,
      image: product.images[0],
    });
    toast({
      title: "Added to Cart!",
      description: `${quantity} x ${product.name} (${selectedSingle.size}) added.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h2 className="text-lg font-bold">{product.name} - Select Product</h2>
        </DialogHeader>

        <div className="space-y-4 p-4">
          {/* Select single product */}
          <div>
            <label className="block mb-1 font-medium">Choose Product</label>

            {product.single_product && product.single_product.length > 0 ? (
              <Select
                value={selectedSingle?.size || ""}
                onValueChange={(val) => {
                  const sp = product.single_product?.find(
                    (p) => p.size === val
                  );
                  setSelectedSingle(sp || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {product.single_product.map((sp) => (
                    <SelectItem key={sp.size} value={sp.size}>
                      {sp.size} - ₹{sp.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground italic border border-dashed border-gray-400 rounded-md p-2">
                Not Available
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="font-semibold">Quantity:</span>
            <Button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              -
            </Button>
            <span>{quantity}</span>
            <Button onClick={() => setQuantity((q) => q + 1)}>+</Button>
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SingleProductDialog;
