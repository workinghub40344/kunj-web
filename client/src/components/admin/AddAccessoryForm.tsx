import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const accessoryNames = [
  "Chokar Har",
  "Long Har 1",
  "Long Har 2",
  "Long Har 3",
  "Long Har 4",
  "Long Har 5",
  "Earrings",
  "Kangan",
  "Bajuband",
  "Mangtika",
  "Kamarband",
  "Shishfool",
  "Rings",
  "Nose Pin",
  "Payal",
  "Mukut",
];

export interface Accessory {
  _id?: string;
  name: string;
  itemCode?: string;
  price: number;
  priceForKrishna?: number;
  colour?: string;
  description?: string;
  category?: string;
  style_code?: string;
  deity?: string;
  images?: string[];
  single_product: { size: string; price: number }[]
  countInStock?: number;
  productType?: string;
}

interface AddAccessoryFormProps {
  onFormSubmit: () => void;
  existingData?: Accessory;
  isEditing?: boolean;
}

const AddAccessoryForm: React.FC<AddAccessoryFormProps> = ({
  onFormSubmit,
  existingData,
  isEditing = false,
}) => {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [colour, setColour] = useState("");
  const [existingColours, setExistingColours] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [priceForKrishna, setPriceForKrishna] = useState("");
  const [styleCode, setStyleCode] = useState("");
  const [deity, setDeity] = useState("Radha Ji");
  const [productType, setProductType] = useState("Single Product");
  const [countInStock, setCountInStock] = useState<string | number>('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [singleProducts, setSingleProducts] = useState<{ size: string; price: string }[]>(
    existingData?.single_product?.map((sp) => ({
      size: sp.size,
      price: sp.price.toString(),
    })) || []
  );

  // Prefill form for editing
  useEffect(() => {
    if (existingData) {
      setName(existingData.name || "");
      setItemCode(existingData.itemCode || "");
      setDescription(existingData.description || "");
      setCategory(existingData.category || "");
      setColour(existingData.colour || "");
      setExistingColours(
        Array.isArray(existingData.colour) ? existingData.colour : existingData.colour ? [existingData.colour] : []
      );
      setPrice(existingData.price?.toString() || "");
      setStyleCode(existingData.style_code || "");
      setDeity(existingData.deity || "Radha and Krishan ji");
      setCountInStock(existingData.countInStock || "");
      setExistingImages(existingData.images || []);
      setPriceForKrishna(existingData.priceForKrishna?.toString() || "");
      setProductType(existingData.productType || "Single Product");
    }
  }, [existingData]);

  const resetForm = () => {
    setName("");
    setItemCode("");
    setDescription("");
    setCategory("");
    setColour("");
    setExistingColours([]);
    setPrice("");
    setStyleCode("");
    setDeity("Radha and Krishan ji");
    setImages([]);
    setExistingImages([]);
    setRemovedImages([]);
    setSingleProducts([]);
    setCountInStock('');
    setPriceForKrishna("");
    setProductType("Single Product");
  };

  // Add new size row
  const addSizeRow = () => {
    setSingleProducts([...singleProducts, { size: "", price: "" }]);
  };

  // Remove size row
  const removeSizeRow = (index: number) => {
    setSingleProducts(singleProducts.filter((_, i) => i !== index));
  };

  // Update a row
  const updateSizeRow = (
    index: number,
    field: "size" | "price",
    value: string
  ) => {
    const updated = [...singleProducts];
    updated[index][field] = value;
    setSingleProducts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && images.length === 0) {
      toast({
        title: "Image Required",
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("itemCode", itemCode);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("style_code", styleCode);
    formData.append("deity", deity);
    formData.append("countInStock", String(countInStock));
    formData.append("single_product", JSON.stringify(singleProducts));
    formData.append("priceForKrishna", priceForKrishna);
    formData.append("productType", productType);
    formData.append("colour", JSON.stringify(existingColours));


    // New images
    images.forEach((img) => formData.append("images", img));

    // Removed images (send as JSON string)
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${adminUser?.token}`,
        },
      };

      let res;
      if (isEditing && existingData?._id) {
        res = await axios.put(
          `${API_URL}/api/accessories/${existingData._id}`,
          formData,
          config
        );
      } else {
        res = await axios.post(`${API_URL}/api/accessories`, formData, config);
      }

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "✅ Success!",
          description: isEditing
            ? "Accessory updated successfully."
            : "Accessory added successfully.",
        });
        resetForm();
        onFormSubmit();
      } else {
        toast({
          title: "Unexpected Response",
          description: "Server did not confirm success.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to submit accessory:", error);
      let message = "Could not submit accessory. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast({
        title: "❌ Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-bold">
        {isEditing ? "Edit Accessory" : "Add New Accessory"}
      </h2>

      {/* Style Code */}
      <div>
        <label className="block mb-1 font-medium">Style Code</label>
        <Input
          value={styleCode}
          onChange={(e) => setStyleCode(e.target.value)}
          placeholder="e.g., RJL-HR-01"
          required
        />
      </div>

      {/* Item Code */}
      <div>
        <label className="block mb-1 font-medium">Item Code</label>
        <Input
          value={itemCode}
          onChange={(e) => setItemCode(e.target.value)}
          placeholder="e.g., RJL-HR-01"
          required
        />
      </div>

      {/* Name Combobox */}
      <div>
        <label className="block mb-1 font-medium">Accessory Name</label>
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCombobox}
              className="w-full justify-between font-normal"
            >
              {name || "Select or type a name..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput
                placeholder="Search or type new name..."
                value={name}
                onValueChange={setName}
              />
              <CommandList>
                <CommandEmpty>
                  No name found. You can use the typed name.
                </CommandEmpty>
                <CommandGroup>
                  {accessoryNames.map((accName) => (
                    <CommandItem
                      key={accName}
                      value={accName}
                      onSelect={(currentValue) => {
                        setName(currentValue === name ? "" : currentValue);
                        setOpenCombobox(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          name === accName ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {accName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>


      {/* Colour (Multiple) */}
      <div>
        <label className="block mb-1 font-medium">Colours</label>

        {/* Add colour input */}
        <div className="flex gap-2 mb-2">
          <Input
            type="text"
            placeholder="Add colour (e.g., Red)"
            value={colour}
            onChange={(e) => setColour(e.target.value)}
          />
          <Button
            type="button"
            onClick={() => {
              if (!colour.trim()) return;
              setExistingColours([...existingColours, colour.trim()]);
              setColour("");
            }}
          >
            Add
          </Button>
        </div>
          
        {/* Show added colours */}
        <div className="flex flex-wrap gap-2">
          {existingColours.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded"
            >
              <span>{c}</span>
              <button
                type="button"
                className="text-red-600"
                onClick={() =>
                  setExistingColours(existingColours.filter((_, idx) => idx !== i))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* Category */}
      <div className="">
        <label className="block mb-1 font-medium">Category</label>
        <Input
          type="text"
          placeholder="e.g., Jewelry"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </div>

      {/* Price for Radha ji / Products */}
      <div>
        <label className="block mb-1 font-medium"><span className="text-red-600">Price for Radha ji</span> / <span className="text-green-700">Products</span></label>
        <Input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      {/* Price for Krishna */}
      <div>
        <label className="block mb-1 font-medium">Price For Krishna Ji</label>
        <Input
          type="text"
          value={priceForKrishna}
          onChange={(e) => setPriceForKrishna(e.target.value)}
          required
        />
      </div>


      {/* Single Product: Sizes & Prices */}
      <div>
        <label className="block mb-2 font-medium">
          Single Products & Prices
        </label>
        <div className="space-y-2">
          {singleProducts.map((sp, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Name"
                value={sp.size}
                onChange={(e) => updateSizeRow(index, "size", e.target.value)}
                className="flex-1"
                required
              />
              <Input
                placeholder="Price"
                type="text"
                value={sp.price}
                onChange={(e) => updateSizeRow(index, "price", e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeSizeRow(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" className="mt-2 bg-secondary" onClick={addSizeRow}>
          + Add Product from the Set
        </Button>
      </div>

      {/* Stock */}
      <div>
        <label>Items In Stock</label>
        <Input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required placeholder="e.g., 10" />
      </div>

      {/* Deity */}
      <div>
        <label className="block mb-1 font-medium">Idol / Deity</label>
        <Select value={deity} onValueChange={setDeity}>
          <SelectTrigger>
            <SelectValue placeholder="Select deity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Radha Ji">Radha Ji</SelectItem>
            <SelectItem value="Krishna Ji">Krishna Ji</SelectItem>
            <SelectItem value="Radha and Krishna">
              Radha & Krishna (Common)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Type */}
      <div>
        <label className="block mb-1 font-medium text-red-600">Product Type</label>
        <Select value={productType} onValueChange={setProductType}>
          <SelectTrigger>
            <SelectValue placeholder="Select Product Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Set">Set</SelectItem>
            <SelectItem value="Single Product">Single Product</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Images */}
      <div>
        <label className="block mb-1 font-medium">Images</label>
        <Input
          type="file"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files || []))}
        />

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {existingImages.map((img, i) => (
              <div key={i} className="relative w-16 h-16">
                <img
                  src={img}
                  alt="existing preview"
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRemovedImages([...removedImages, img]);
                    setExistingImages(
                      existingImages.filter((_, idx) => idx !== i)
                    );
                  }}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New Images */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt="preview"
                className="w-16 h-16 object-cover rounded border"
              />
            ))}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? "Saving..."
          : isEditing
          ? "Update Accessory"
          : "Add Accessory"}
      </Button>
    </form>
  );
};

export default AddAccessoryForm;


