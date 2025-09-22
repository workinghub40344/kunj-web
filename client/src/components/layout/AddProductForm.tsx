// client/src/components/layout/AddProductForm.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";


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

// MODIFIED: Added productToEdit and onProductUpdated props
interface AddProductFormProps {
  onClose: () => void;
  onProductAdded: (newProduct: ProductType & { _id: string }) => void;
  onProductUpdated: (updatedProduct: ProductType & { _id: string }) => void;
  productToEdit: (ProductType & { _id: string }) | null;
}


const AddProductForm = ({ onClose, onProductAdded, productToEdit, onProductUpdated }: AddProductFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const API_URL = import.meta.env.VITE_API_URL;
  
  // NEW State for managing images
  const [newImages, setNewImages] = useState<File[]>([]); // For new file uploads
  const [existingImages, setExistingImages] = useState<string[]>([]); // For URLs from DB
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]); // URLs to be deleted

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!productToEdit;

  // NEW: useEffect to pre-fill the form in edit mode
  useEffect(() => {
    if (isEditMode) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setSizes(productToEdit.sizes);
      setExistingImages(productToEdit.images);
    }
  }, [productToEdit, isEditMode]);


  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter(img => img !== imageUrl));
    setImagesToRemove([...imagesToRemove, imageUrl]);
  }

  // MODIFIED: Renamed to handleSubmit and handles both add and edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("sizes", JSON.stringify(sizes));
    
    // Append new images if any
    newImages.forEach((img) => formData.append("images", img));

    try {
      if (isEditMode) {
        // --- EDIT LOGIC ---
        formData.append("imagesToRemove", JSON.stringify(imagesToRemove)); // Send images to remove
        const res = await axios.put(`${API_URL}/api/products/${productToEdit._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Product updated successfully!" });
        onProductUpdated(res.data.product); // Use the updated callback
      } else {
        // --- ADD LOGIC ---
        const res = await axios.post(`${API_URL}/api/products`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Product added successfully!" });
        onProductAdded(res.data); // Use the original callback
      }
      
      onClose(); // Close modal on success
    } catch (err) {
      console.error(err);
      toast({ title: `Error ${isEditMode ? 'updating' : 'adding'} product`, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    // The form structure remains the same, but values and handlers are now dynamic
    <div className="max-w-3xl mx-auto rounded-lg" style={{ backgroundColor: "hsl(47, 33%, 96%)" }}>
      {/* The h2 title is now in the parent Admin.tsx modal */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>

        {/* Sizes & Prices */}
        <div>
          <label className="block mb-1 font-medium">Sizes & Prices</label>
          {/* ... (Size and Price logic remains exactly the same) ... */}
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

            {/* NEW: Display existing images with remove button */}
            {isEditMode && existingImages.length > 0 && (
                <div className="flex flex-wrap gap-2 border p-2 rounded-md mb-2">
                    {existingImages.map(url => (
                        <div key={url} className="relative">
                            <img src={url} alt="existing product" className="w-20 h-20 object-cover rounded" />
                            <button 
                                type="button"
                                onClick={() => handleRemoveExistingImage(url)} 
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-0.5"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <label className="block mb-1 font-medium text-sm text-gray-600">
                {isEditMode ? "Upload New Images" : "Upload Images"}
            </label>
            <input
                type="file"
                multiple
                onChange={(e) => setNewImages(Array.from(e.target.files || []))}
            />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={uploading}
          className="bg-[hsl(338,73%,67%)] text-white w-full"
        >
          {uploading ? "Saving..." : isEditMode ? "Update Product" : "Add Product"}
        </Button>
      </form>
    </div>
  );
};

export default AddProductForm;