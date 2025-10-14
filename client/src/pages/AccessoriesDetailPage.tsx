import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus } from "lucide-react";

// Accessory interface
interface Accessory { _id: string; name: string; deity: string; price: number; description: string; images: string[]; style_code: string; colour: string; category: string; subCategory: string; }

const AccessoriesDetailPage = () => {
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
            p => p.style_code === product.style_code && p._id !== product._id
        );
    }, [product, allVariants]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            productId: product._id,
            productName: product.name,
            size: product.colour, // Accessory ke case mein size ki jagah colour bhej sakte hain
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
        <div className="container mx-auto py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div>
                    <img src={product.images[0]} alt={product.name} className="w-full rounded-lg shadow-lg aspect-square object-cover"/>
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                    <p className="text-base text-muted-foreground">{product.deity}</p>
                    <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
                    <p className="text-2xl font-bold my-4 text-primary">₹{product.price}</p>
                    <p className="my-4 text-muted-foreground">{product.description}</p>

                    {/* Quantity Selector */}
                    <div className="">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-sm font-semibold">Quantity:</h3>
                            <div className="flex items-center border rounded-md">
                                <Button variant="ghost" size="sm" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                                <span className="w-10 text-center font-bold">{quantity}</span>
                                <Button variant="ghost" size="sm" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        {/* Add to Cart Button */}
                        <Button size="lg" className="w-full" onClick={handleAddToCart}>Add to Cart</Button>
                    </div>

                    {/* Available Colours */}
                    {relatedProducts.length > 0 && (
                        <div className="my-4">
                            <h3 className="text-sm font-semibold mb-2">Also Available In:</h3>
                            <div className="flex gap-2 ">
                                {relatedProducts.map(variant => (
                                    <Link to={`/accessories/${variant._id}`} key={variant._id}>
                                        <div className="w-40 h-40 border-2 rounded-md overflow-hidden hover:border-primary">
                                            <img src={variant.images[0]} alt={variant.name} className="w-full h-full object-cover"/>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    
                </div>
            </div>
        </div>
    );
};

export default AccessoriesDetailPage;