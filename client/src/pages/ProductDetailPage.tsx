import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface Product {
    name: string;
    deity: string;
    subCategory: string;
    price: number;
    description: string;
    images: string[];
}

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/accessories/${id}`);
                setProduct(data);
            } catch (error) {
                console.error("Failed to fetch product details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, API_URL]);

    if (loading) return <p>Loading...</p>;
    if (!product) return <p>Product not found.</p>;

    return (
        <div className="container mx-auto py-8 grid grid-cols-2 gap-8">
            <div>
                <img src={product.images[0]} alt={product.name} className="w-full rounded-lg"/>
            </div>
            <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="text-muted-foreground mt-2">{product.deity} - {product.subCategory}</p>
                <p className="text-2xl font-bold my-4">₹{product.price}</p>
                <p className="my-4">{product.description}</p>
                
                {/* Yahan Quantity aur Add to Cart button add honge */}
                <Button>Add to Cart</Button>
            </div>
        </div>
    );
};

export default ProductDetailPage;