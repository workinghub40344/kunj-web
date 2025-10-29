import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sizeArr = [
  "1-no", "2-no", "3-no", "4-no", "5-no", "6-no", "7-no", "8-no",
  "9-no", "10-no", "11-no", "12-no", "5-inch", "6-inch", "7-inch",
  "8-inch", "9-inch", "10-inch", "11-inch", "12-inch", "13-inch",
  "14-inch", "15-inch", "16-inch", "18-inch", "20-inch", "22-inch",
  "24-inch", "30-inch", "36-inch",
];

interface SizeOption { size: string; price: number | string; }
interface SizePriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSizes: SizeOption[]) => void;
  currentSizes: SizeOption[];
  title: string;
}

export const SizePriceModal = ({ isOpen, onClose, onSave, currentSizes, title }: SizePriceModalProps) => {
  const [localSizes, setLocalSizes] = useState<Record<string, string | number>>({});

  useEffect(() => {
    if (isOpen) {
      const priceMap: Record<string, string | number> = {};
      currentSizes.forEach(item => {
        priceMap[item.size] = item.price;
      });
      setLocalSizes(priceMap);
    }
  }, [isOpen, currentSizes]);

  const handlePriceChange = (size: string, price: string) => {
    setLocalSizes(prev => ({
      ...prev,
      [size]: price
    }));
  };

  const handleSave = () => {
    const newSizes: SizeOption[] = sizeArr
      .map(size => ({
        size,
        price: localSizes[size] || ""
      }))
      .filter(item => String(item.price).trim() !== "" && Number(item.price) >= 0);

    onSave(newSizes);
    onClose();
  };

  // Separate arrays for clarity
  const noSizes = sizeArr.filter(size => size.endsWith("-no"));
  const inchSizes = sizeArr.filter(size => size.endsWith("-inch"));

  return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-5xl max-h-[96vh] bg-[#f9fafb] rounded-xl shadow-md border border-gray-200">
      <DialogHeader className="border-b pb-2 mb-3">
        <DialogTitle className="text-lg font-semibold text-gray-800">
          {title}
        </DialogTitle>
      </DialogHeader>

      {/* Header Row */}
      <div className="grid grid-cols-2 gap-4 font-medium text-gray-700 bg-[#eef1f4] px-4 py-2 rounded-md mb-3 border border-gray-200">
        <div className="text-center">No Sizes</div>
        <div className="text-center">Inch Sizes</div>
      </div>

      <div className="overflow-y-auto pr-2" style={{ maxHeight: "50vh" }}>
        <div className="grid grid-cols-2 gap-4">
          {/* LEFT SIDE - NO SIZES */}
          <div className="space-y-3">
            {noSizes.map(size => (
              <div
                key={size}
                className="flex items-center justify-between border border-gray-200 rounded-lg p-2.5 bg-[#ffffff] hover:bg-[#f2f4f6] transition-all"
              >
                <Label htmlFor={size} className="font-medium text-gray-700 w-20">
                  {size}
                </Label>
                <Input
                  id={size}
                  type="text"
                  placeholder="Price"
                  value={localSizes[size] || ""}
                  onChange={(e) => handlePriceChange(size, e.target.value)}
                  className="w-28 border-gray-300 bg-[#fafafa] focus-visible:ring-[hsl(338,73%,70%)] focus-visible:border-[hsl(338,73%,70%)]"
                />
              </div>
            ))}
          </div>

          {/* RIGHT SIDE - INCH SIZES */}
          <div className="space-y-3">
            {inchSizes.map(size => (
              <div
                key={size}
                className="flex items-center justify-between border border-gray-200 rounded-lg p-2.5 bg-[#ffffff] hover:bg-[#f2f4f6] transition-all"
              >
                <Label htmlFor={size} className="font-medium text-gray-700 w-20">
                  {size}
                </Label>
                <Input
                  id={size}
                  type="text"
                  placeholder="Price"
                  value={localSizes[size] || ""}
                  onChange={(e) => handlePriceChange(size, e.target.value)}
                  className="w-28 border-gray-300 bg-[#fafafa] focus-visible:ring-[hsl(338,73%,70%)] focus-visible:border-[hsl(338,73%,70%)]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="mt-5 border-t pt-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gray-600 text-gray-100 bg-gray-600 hover:bg-gray-900"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-[hsl(338,73%,70%)] text-white hover:bg-[hsl(338,73%,63%)]"
        >
          Save Prices
        </Button>
      </DialogFooter>

    </DialogContent>
  </Dialog>
);
};
