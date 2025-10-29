import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus } from "lucide-react";
import { Accessory } from "../components/admin/AddAccessoryForm";
import SingleProductDialog from "../components/products/SingleProductModal";
import SetSelectionModal from "@/components/products/SetSelectionModal";


const AccessoriesDetailPage = () => {
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [isSingleDialogOpen, setIsSingleDialogOpen] = useState(false);

  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Accessory | null>(null);
  const [allVariants, setAllVariants] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState("");

  const { addToCart } = useCart();
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProductAndVariants = async () => {
      try {
        setLoading(true);
        const productRes = await axios.get(`${API_URL}/api/accessories/${id}`);
        const allAccessoriesRes = await axios.get(`${API_URL}/api/accessories`);

        setProduct(productRes.data);
        setAllVariants(allAccessoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProductAndVariants();
    }
  }, [id, API_URL]);

  // Available colours
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allVariants.filter(
      (p) => p.style_code === product.style_code && p._id !== product._id
    );
  }, [product, allVariants]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.productType === "Set") {
      setIsSetModalOpen(true);
      return;
    }

    addToCart({
      itemCode: product.itemCode,
      productId: product._id,
      productName: product.name,
      size: product.category,
      sizeType: "Accessory",
      customization: customization || "",
      quantity: quantity,
      price: product.price,
      image: product.images[0],
    });
    toast({
      title: "Added to Cart!",
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };

  if (loading) return <p className="text-center py-16">Loading...</p>;
  if (!product) return <p className="text-center py-16">Product not found.</p>;

  return (
    <div className="container mx-auto py-8 px-3">
      <div className="flex flex-col md:flex-row justify-evenly items-center gap-8 flex-wrap md:flex-nowrap">
        {/* 🖼️ Product Image */}
        <div className="relative rounded-lg overflow-hidden shadow-md md:w-[30%]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-96 w-full aspect-square object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* 🧾 Product Details */}
        <div className="flex flex-col md:w-[60%]">
          <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{product.deity}</p>
          
          </div>
          <h1 className="text-xl md:text-2xl font-bold mt-1">{product.name}</h1>
          <p className="text-sm text-secondary">{product.category}</p>
          <p className="text-xl font-semibold my-3 text-primary">₹{product.price}</p>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {product.description}
          </p>
          <p className="text-red-500 text-xs mb-3"> IC <span className="text-red-900 text-xs">:</span> <span className="text-black">{product.itemCode}</span></p>

          {/* 🔢 Quantity Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold">Quantity:</h3>
              <div className="flex items-center border border-primary rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="hover:bg-primary"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (product && quantity < (product.countInStock as unknown as number)) {
                      setQuantity((q) => q + 1);
                    } else {
                      toast({
                        title: "Stock Limit Reached",
                        description: `Only ${product.countInStock} item(s) available in stock.`,
                        variant: "destructive",
                      });
                    }
                  }}
                  className="hover:bg-primary"
                >
                  <Plus className="h-4 w-4" />
                </Button>

              </div>
            </div>
        {/* Customization */}
        <textarea
          placeholder="Customization For Sizes/Colours and other details...(Optional)"
          value={customization}
          onChange={(e) => setCustomization(e.target.value)}
          className="w-full border rounded-md p-2 text-xs"
          rows={1}
        />

        {/* 🛒 Choose From Set */}
        {product?.single_product?.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSingleDialogOpen(true)}
            >
              Choose From The Set
            </Button>
          </div>
        )}
        

        {/* 🛒 Add to Cart */}
        <div className="space-y-3">
        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary/80 text-white font-medium rounded-md shadow-sm"
          onClick={handleAddToCart}
          disabled={(product.countInStock as unknown as number) <= 0}
        >
          {(product.countInStock as unknown as number) > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
        </div>
          </div>
          
        </div>
      </div>
      
      <hr className="mt-10 bg-gray-400 h-[2px]" />

      {/* 🎨 Related Variants */}
      <div className="md:px-8 mt-2">
        {relatedProducts.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold mb-2">Also Available In:</h3>
            <div className="flex gap-2 flex-wrap">
              {relatedProducts.map((variant) => (
                <Link to={`/accessories/${variant._id}`} key={variant._id}>
                  <div className="w-40 h-40 border rounded-md overflow-hidden hover:border-primary transition-all">
                    <img
                      src={variant.images[0]}
                      alt={variant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Set Selection Modal (for Add to Cart) */}
      {product && product.productType === "Set" && (
        <SetSelectionModal
          open={isSetModalOpen}
          onOpenChange={setIsSetModalOpen}
          product={product}
          quantity={quantity}
          customization={customization}
        />
      )}

      {/* ✅ Single Product Dialog (for Choose From the Set) */}
      {product && (
        <SingleProductDialog
          open={isSingleDialogOpen}
          onOpenChange={setIsSingleDialogOpen}
          product={product}
        />
      )}


    </div>
  );
};

export default AccessoriesDetailPage;
