import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accessory } from "@/components/admin/Accessories";

interface Accessory1 extends Accessory {
  set_type?: string;
}

interface AccessoryDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessory: Accessory1 | null;
}

const AccessoryDetailsModal = ({ open, onOpenChange, accessory }: AccessoryDetailsModalProps) => {
  if (!accessory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">{accessory.name}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center items-center mt-1 gap-5 ">
          {/* Image */}
          <div className="w-[45%]">
            <img
              src={accessory.images?.[0] || "/placeholder.jpg"}
              alt={accessory.name}
              className="rounded-lg w-full h-72 object-contain "
            />
          </div>

          {/* Info */}
          <div className="space-y-2 w-[50%]">
            <p className="mb-2 text-red-600"><strong className="text-black">Style Code:</strong> {accessory.style_code}</p>
            <p className="mb-5 text-red-600"><strong className="text-black">Price:</strong> ₹{accessory.price}</p>
            <p className="mb-5 text-red-600"><strong className="text-black">Stock:</strong> {accessory.countInStock}</p>
            {accessory.set_type && <p className="mb-5 text-red-600"><strong className="text-black">Set Type:</strong> {accessory.set_type}</p>}
            {accessory.description && <p className="text-gray-600"><strong className="text-black">Description:</strong> {accessory.description}</p>}
          </div>
        </div>

        {/* Single Product Sizes */}
        {accessory.single_product && accessory.single_product.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2 border-b border-primary inline-block">Available Products</h3>
            <div className="grid grid-cols-2 gap-3">
              {accessory.single_product.map((sp, idx) => (
                <div
                  key={idx}
                  className="border p-2 rounded-md flex justify-between items-center bg-gray-50"
                >
                  <span>{sp.size}</span>
                  <span className="font-medium">₹{sp.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccessoryDetailsModal;
