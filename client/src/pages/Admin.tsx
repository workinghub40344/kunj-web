// client/src/pages/Admin.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Product as ProductType } from "@/data/products";
import { Plus, Edit, Trash2, LogOut, Menu, Box, FileText, X } from "lucide-react";
import AddProductForm from "@/components/layout/AddProductForm"; // Make sure this is AddProductForm

type Product = ProductType & { _id: string };

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [productToEdit, setProductToEdit] = useState<Product | null>(null); // State for editing

  const [activeTab, setActiveTab] = useState<"products" | "invoices">(
    "products"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Redirect if no token
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
        const { data } = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = JSON.parse(localStorage.getItem("adminInfo") || "{}").token;
    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  // MODIFIED: Function to handle opening the modal for editing
  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };
    
  // MODIFIED: Function to close modal and reset editing state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  // NEW: Callback to update product list after editing
  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p._id === updatedProduct._id ? updatedProduct : p
      )
    );
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white shadow-lg transition-all duration-300 rounded-tr-lg rounded-br-lg border-primary border-r-2 flex flex-col`}
        style={{ width: sidebarOpen ? "16rem" : "4rem" }}
      >
        {/* ... (Sidebar code remains same, no changes needed here) ... */}
         {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && (
            <span className="font-bold text-lg">Admin Panel</span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex flex-col mt-4">
          <button
            className={`flex items-center p-4 hover:bg-gray-200 ${
              activeTab === "products" ? "bg-gray-200" : ""
            }`}
            onClick={() => setActiveTab("products")}
          >
            {sidebarOpen ? (
              <span className="flex-1">Product List</span>
            ) : (
              <Box className="h-5 w-5 mx-auto" />
            )}
          </button>
          <button
            className={`flex items-center p-4 hover:bg-gray-200 ${
              activeTab === "invoices" ? "bg-gray-200" : ""
            }`}
            onClick={() => setActiveTab("invoices")}
          >
            {sidebarOpen ? (
              <span className="flex-1">Invoice Generator</span>
            ) : (
              <FileText className="h-5 w-5 mx-auto" />
            )}
          </button>
        </div>

        {/* Logout */}
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

      {/* Main Content */}
      <div
        className="flex-1 p-6 overflow-auto"
        style={{ marginLeft: sidebarOpen ? "16rem" : "4rem", height: "100vh" }}
      >
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Product List</h2>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsModalOpen(true)} // Open modal for adding
              >
                <Plus className="mr-0 h-0 w-0 md:h-4 md:w-4 " /> Add
              </Button>
            </div>

            {/* Table */}
            <div className="p-4 bg-white rounded-lg shadow">
              {/* Filters ... (no changes here) ... */}
              <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Categories</option>
                  {[...new Set(products.map((p) => p.category))].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="border rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Sizes</option>
                  {[
                    ...new Set(
                      products.flatMap((p) => p.sizes.map((s) => s.size))
                    ),
                  ].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
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
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Sizes & Prices</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(
                        (p) =>
                          p.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) &&
                          (selectedCategory
                            ? p.category === selectedCategory
                            : true) &&
                          (selectedSize
                            ? p.sizes.some((s) => s.size === selectedSize)
                            : true)
                      )
                      .map((p) => (
                        <tr
                          key={p._id}
                          className="border-b hover:bg-gray-50 transition-all"
                        >
                          <td className="p-2 w-20">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </td>
                          <td className="p-2 font-medium">{p.name}</td>
                          <td className="p-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-2 space-y-1 text-sm">
                            {p.sizes.map((s) => (
                              <div key={s.size}>
                                {s.size}: ₹{s.price}
                              </div>
                            ))}
                          </td>
                          <td className="p-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleEditClick(p)} // MODIFIED
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
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

        {/* ... (Invoice tab remains same) ... */}
         {activeTab === "invoices" && (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Invoice Generator</h2>
            <p className="mb-4">Generate PDF invoices for completed orders</p>
            <Button className="bg-primary hover:bg-primary/90">
              Generate Invoice
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] relative flex flex-col">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 z-10"
              onClick={handleCloseModal} // MODIFIED
            >
              <X />
            </button>

            <h3 className="text-lg font-bold p-4 text-[hsl(338,73%,67%)] border-b">
              {productToEdit ? "Edit Product" : "Add Product"} {/* MODIFIED */}
            </h3>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-4 flex-1">
              <AddProductForm
                onClose={handleCloseModal} // MODIFIED
                onProductAdded={(newProduct: Product) =>
                  setProducts((prev) => [newProduct, ...prev])
                }
                productToEdit={productToEdit} // NEW PROP
                onProductUpdated={handleProductUpdated} // NEW PROP
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;