import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface Accessory {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

const AccessoriesPage = () => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const { data } = await axios.get<Accessory[]>(`${API_URL}/api/accessories`);
        setAccessories(data);
      } catch (error) {
        console.error("Failed to fetch accessories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccessories();
  }, [API_URL]);

  if (loading) return <p>Loading accessories...</p>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Accessories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {accessories.map((acc) => (
          <Link to={`/accessory/${acc._id}`} key={acc._id}>
            <Card className="h-full">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img src={acc.images[0]} alt={acc.name} className="w-full h-full object-cover"/>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">{acc.name}</h3>
                <p className="font-bold">₹{acc.price}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AccessoriesPage;