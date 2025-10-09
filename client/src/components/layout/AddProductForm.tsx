// client/src/components/layout/AddProductForm.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { SizeCombobox } from "@/components/layout/SizeCombobox";

interface SizeOption { size: string; price: number | string; }

interface ProductType {
  name: string;
  description: string;
  category: string;
  colour: string;
  metal_sizes: SizeOption[];
  marble_sizes: SizeOption[];
  metal_pagdi: SizeOption[];
  marble_pagdi: SizeOption[];
  images: string[];
  style_code: string;
}

interface AddProductFormProps {
  onClose: () => void;
  onProductAdded: (newProduct: ProductType & { _id: string }) => void;
  onProductUpdated: (updatedProduct: ProductType & { _id: string }) => void;
  productToEdit: (ProductType & { _id: string }) | null;
}

const AddProductForm = ({
  onClose,
  onProductAdded,
  productToEdit,
  onProductUpdated,
}: AddProductFormProps) => {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [colour, setColour] = useState("");
  const [marble_sizes, setMarbleSizes] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const [metal_sizes, setMetalSizes] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const [marble_pagdi, setMarblePagdi] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const [metal_pagdi, setMetalPagdi] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const [styleCode, setStyleCode] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  // NEW State for managing images
  const [newImages, setNewImages] = useState<File[]>([]); // For new file uploads
  const [existingImages, setExistingImages] = useState<string[]>([]); // For URLs from DB
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]); // URLs to be deleted
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!productToEdit;

  // useEffect to pre-fill the form in edit mode
  useEffect(() => {
    if (isEditMode) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setColour(productToEdit.colour || "");
      setMetalPagdi(
        productToEdit.metal_pagdi.length > 0
          ? productToEdit.metal_pagdi
          : [{ size: "", price: "" }]
      );
      setMarblePagdi(
        productToEdit.marble_pagdi.length > 0
          ? productToEdit.marble_pagdi
          : [{ size: "", price: "" }]
      )
      setMetalSizes(
        productToEdit.metal_sizes.length > 0
          ? productToEdit.metal_sizes
          : [{ size: "", price: "" }]
      );
      setMarbleSizes(
        productToEdit.marble_sizes.length > 0
          ? productToEdit.marble_sizes
          : [{ size: "", price: "" }]
      );
      setExistingImages(productToEdit.images);
      setStyleCode(productToEdit.style_code || "");
    }
  }, [productToEdit, isEditMode]);

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((img) => img !== imageUrl));
    setImagesToRemove([...imagesToRemove, imageUrl]);
  };

  // Renamed to handleSubmit and handles both add and edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    // Clean the sizes array before sending to the backend
    const cleanedMetalPagdi = metal_pagdi
      .filter((s) => s.size)
      .map((s) => ({ ...s, price: Number(s.price) || 0 }));

    const cleanedMarblePagdi = marble_pagdi
      .filter((s) => s.size)
      .map((s) => ({ ...s, price: Number(s.price) || 0 }));

    const cleanedMetalSizes = metal_sizes
      .filter((s) => s.size)
      .map((s) => ({ ...s, price: Number(s.price) || 0 }));

    const cleanedMarbleSizes = marble_sizes
      .filter((s) => s.size)
      .map((s) => ({ ...s, price: Number(s.price) || 0 }));

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("colour", colour);
    formData.append("metal_pagdi", JSON.stringify(cleanedMetalPagdi));
    formData.append("marble_pagdi", JSON.stringify(cleanedMarblePagdi));
    formData.append("metal_sizes", JSON.stringify(cleanedMetalSizes));
    formData.append("marble_sizes", JSON.stringify(cleanedMarbleSizes));
    formData.append("style_code", styleCode);
  
    // Append new images if any
    newImages.forEach((img) => formData.append("images", img));

    try {
      if (isEditMode) {
        // --- EDIT LOGIC ---
        formData.append("imagesToRemove", JSON.stringify(imagesToRemove)); 
        const res = await axios.put(
          `${API_URL}/api/products/${productToEdit._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast({ title: "Product updated successfully!" });
        onProductUpdated(res.data.product); 
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
      toast({
        title: `Error ${isEditMode ? "updating" : "adding"} product`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto rounded-lg"
      style={{ backgroundColor: "hsl(47, 33%, 96%)" }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Style Code */}
        <div>
          <label className="block mb-1 font-medium">
            Style Code (Group ID)
          </label>
          <Input
            className="border border-gray-400 focus:border-none"
            value={styleCode}
            onChange={(e) => setStyleCode(e.target.value)}
            placeholder="e.g., RJL001"
            required
          />
        </div>

        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <Input
            className="border border-gray-400 focus:border-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <Input
            className="border border-gray-400 focus:border-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        {/* Colour */}
        <div>
          <label className="block mb-1 font-medium">Colour</label>
          <Input
            className="border border-gray-400 focus:border-none"
            value={colour}
            onChange={(e) => setColour(e.target.value)}
            placeholder="e.g., Red, Blue, Golden"
            required
          />
        </div>

        {/* Metal Sizes & Prices */}
        <div className="p-3 border rounded-md">
          <label className="block mb-2 font-medium text-red-600">Metal Sizes & Prices</label>
          {metal_sizes.map((size, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <SizeCombobox
                placeholder="Size"
                value={size.size}
                onChange={(newValue) => {
                  const updatedSizes = [...metal_sizes];
                  updatedSizes[index].size = newValue;
                  setMetalSizes(updatedSizes);
                }}
              />
              <Input
                className="border border-gray-400 focus:border-none"
                type="number"
                min="0"
                placeholder="Price"
                value={size.price}
                onChange={(e) => {
                  const updatedSizes = [...metal_sizes];
                  updatedSizes[index].price = e.target.value;
                  setMetalSizes(updatedSizes);
                }}
              />
              {index > 0 && (
                <Button
                  type="button"
                  onClick={() =>
                    setMetalSizes(metal_sizes.filter((_, i) => i !== index))
                  }
                  variant="destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              setMetalSizes([...metal_sizes, { size: "", price: "" }])
            }
          >
            Add Metal Size
          </Button>
        </div>
        {/* Metal Pagdi */}
        <div className="p-3 border rounded-md">
          <label className="block mb-2 font-medium text-red-600">Metal Pagdi Sizes & Prices</label>
          {metal_pagdi.map((size, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <SizeCombobox
                placeholder="Size (e.g., S, M, L)"
                value={size.size}
                onChange={(newValue) => {
                  const updatedSizes = [...metal_pagdi];
                  updatedSizes[index].size = newValue;
                  setMetalPagdi(updatedSizes);
                }}
              />
              <Input
                className="border border-gray-400 focus:border-none"
                type="number"
                min="0"
                placeholder="Price"
                value={size.price}
                onChange={(e) => {
                  const updatedSizes = [...metal_pagdi];
                  updatedSizes[index].price = e.target.value;
                  setMetalPagdi(updatedSizes);
                }}
              />
              {index > 0 && (
                <Button
                  type="button"
                  onClick={() =>
                    setMetalPagdi(metal_pagdi.filter((_, i) => i !== index))
                  }
                  variant="destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              setMetalPagdi([...metal_pagdi, { size: "", price: "" }])
            }
          >
            Add Metal Pagdi Size
          </Button>
        </div>

        {/* Marble Sizes & Prices */}
        <div className="p-3 border rounded-md">
          <label className="block mb-2 font-medium text-green-600">
            Marble Sizes & Prices
          </label>
          {marble_sizes.map((size, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <SizeCombobox
                placeholder="Size (e.g., 8mm, 10mm)"
                value={size.size}
                onChange={(newValue) => {
                  const updatedSizes = [...marble_sizes];
                  updatedSizes[index].size = newValue;
                  setMarbleSizes(updatedSizes);
                }}
              />
              <Input
                className="border border-gray-400 focus:border-none"
                type="number"
                min="0"
                placeholder="Price"
                value={size.price}
                onChange={(e) => {
                  const updatedSizes = [...marble_sizes];
                  updatedSizes[index].price = e.target.value;
                  setMarbleSizes(updatedSizes);
                }}
              />
              {index > 0 && (
                <Button
                  type="button"
                  onClick={() =>
                    setMarbleSizes(marble_sizes.filter((_, i) => i !== index))
                  }
                  variant="destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              setMarbleSizes([...marble_sizes, { size: "", price: "" }])
            }
          >
            Add Marble Size
          </Button>
        </div>
        {/* Marble Pagdi */}
        <div className="p-3 border rounded-md">
          <label className="block mb-2 font-medium text-green-600">Marble Pagdi Sizes & Prices</label>
          {marble_pagdi.map((size, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <SizeCombobox
                placeholder="Size (e.g., S, M, L)"
                value={size.size}
                onChange={(newValue) => {
                  const updatedSizes = [...marble_pagdi];
                  updatedSizes[index].size = newValue;
                  setMarblePagdi(updatedSizes);
                }}
              />
              <Input
                className="border border-gray-400 focus:border-none"
                type="number"
                min="0"
                placeholder="Price"
                value={size.price}
                onChange={(e) => {
                  const updatedSizes = [...marble_pagdi];
                  updatedSizes[index].price = e.target.value;
                  setMarblePagdi(updatedSizes);
                }}
              />
              {index > 0 && (
                <Button
                  type="button"
                  onClick={() =>
                    setMarblePagdi(marble_pagdi.filter((_, i) => i !== index))
                  }
                  variant="destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              setMarblePagdi([...marble_pagdi, { size: "", price: "" }])
            }
          >
            Add Marble Pagdi Size
          </Button>
        </div>

        {/* Images */}
        <div>
          <label className="block mb-1 font-medium">Images</label>
          {/* Display existing images with remove button */}
          {isEditMode && existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 border p-2 rounded-md mb-2">
              {existingImages.map((url) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt="existing product"
                    className="w-20 h-20 object-cover rounded"
                  />
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
            className="border border-gray-400 focus:border-none"
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
          {uploading
            ? "Saving..."
            : isEditMode
            ? "Update Product"
            : "Add Product"}
        </Button>
      </form>
    </div>
  );
};

export default AddProductForm;




const sizeArr = [ "1-no", "2-no", "3-no", "4-no", "5-no", "6-no", "7-no", "8-no", "9-no", "10-no", "11-no", "12-no", "13-no", "14-no", "15-no", "16-no", "17-no", "18-no", "19-no", "20-no", "21-no", "22-no", "23-no", "24-no", "25-no", "26-no", "27-no", "28-no", "29-no", "30-no", "1-inch", "2-inch", "3-inch", "4-inch", "5-inch", "6-inch", "7-inch", "8-inch", "9-inch", "10-inch", "11-inch", "12-inch", "13-inch", "14-inch", "15-inch", "16-inch", "17-inch", "18-inch", "19-inch", "20-inch", "21-inch", "22-inch", "23-inch", "24-inch", "25-inch", "26-inch", "27-inch", "28-inch", "29-inch", "30-inch", ]