import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getOptimizedImage } from "@/lib/cloudinary";

interface Accessory {
  _id: string;
  name: string;
  category: string;
  price: number;
  createdAt?: string; 
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
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;
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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Handle Filtering
  useEffect(() => {
    let temp = [...accessories];
    setCurrentPage(1);
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
        {currentItems.map((acc) => (
          <Link to={`/accessories/${acc._id}`} key={acc._id}>
            <Card className="h-full">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={getOptimizedImage(acc.images?.[0], 1000)}
                  loading="lazy"
                  alt={acc.name}
                  className="w-full h-full object-cover rounded-lg"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {/* Prev Button */}
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </Button>
      
          {/* Dynamic Page Numbers */}
          {(() => {
            const pagesToShow: (number | string)[] = [];
            const maxButtons = 5; 
          
            // Always show first page
            if (currentPage > 3) pagesToShow.push(1);
          
            // Left dots
            if (currentPage > 4) pagesToShow.push("...");
          
            // Main middle range
            for (
              let i = Math.max(1, currentPage - 1);
              i <= Math.min(totalPages, currentPage + 1);
              i++
            ) {
              pagesToShow.push(i);
            }
          
            // Right dots
            if (currentPage < totalPages - 3) pagesToShow.push("...");
          
            // Always show last page
            if (currentPage < totalPages - 2) pagesToShow.push(totalPages);
          
            return pagesToShow.map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-2">
                  ...
                </span>
              ) : (
                <Button
                  key={index}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page as number)}
                >
                  {page}
                </Button>
              )
            );
          })()}

          {/* Next Button */}
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}


    </div>
  );
};

export default AccessoriesPage;
