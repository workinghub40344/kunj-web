"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddAccessoryForm from "./AddAccessoryForm";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Pencil, Trash2 } from "lucide-react";


interface SingleProduct {
  size: string;
  price: number;
}

interface Accessory {
  _id: string;
  name: string;
  price: number;
  colour?: string;
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

  // ✅ Fetch All Accessories
  const fetchAccessories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/accessories`);
      setAccessories(res.data);
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
      toast({ title: "Deleted!", description: "Accessory deleted successfully." });
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Accessories Management</h1>

        {/* Add Accessory Button (Modal Trigger) */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)}>Add Accessory</Button>
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
              <th className="text-left py-3 px-4 border-b">Other Products</th>
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
              accessories.map((item) => (
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
                    <td className=" rounded-sm bg-secondary/80 border-b px-5 ml-5">{item.style_code}</td>
                  </div>
                  <td className="py-3 px-4 border-b">₹{item.price}</td>
                  <td className="py-3 px-4 border-b text-black">{item.countInStock}</td>
                  <td className="py-3 px-4 border-b text-black">
                    {item.single_product && item.single_product.length > 0 ? (
                      item.single_product.map((sp, index) => (
                        <div key={index} className="flex flex-col">
                          <span>{sp.size} - ₹{sp.price}</span>
                        </div>
                      ))
                    ) : (
                      <span>No Single Products</span>
                    )}
                  </td>
                  {/* Action Button */}
                  <td className="py-3 px-4 border-b">
                    <div className="flex gap-2">
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
    </div>
  );
};

export default Accessories;
