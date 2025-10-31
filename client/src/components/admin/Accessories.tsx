"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddAccessoryForm from "./AddAccessoryForm";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Pencil, Trash2 } from "lucide-react";
import AccessoryDetailsModal from "@/components/admin/AccessoryDetailsModal";


interface SingleProduct {
  size: string;
  price: number;
}

export interface Accessory {
  _id: string;
  name: string;
  category: string;
  price: number;
  colour: string[];
  description?: string;
  style_code?: string;
  deity?: string;
  images?: string[];
  countInStock: number;
  Size: string;
  single_product: SingleProduct[];
}

const Accessories = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { toast } = useToast();
  const { user: adminUser } = useAuth();

  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [styleCode, setStyleCode] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [styleCodes, setStyleCodes] = useState<string[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);


  // ✅ Fetch All Accessories
  const fetchAccessories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/accessories`);
      const data = res.data;
      setAccessories(data);
      // ✅ Extract unique categories & style codes dynamically
      const uniqueCategories = Array.from(
        new Set(data.map((item: Accessory) => item.category).filter(Boolean))
      ) as string[];

      const uniqueStyleCodes = Array.from(
        new Set(data.map((item: Accessory) => item.style_code).filter(Boolean))
      ) as string[];

      setCategories(uniqueCategories);
      setStyleCodes(uniqueStyleCodes);
    } catch (err) {
      toast({
        title: "Error loading accessories",
        description: "Could not fetch accessories.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [API_URL, toast]);

  useEffect(() => {
    fetchAccessories();
  }, [fetchAccessories]);

  // ✅ Delete Accessory
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this accessory?")) return;
    try {
      await axios.delete(`${API_URL}/api/accessories/${id}`, {
        headers: { Authorization: `Bearer ${adminUser?.token}` },
      });
      toast({
        title: "Deleted!",
        description: "Accessory deleted successfully.",
      });
      fetchAccessories();
    } catch (err) {
      toast({
        title: "Error deleting",
        description: "Failed to delete accessory.",
        variant: "destructive",
      });
    }
  };

  // ✅ Open edit modal
  const handleEdit = (accessory: Accessory) => {
    setSelectedAccessory(accessory);
    setIsEditModalOpen(true);
  };

  // Filter Function
  const filteredAccessories = accessories.filter((item) => {
    const matchesName = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStyleCode = styleCode ? item.style_code === styleCode : true;
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    return matchesName && matchesStyleCode && matchesCategory;
  });

  return (
    <div className="p-6">
      {/* Header with Add Accessory Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Accessories Management</h1>

        {/* Add Accessory Button (Modal Trigger) */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Accessory
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Accessory</DialogTitle>
            </DialogHeader>
            <AddAccessoryForm
              onFormSubmit={() => {
                setIsAddModalOpen(false);
                fetchAccessories();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-50 p-4 mb-6 rounded-lg shadow-sm flex flex-wrap gap-4 items-end">
        {/* Search by Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Search by Name
          </label>
          <input
            type="text"
            placeholder="Enter name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-52"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-52 bg-white"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Style Code Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Style Code
          </label>
          <select
            value={styleCode}
            onChange={(e) => setStyleCode(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-52 bg-white"
          >
            <option value="">All</option>
            {styleCodes
              .sort((a, b) => a.localeCompare(b))
              .map((code) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
          </select>
        </div>

        {/* ✅ Reset Button */}
        <Button
          variant="secondary"
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("");
            setStyleCode("");
            fetchAccessories();
          }}
        >
          Reset Filters
        </Button>
      </div>

      {/* Accessories List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-3 px-4 border-b">Image</th>
              <th className="text-left py-3 px-4 border-b">Name</th>
              <th className="text-left py-3 px-4 border-b">Style Code</th>
              <th className="text-left py-3 px-4 border-b">Price</th>
              <th className="text-left py-3 px-4 border-b">Stock</th>
              <th className="text-left py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  Loading accessories...
                </td>
              </tr>
            ) : accessories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No accessories found.
                </td>
              </tr>
            ) : (
              filteredAccessories.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 border-b">
                    <img
                      src={item.images?.[0] || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded"
                    />
                  </td>
                  <td className="py-3 px-4 border-b">{item.name}</td>
                  <div className="flex justify-start items-center pt-6">
                    <td className=" rounded-sm bg-secondary/80 border-b px-5 ml-5">
                      {item.style_code}
                    </td>
                  </div>
                  <td className="py-3 px-4 border-b">₹{item.price}</td>
                  <td className="py-3 px-4 border-b text-black">
                    {item.countInStock}
                  </td>

                  {/* Action Button */}
                  <td className="py-3 px-4 border-b">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAccessory(item);
                          setIsDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Edit"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        title="Delete"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Edit Accessory Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Accessory</DialogTitle>
          </DialogHeader>
          {selectedAccessory && (
            <AddAccessoryForm
              onFormSubmit={() => {
                setIsEditModalOpen(false);
                fetchAccessories();
              }}
              existingData={selectedAccessory}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Accessory Details Modal */}
      <AccessoryDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        accessory={selectedAccessory}
      />
    </div>
  );
};

export default Accessories;
