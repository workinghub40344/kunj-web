// client/src/components/layout/AddProductForm.tsx

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SizeOption {
  size: string;
  price: number;
}

interface ProductType {
  name: string;
  description: string;
  category: string;
  sizes: SizeOption[];
  images: string[];
}

interface AddProductFormProps {
  onClose: () => void;
  onProductAdded: (newProduct: ProductType & { _id: string }) => void;
}

const AddProductForm = ({ onClose, onProductAdded }: AddProductFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("sizes", JSON.stringify(sizes));
      images.forEach((img) => formData.append("images", img));

      const res = await axios.post("http://localhost:5000/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({ title: "Product added successfully!" });

      // Notify parent (AdminPanel) about new product
      onProductAdded(res.data);

      // Reset form
      setName("");
      setDescription("");
      setCategory("");
      setSizes([{ size: "", price: 0 }]);
      setImages([]);

      // Close modal
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Error adding product", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-lg shadow-md" style={{ backgroundColor: "hsl(47, 33%, 96%)" }}>
      <h2 className="text-2xl font-bold mb-4 text-[hsl(338,73%,67%)]">Add New Product</h2>
      <form onSubmit={handleAddProduct} className="space-y-4">

        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>

        {/* Sizes & Prices */}
        <div>
          <label className="block mb-1 font-medium">Sizes & Prices</label>
          {sizes.map((size, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <Input
                placeholder="Size"
                value={size.size}
                onChange={(e) => {
                  const updatedSizes = [...sizes];
                  updatedSizes[index].size = e.target.value;
                  setSizes(updatedSizes);
                }}
              />
              <Input
                type="number"
                placeholder="Price"
                value={size.price}
                onChange={(e) => {
                  const updatedSizes = [...sizes];
                  updatedSizes[index].price = Number(e.target.value);
                  setSizes(updatedSizes);
                }}
              />
              {index > 0 && (
                <Button
                  type="button"
                  onClick={() => setSizes(sizes.filter((_, i) => i !== index))}
                  className="bg-red-500 text-white"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() => setSizes([...sizes, { size: "", price: 0 }])}
            className="bg-[hsl(133,35%,46%)] text-white"
          >
            Add Size
          </Button>
        </div>

        {/* Images */}
        <div>
          <label className="block mb-1 font-medium">Images</label>
          <input
            type="file"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={uploading}
          className="bg-[hsl(338,73%,67%)] text-white w-full"
        >
          {uploading ? "Uploading..." : "Add Product"}
        </Button>
      </form>
    </div>
  );
};

export default AddProductForm;

