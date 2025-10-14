import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Accessory {
  _id: string;
  name: string;
  category: string;
  price: number;
  createdAt?: string; // For Date filter
  images: string[];
}

const AccessoriesPage = () => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [filtered, setFiltered] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<"low" | "high" | null>(null);
  const [selectedDate, setSelectedDate] = useState<"newest" | "oldest" | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const { data } = await axios.get<Accessory[]>(
          `${API_URL}/api/accessories`
        );
        setAccessories(data);
        setFiltered(data);
      } catch (error) {
        console.error("Failed to fetch accessories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccessories();
  }, [API_URL]);

  // Handle Filtering
  useEffect(() => {
    let temp = [...accessories];

    // Search Filter
    if (searchTerm.trim() !== "") {
      temp = temp.filter(
        (acc) =>
          acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          acc.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    // Filter by Category
    if (selectedCategory) {
      temp = temp.filter((acc) => acc.category === selectedCategory);
    }

    // Sort by Price
    if (selectedPrice) {
      temp.sort((a, b) =>
        selectedPrice === "low" ? a.price - b.price : b.price - a.price
      );
    }

    // Sort by Date
    if (selectedDate) {
      temp.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return selectedDate === "newest"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }

    setFiltered(temp);
  }, [searchTerm, selectedCategory, selectedPrice, selectedDate, accessories]);

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedPrice(null);
    setSelectedDate(null);
    setSearchTerm("");
  };

  if (loading)
    return <p className="text-center py-16">Loading accessories...</p>;

  // Get unique categories
  const categories = Array.from(
    new Set(accessories.map((acc) => acc.category))
  );

  return (
    <div className="container mx-auto py-8 px-3">
      <h1 className="text-3xl font-bold mb-6">Accessories</h1>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 p-1 border border-primary rounded-sm bg-white shadow-sm">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[150px] border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {/* Category */}
        <div className="flex-1 min-w-[150px]">
          <Select
            onValueChange={(val) => setSelectedCategory(val)}
            value={selectedCategory || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="flex-1 min-w-[150px]">
          <Select
            onValueChange={(val) => setSelectedPrice(val as "low" | "high")}
            value={selectedPrice || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low to High</SelectItem>
              <SelectItem value="high">High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="flex-1 min-w-[150px]">
          <Select
            onValueChange={(val) => setSelectedDate(val as "newest" | "oldest")}
            value={selectedDate || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset */}
        <div className="flex-1 sm:flex-none min-w-[100px]">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-full"
            onClick={resetFilters}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Accessories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((acc) => (
          <Link to={`/accessories/${acc._id}`} key={acc._id}>
            <Card className="h-full">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={acc.images[0]}
                  alt={acc.name}
                  className="w-full h-full object-cover"
                />
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
