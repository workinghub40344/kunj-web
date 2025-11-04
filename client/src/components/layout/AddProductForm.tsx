// client/src/components/layout/AddProductForm.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { SizePriceModal } from "@/components/layout/SizePriceModal";
import type { Product, SizeOption } from "@/data/products";


interface AddProductFormProps {
  onClose: () => void;
  onProductAdded: (newProduct: Product & { _id: string }) => void;
  onProductUpdated: (updatedProduct: Product & { _id: string }) => void;
  productToEdit: (Product & { _id: string }) | null;
}

const AddProductForm = ({
  onClose,
  onProductAdded,
  productToEdit,
  onProductUpdated,
}: AddProductFormProps) => {

  const [name, setName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [colour, setColour] = useState("");
  const [marble_sizes, setMarbleSizes] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const [metal_sizes, setMetalSizes] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const [marble_pagdi, setMarblePagdi] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const [metal_pagdi, setMetalPagdi] = useState<SizeOption[]>([{ size: "", price: 0 }]);
  const [styleCode, setStyleCode] = useState("");
  const [modalType, setModalType] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
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
      setItemCode(productToEdit.itemCode);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setColour(productToEdit.colour || "");
      setMetalPagdi(
        productToEdit.metal_pagdi.length > 0
          ? productToEdit.metal_pagdi
          : [{ size: "", price: 0 }]
      );
      setMarblePagdi(
        productToEdit.marble_pagdi.length > 0
          ? productToEdit.marble_pagdi
          : [{ size: "", price: 0 }]
      )
      setMetalSizes(
        productToEdit.metal_sizes.length > 0
          ? productToEdit.metal_sizes
          : [{ size: "", price: 0 }]
      );
      setMarbleSizes(
        productToEdit.marble_sizes.length > 0
          ? productToEdit.marble_sizes
          : [{ size: "", price: 0 }]
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
    formData.append("itemCode", itemCode);
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

        {/* Item Code */}
        <div>
          <label className="block mb-1 font-medium">
            Item Code
          </label>
          <Input
            className="border border-gray-400 focus:border-none"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            placeholder="e.g., RJL112"
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

        {/* Metal Sizes Button */}
          <div className="p-3 border rounded-md">
            <label className="block mb-2 font-medium text-red-600">Metal Sizes & Prices</label>
            <Button type="button" variant="outline" onClick={() => setModalType('metal_sizes')} className="bg-primary">
              Manage Metal Sizes ({metal_sizes.length} added)
            </Button>
          </div>
          
          {/* Metal Pagdi Button */}
          <div className="p-3 border rounded-md">
            <label className="block mb-2 font-medium text-red-600">Metal Pagdi Sizes & Prices</label>
            <Button type="button" variant="outline" onClick={() => setModalType('metal_pagdi')} className="bg-primary">
              Manage Metal Pagdi Sizes ({metal_pagdi.length} added)
            </Button>
          </div>

          {/* Marble Sizes Button */}
          <div className="p-3 border rounded-md">
            <label className="block mb-2 font-medium text-green-600">Marble Sizes & Prices</label>
            <Button type="button" variant="outline" onClick={() => setModalType('marble_sizes')} className="bg-secondary">
              Manage Marble Sizes ({marble_sizes.length} added)
            </Button>
          </div>
          
          {/* Marble Pagdi Button */}
          <div className="p-3 border rounded-md">
            <label className="block mb-2 font-medium text-green-600">Marble Pagdi Sizes & Prices</label>
            <Button type="button" variant="outline" onClick={() => setModalType('marble_pagdi')} className="bg-secondary">
              Manage Marble Pagdi Sizes ({marble_pagdi.length} added)
            </Button>
          </div>
        

        {/* Images */}
        <div>
          <label className="block mb-1 font-medium">Images</label>

          {/* Existing images (only in edit mode) */}
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
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setNewImages(files);
            
              // ✅ Create preview URLs
              const previewUrls = files.map((file) => URL.createObjectURL(file));
              setPreviewImages(previewUrls);
            }}
          />

          {/* ✅ Preview newly selected images */}
          {newImages.length > 0 && (
            <div className="flex flex-wrap gap-2 border p-2 rounded-md mt-2">
              {previewImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                  {/* ❌ Remove button for new selected images */}
                  <button
                    type="button"
                    onClick={() => {
                      const updatedImages = newImages.filter((_, i) => i !== index);
                      const updatedPreviews = previewImages.filter((_, i) => i !== index);
                      setNewImages(updatedImages);
                      setPreviewImages(updatedPreviews);
                    }}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-[7px] hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

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
    
    {/* ===== MODALS ===== */}
    <div className="">
      <SizePriceModal
          title="Manage Metal Sizes"
          isOpen={modalType === 'metal_sizes'}
          onClose={() => setModalType(null)}
          currentSizes={metal_sizes}
          onSave={(newSizes) => setMetalSizes(newSizes)}
        />
        <SizePriceModal
          title="Manage Marble Sizes"
          isOpen={modalType === 'marble_sizes'}
          onClose={() => setModalType(null)}
          currentSizes={marble_sizes}
          onSave={(newSizes) => setMarbleSizes(newSizes)}
        />
        <SizePriceModal
          title="Manage Metal Pagdi Sizes"
          isOpen={modalType === 'metal_pagdi'}
          onClose={() => setModalType(null)}
          currentSizes={metal_pagdi}
          onSave={(newSizes) => setMetalPagdi(newSizes)}
        />
        <SizePriceModal
          title="Manage Marble Pagdi Sizes"
          isOpen={modalType === 'marble_pagdi'}
          onClose={() => setModalType(null)}
          currentSizes={marble_pagdi}
          onSave={(newSizes) => setMarblePagdi(newSizes)}
        />
    </div>
    
    </div>
  );
};

export default AddProductForm;