import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface SliderImage {
  _id: string;
  imageUrl: string;
  order: number;
}

const SliderManagement = () => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchImages = useCallback(async () => {
    const { data } = await axios.get(`${API_URL}/api/slider`);
    setImages(data);
  }, [API_URL]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (images.length + selectedFiles.length > 10) {
      toast({
        title: "Limit Exceeded",
        description: `You can only upload ${10 - images.length} more image(s).`,
        variant: "destructive",
      });
      return;
    }

    try {
      const adminInfo = localStorage.getItem("adminInfo");
      if (!adminInfo) {
        toast({
          title: "Not Authorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        return;
      }
      const token = JSON.parse(adminInfo).token;

      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("images", selectedFiles[i]);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // <-- YEH SABSE ZAROORI HAI
        },
      };

      await axios.post(`${API_URL}/api/slider/upload`, formData, config);

      toast({ title: "Success", description: "Images uploaded successfully." });
      fetchImages();
      setSelectedFiles(null);
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      const adminInfo = localStorage.getItem("adminInfo");
      if (!adminInfo) {
        toast({
          title: "Not Authorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        return;
      }
      const token = JSON.parse(adminInfo).token;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // <-- Yahan bhi token add karein
        },
      };

      await axios.delete(`${API_URL}/api/slider/${id}`, config);
      toast({ title: "Success", description: "Image deleted." });
      fetchImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Hero Slider</h1>
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Upload New Image(s) ({images.length}/10)
        </h2>
        <div className="flex gap-4">
          {/* Input mein 'multiple' attribute add kiya gaya hai */}
          <Input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            multiple
          />
          <Button
            onClick={handleUpload}
            disabled={!selectedFiles || images.length >= 10}
          >
            Upload
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image._id} className="relative group">
            <img
              src={image.imageUrl}
              alt={`Slider Image ${image.order}`}
              className="w-full h-40 object-cover rounded-lg shadow-md"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(image._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SliderManagement;
