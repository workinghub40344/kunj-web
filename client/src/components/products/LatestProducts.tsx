import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { ProductDetailModal } from "@/components/products/ProductDetailModal";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";


type ProductState = {
  selectedSize?: string;
  selectedSizeType?: "metal" | "marble";
  quantity: number;
  customization: string;
};

const LatestProducts = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  // State Management
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productStates, setProductStates] = useState<
    Record<string, ProductState>
  >({});

  const { addToCart } = useCart();
  const { toast } = useToast();

  // Data Fetching Logic
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/products`);
        setAllProducts(data); 
        setError(null);

        const initialStates: Record<string, ProductState> = {};
        data.forEach((product: Product) => {
          let defaultSize: string | undefined = undefined;
          let defaultSizeType: "metal" | "marble" | undefined = undefined;

          if (product.metal_sizes && product.metal_sizes.length > 0) {
            defaultSize = product.metal_sizes[0].size;
            defaultSizeType = "metal";
          } else if (product.marble_sizes && product.marble_sizes.length > 0) {
            defaultSize = product.marble_sizes[0].size;
            defaultSizeType = "marble";
          }
          if (defaultSize) {
            initialStates[product._id] = {
              selectedSize: defaultSize,
              selectedSizeType: defaultSizeType,
              quantity: 1,
              customization: "",
            };
          }
        });
        setProductStates(initialStates);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Could not load latest products.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, [API_URL, toast]);

  // Four latest products
  const latestProducts = allProducts.slice(0, 4);

  const getAllSizes = (product: Product) => [
    ...(product.metal_sizes || []),
    ...(product.marble_sizes || []),
  ];

  const handleSizeSelect = (
    productId: string,
    size: string,
    type: "metal" | "marble"
  ) => {
    setProductStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: prev[productId]?.quantity || 1,
        customization: prev[productId]?.customization || "",
        selectedSize: size,
        selectedSizeType: type,
      },
    }));
  };

  const handleOtherStateChange = (
    productId: string,
    field: "quantity" | "customization",
    value: string | number
  ) => {
    setProductStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity:
          field === "quantity"
            ? (value as number)
            : prev[productId]?.quantity || 1,
        customization:
          field === "customization"
            ? (value as string)
            : prev[productId]?.customization || "",
      },
    }));
  };

  const getProductPrice = (
    product: Product,
    size?: string,
    type?: "metal" | "marble"
  ) => {
    if (!size) return 0;
    if (type === "metal")
      return product.metal_sizes?.find((s) => s.size === size)?.price || 0;
    if (type === "marble")
      return product.marble_sizes?.find((s) => s.size === size)?.price || 0;
    return getAllSizes(product).find((s) => s.size === size)?.price || 0;
  };

  const handleAddToCart = (product: Product) => {
  const state = productStates[product._id];
  const selectedSize = state?.selectedSize;
  const selectedType = state?.selectedSizeType;

  if (!selectedSize || !selectedType) {
    toast({
      variant: "destructive",
      title: "Size Required",
      description: "Please select a size first!",
    });
    return;
  }

  let sizeOption;
  // Agar 'metal' select hai, to sirf metal_sizes mein dhoondho
  if (selectedType === 'metal') {
    sizeOption = product.metal_sizes?.find(s => s.size === selectedSize);
  } 
  // Agar 'marble' select hai, to sirf marble_sizes mein dhoondho
  else {
    sizeOption = product.marble_sizes?.find(s => s.size === selectedSize);
  }
  
  if (!sizeOption) {
    console.error("Could not find the selected size option for the given type.");
    return;
  }

  addToCart({
    productId: product._id,
    productName: product.name,
    size: selectedSize,
    sizeType: selectedType === "metal" ? "Metal" : "Marble",
    quantity: state.quantity || 1,
    price: sizeOption.price, // Ab yahan hamesha sahi price aayegi
    image: product.images[0],
    customization: state.customization || "",
  });

  toast({
    title: "Success!",
    description: `${product.name} has been added to your cart.`,
  });
};

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return allProducts.filter(
      (p) => p.style_code === selectedProduct.style_code
    );
  }, [selectedProduct, allProducts]);

  if (loading) {
    return (
      <section className="py-16 px-4 text-center">
        <p className="text-lg">Loading Latest Collection...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 text-center">
        <p className="text-lg text-destructive">{error}</p>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Latest Collection
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our most cherished Poshak and accessories, handpicked for their
            divine beauty and craftsmanship
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {latestProducts.map((product) => (
            <Card
              key={product._id}
              className="product-card group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/products">
            <Button
              variant="outline"
              size="lg"
              className="px-8 bg-primary text-white hover:bg-primary/90 hover:text-white"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-8">
        <hr />
      </div>
      {/* Modal Props */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedProduct(null);
        }}
      >
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            relatedProducts={relatedProducts}
            onSelectVariant={setSelectedProduct}
            selectedSize={productStates[selectedProduct._id]?.selectedSize}
            selectedSizeType={
              productStates[selectedProduct._id]?.selectedSizeType
            }
            selectedQuantity={productStates[selectedProduct._id]?.quantity || 1}
            customizationText={
              productStates[selectedProduct._id]?.customization || ""
            }
            onSizeSelect={(size, type) =>
              handleSizeSelect(selectedProduct._id, size, type)
            }
            onQuantityChange={(qty) =>
              handleOtherStateChange(selectedProduct._id, "quantity", qty)
            }
            onCustomizationChange={(text) =>
              handleOtherStateChange(selectedProduct._id, "customization", text)
            }
            onAddToCart={() => handleAddToCart(selectedProduct)}

            getProductPrice={(p, s, q) => {
              const state = productStates[p._id];
              const type = state?.selectedSizeType;
              const unitPrice = getProductPrice(p, s, type);
              return unitPrice * (q || 1);
            }}
          />
        )}
      </Dialog>
    </section>
  );
};

export default LatestProducts;
