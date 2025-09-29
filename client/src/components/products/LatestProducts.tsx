import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

// Product data ke liye TypeScript interface
interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
}

const LatestProducts = () => {
  // 1. State Management: Products, loading, aur error ke liye
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = import.meta.env.VITE_API_URL;

  // 2. Data Fetching Logic: Component ke load hote hi data fetch karega
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/products`);
        
        // Sirf latest 4 products ko lene ke liye .slice(0, 4) ka istemal
        setProducts(data.slice(0, 4));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Could not load latest products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, [API_URL]);

  // 3. Conditional Rendering: Loading ya error state ko handle karne ke liye
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
          {products.map((product) => (
            <Card key={product._id} className="product-card group cursor-pointer">
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
    </section>
  );
};

export default LatestProducts;