import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus } from "lucide-react";
import { Accessory } from "../components/admin/AddAccessoryForm";
import SingleProductDialog from "../components/products/SingleProductModal";

const AccessoriesDetailPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Accessory | null>(null);
  const [allVariants, setAllVariants] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

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
    addToCart({
      productId: product._id,
      productName: product.name,
      size: product.category,
      sizeType: "Accessory",
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
          <p className="text-sm text-muted-foreground">{product.deity}</p>
          <h1 className="text-xl md:text-2xl font-bold mt-1">{product.name}</h1>
          <p className="text-sm text-secondary">{product.category}</p>
          <p className="text-xl font-semibold my-3 text-primary">₹{product.price}</p>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Stock Status Badge */}
          {/* <div>
                {(product.countInStock as unknown as number) > 0 ? (
                    <p className="text-secondary/90 w-fit">In Stock :- {product.countInStock}</p>
                ) : (
                    <p>Out of Stock</p>
                )}
          </div> */}

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
                  onClick={() => setQuantity((q) => q + 1)}
                  className="hover:bg-primary"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

        {/* 🛒 Choose From Set */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className={`${product.single_product[0] ? ("w-fit px-10 bg-secondary/90 roundes-[5px]") : ( "hidden" ) }`}
            onClick={() => setIsDialogOpen(true)}
          >
            Choose Product from the Set
          </Button>
        </div>
        

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
      {/* Single Product Dialog */}
      {product && (
        <SingleProductDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={product}
        />
      )}
    </div>
  );
};

export default AccessoriesDetailPage;
