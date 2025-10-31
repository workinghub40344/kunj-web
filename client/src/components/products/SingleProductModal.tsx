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
  const [selectedColour, setSelectedColour] = useState<string>("");

  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!selectedSingle) return;

    if (
      Array.isArray(product.colour) &&
      product.colour.length > 0 &&
      !selectedColour
    ) {
      toast({
        title: "Select Colour",
        description: "Please choose a colour before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      itemCode: product.itemCode,
      productId: product._id,
      productName: product.name,
      size: selectedSingle.size,
      sizeType: "Product",
      quantity,
      colour:
        selectedColour ||
        (typeof product.colour === "string"
          ? product.colour
          : ""),
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
                  setSelectedColour("");
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

          {/* 🎨 Colour Selection */}
          {selectedSingle &&
            Array.isArray(product.colour) &&
            product.colour.length > 0 && (
              <div>
                <label className="block mb-1 font-medium text-sm">
                  Select Colour:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colour.map((clr, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColour(clr)}
                      className={`px-3 py-1 rounded-md border text-xs transition-all duration-200 ${
                        selectedColour === clr
                          ? "bg-primary text-white border-primary shadow-md scale-105"
                          : "border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {clr}
                    </button>
                  ))}
                </div>
                {selectedColour && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected:{" "}
                    <span className="font-medium text-primary">
                      {selectedColour}
                    </span>
                  </p>
                )}
              </div>
            )}

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
          <Button
            className="w-full" onClick={handleAddToCart}
            disabled={(product.countInStock as unknown as number) <= 0}
          >
            {(product.countInStock as unknown as number) > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SingleProductDialog;
