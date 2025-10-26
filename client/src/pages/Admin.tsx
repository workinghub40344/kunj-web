import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, LogOut, Menu, Box, SlidersHorizontal, User, ListOrdered, X, Gem } from "lucide-react";
import AddProductForm from "@/components/layout/AddProductForm";
import SliderManagement from "@/components/admin/SliderManagement";
import UserInfo from "@/components/admin/UserInfo";
import AllOrders from "@/components/admin/AllOrders";
import Accessories from "@/components/admin/Accessories";
import ProductDetailsModal from "../components/admin/ProductDetailsModal";


interface SizeOption {
  size: string;
  price: number;
}

interface Product {
  _id: string;
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
  stock_status: "IN_STOCK" | "OUT_OF_STOCK" | "BOOKING_CLOSED";
}

const AdminPanel = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [activeTab, setActiveTab] = useState<
    "products" | "slider" | "userinfo" | "allorders" | "accessories"
  >("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Sorted size list
  const sortedSizes = useMemo(() => {
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
    const allSizes = products.flatMap((p) => [
      ...(p.metal_sizes || []).map((s) => s.size),
      ...(p.marble_sizes || []).map((s) => s.size),
    ]);
    const uniqueSizes = [...new Set(allSizes)];
    uniqueSizes.sort((a, b) => {
      const upperA = a.toUpperCase();
      const upperB = b.toUpperCase();
      const indexA = sizeOrder.indexOf(upperA);
      const indexB = sizeOrder.indexOf(upperB);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
    return uniqueSizes;
  }, [products]);

  // Auth check
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("adminInfo") || "{}").token;
    if (!token) {
      window.location.replace("/admin");
    }
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const token = JSON.parse(localStorage.getItem("adminInfo") || "{}").token;
      if (!token) return;
      try {
        const { data } = await axios.get(`${API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, [API_URL]);

  // Delete product
  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = JSON.parse(localStorage.getItem("adminInfo") || "{}").token;
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  // Update stock status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const token = JSON.parse(localStorage.getItem("adminInfo") || "{}").token;
    if (!token) return;
    try {
      const { data } = await axios.put(
        `${API_URL}/api/products/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleProductUpdated(data.product);
    } catch (err) {
      console.error("Failed to update stock status", err);
    }
  };

  // Edit product
  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  // Update list after edit
  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  // Add product callback
  const handleProductAdded = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white shadow-lg transition-all duration-300 rounded-tr-lg rounded-br-lg border-primary border-r-2 flex flex-col`}
        style={{ width: sidebarOpen ? "16rem" : "4rem" }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <span className="font-bold text-lg">Admin Panel</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex flex-col mt-4">
          {[
            { key: "products", label: "Product List", icon: Box },
            { key: "accessories", label: "Accessories", icon: Gem },
            { key: "userinfo", label: "User Info", icon: User },
            { key: "slider", label: "Slider", icon: SlidersHorizontal },
            { key: "allorders", label: "All Orders", icon: ListOrdered },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`flex items-center p-4 hover:bg-gray-200 ${
                activeTab === key ? "bg-gray-200" : ""
              }`}
              onClick={() => setActiveTab(key as typeof activeTab)}
            >
              {sidebarOpen ? (
                <span className="flex-1">{label}</span>
              ) : (
                <Icon className="h-5 w-5 mx-auto" />
              )}
            </button>
          ))}
        </div>

        <button
          className="flex items-center w-full hover:bg-gray-200 mt-auto mb-4 p-4"
          onClick={() => {
            localStorage.removeItem("adminInfo");
            window.location.replace("/admin");
          }}
        >
          <LogOut className="mr-2" />
          {sidebarOpen && "Logout"}
        </button>
      </div>

      {/* Main content */}
      <div
        className="flex-1 p-6 overflow-auto"
        style={{ marginLeft: sidebarOpen ? "16rem" : "4rem", height: "100vh" }}
      >
        {activeTab === "products" && (
          <div>
            {/* Header */}
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Product List</h2>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>

            {/* Product Table Container */}
            <div className="p-4 bg-white rounded-lg shadow">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-3 py-2 w-full md:w-1/4"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded px-3 py-2 w-full md:w-1/4"
                >
                  <option value="">All Categories</option>
                  {[...new Set(products.map((p) => p.category))].map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="border rounded px-3 py-2 w-full md:w-1/4"
                >
                  <option value="">All Sizes</option>
                  {sortedSizes.map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Product Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Image</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                          (selectedCategory ? p.category === selectedCategory : true) &&
                          (selectedSize
                            ? [...p.metal_sizes, ...p.marble_sizes].some(
                                (s) => s.size === selectedSize
                              )
                            : true)
                      )
                      .map((p) => (
                        <tr key={p._id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          </td>
                          <td className="p-2">{p.name}</td>
                          <td className="p-2">
                            <select
                              value={p.stock_status}
                              onChange={(e) =>
                                handleUpdateStatus(p._id, e.target.value)
                              }
                              className="border rounded px-2 py-1"
                            >
                              <option value="IN_STOCK">In Stock</option>
                              <option value="OUT_OF_STOCK">Out of Stock</option>
                              <option value="BOOKING_CLOSED">
                                Booking Closed
                              </option>
                            </select>
                          </td>
                        
                          <td className="p-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProduct(p);
                                setIsDetailsOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditClick(p)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteProduct(p._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "slider" && <SliderManagement />}
        {activeTab === "userinfo" && <UserInfo />}
        {activeTab === "allorders" && <AllOrders />}
        {activeTab === "accessories" && <Accessories />}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2"
            >
              <X />
            </button>
            <h3 className="text-lg font-bold p-4 border-b">
              {productToEdit ? "Edit Product" : "Add Product"}
            </h3>
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <AddProductForm
                onClose={handleCloseModal}
                onProductAdded={handleProductAdded}
                onProductUpdated={handleProductUpdated}
                productToEdit={productToEdit}
              />
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      <ProductDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        product={selectedProduct}
      />
    </div>
  );
};

export default AdminPanel;
