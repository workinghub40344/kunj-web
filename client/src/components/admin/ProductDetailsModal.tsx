"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/data/products"; //interface for products
import { getOptimizedImage } from "@/lib/cloudinary";

interface ProductSize {
  size: string;
  price: number;
}

interface ProductDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  open,
  onOpenChange,
  product,
}) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="flex gap-5 overflow-x-auto justify-start items-center">
            {product.images && product.images.length > 0 && (
              <img
                src={getOptimizedImage(product.images[0], 400)}
                loading="lazy"
                alt={product.name}
                className="w-72 h-72 object-cover rounded-lg"
              />
            )}
            {/* Basic Details */}
            <div className="">
              <p className="text-black mb-5">
                <strong className="text-secondary">Status:</strong>{" "}
                {product.stock_status}
              </p>
              <div className="">
                <p className="text-black mb-5">
                  <strong className="text-secondary">Category:</strong>{" "}
                  {product.category}
                </p>
                
              </div>
              <p className="text-black mb-5">
                <strong className="text-secondary">Description:</strong>{" "}
                {product.description || "No description"}
              </p>
              <p className="text-xs">IC : <span className="text-secondary">{product.itemCode}</span></p>
            </div>
          </div>
          <hr className="h-1 bg-gray-800 " />
          {/* Sizes (if available) */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">
              Available Sizes & Prices
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Metal Sizes */}
              {product.metal_sizes?.length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all">
                  <h3 className="text-red-600 font-semibold mb-3 flex items-center gap-2 border-b border-red-500/60 pb-1">
                    🧱 Metal Sizes
                  </h3>
                  <div className="space-y-2">
                    {product.metal_sizes.map((s: ProductSize) => (
                      <div
                        key={s.size}
                        className="flex justify-between items-center text-sm border-b border-gray-300/60 py-1"
                      >
                        <span className="font-medium text-gray-700">
                          Size {s.size}
                        </span>
                        <span className="text-gray-900 font-semibold">
                          ₹{s.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Marble Sizes */}
              {product.marble_sizes?.length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all">
                  <h3 className="text-red-600 font-semibold mb-3 flex items-center gap-2 border-b border-red-500/60 pb-1">
                    🪨 Marble Sizes
                  </h3>
                  <div className="space-y-2">
                    {product.marble_sizes.map((s: ProductSize) => (
                      <div
                        key={s.size}
                        className="flex justify-between items-center text-sm border-b border-gray-300/60 py-1"
                      >
                        <span className="font-medium text-gray-700">
                          Size {s.size}
                        </span>
                        <span className="text-gray-900 font-semibold">
                          ₹{s.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
