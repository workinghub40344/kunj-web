import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products"; 
import { Plus, Edit, Trash2, LogOut, Menu } from "lucide-react";

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "invoices">("products");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/products");
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <span className="font-bold text-lg">Admin Panel</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu />
          </button>
        </div>

        <div className="flex-1 flex flex-col mt-4">
          <button
            className={`flex items-center p-4 hover:bg-gray-200 ${activeTab === "products" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <span className="flex-1">{sidebarOpen ? "Product List" : "P"}</span>
          </button>
          <button
            className={`flex items-center p-4 hover:bg-gray-200 ${activeTab === "invoices" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveTab("invoices")}
          >
            <span className="flex-1">{sidebarOpen ? "Invoice Generator" : "I"}</span>
          </button>
        </div>

        {/* Logout at bottom */}
        <div className="p-4 border-t">
          <button className="flex items-center w-full hover:bg-gray-200">
            <LogOut className="mr-2" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Product List</h2>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Sizes & Prices</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="odd:bg-white even:bg-gray-50">
                    <td className="border p-2">{p.name}</td>
                    <td className="border p-2">
                      {p.sizes.map(s => `${s.size}: $${s.price}`).join(", ")}
                    </td>
                    <td className="border p-2 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteProduct(p._id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
    </div>
  );
};

export default AdminPanel;
