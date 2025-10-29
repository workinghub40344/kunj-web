import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Accessory } from "../admin/AddAccessoryForm";


interface SetSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Accessory;
  quantity: number;
}


const SetSelectionModal: React.FC<SetSelectionModalProps> = ({
  open,
  onOpenChange,
  product,
  quantity,
}) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSet, setSelectedSet] = useState<"Radha Ji" | "Krishna Ji" | "Both" | null>(null);

  const handleAddToCart = () => {
    if (!selectedSet) {
      toast({
        title: "Please Select a Set",
        description: "Choose between Radha Ji, Krishna Ji, or Both.",
        variant: "destructive",
      });
      return;
    }

    let finalPrice = product.price;
    let setName = "Set for Radha Ji";

    if (selectedSet === "Krishna Ji") {
      finalPrice = product.priceForKrishna;
      setName = "Set for Krishna Ji";
    } else if (selectedSet === "Both") {
      finalPrice = product.price + product.priceForKrishna;
      setName = "Set for Both";
    }

    addToCart({
      productId: `${product._id}-${selectedSet}`,
      productName: `${product.name} (${setName})`,
      size: product.category,
      itemCode: product.itemCode,
      sizeType: "Accessory",
      quantity,
      price: finalPrice,
      image: product.images[0],
    });

    toast({
      title: "Added to Cart!",
      description: `${quantity} x ${product.name} (${setName}) added successfully.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Select Set Option
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant={selectedSet === "Radha Ji" ? "default" : "outline"}
            onClick={() => setSelectedSet("Radha Ji")}
          >
            Set for Radha Ji — ₹{product.price}
          </Button>

          <Button
            variant={selectedSet === "Krishna Ji" ? "default" : "outline"}
            onClick={() => setSelectedSet("Krishna Ji")}
          >
            Set for Krishna Ji — ₹{product.priceForKrishna}
          </Button>

          <Button
            variant={selectedSet === "Both" ? "default" : "outline"}
            onClick={() => setSelectedSet("Both")}
          >
            Set for Both — ₹{product.price + product.priceForKrishna}
          </Button>
        </div>

        <DialogFooter className="mt-6">
          <Button className="w-full" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetSelectionModal;
