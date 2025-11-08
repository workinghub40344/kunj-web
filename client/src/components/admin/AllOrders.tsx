import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OrderDetails from "./OrderDetails";

// Interfaces
interface IOrderItem { productName: string; quantity: number; size: string; price: number; _id: string; }
interface IOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderItems: IOrderItem[];
  totalPrice: number;
  createdAt: string;
}

const AllOrders = () => {
  const { user: adminUser } = useAuth();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();


  useEffect(() => {
    const fetchOrders = async () => {
      if (adminUser?.token) {
        try {
          const config = { headers: { Authorization: `Bearer ${adminUser.token}` } };
          const { data } = await axios.get(`${API_URL}/api/orders`, config);
          const sortedOrders = data.sort(
            (a: IOrder, b: IOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sortedOrders);
        } catch (error) {
          console.error("Failed to fetch all orders:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [adminUser, API_URL]);

    const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminUser?.token}` },
      };
      await axios.delete(`${API_URL}/api/orders/${orderId}`, config); 

      setOrders(orders.filter((order) => order._id !== orderId));
      alert("Order deleted successfully!");
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete the order. Please try again.");
    }
  };

  // Reset Order IDs and Delete all
  const handleResetOrders = async () => {
    const confirmationMessage =
      "WARNING: This will permanently delete ALL orders...";

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${adminUser?.token}` },
      };
      const response = await axios.delete(
        `${API_URL}/api/orders/reset`,
        config
      );

      alert(response.data.message);
      setOrders([]);
    } catch (error) {
      console.error("Failed to reset orders:", error);
      alert("Failed to reset orders. Please try again.");
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm) ||
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="p-6">Loading all orders...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Customer Orders</h1>
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by Name, Phone, or Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-red-600"
          onClick={handleResetOrders}
        >
          Reset All Orders
        </Button>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-600">Order ID</th>
              <th className="p-3 text-left font-semibold text-gray-600">Customer</th>
              <th className="p-3 text-left font-semibold text-gray-600">Date</th>
              <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-sm">{order.orderId}</td>
                <td className="p-3 font-semibold">{order.customerName}</td>
                <td className="p-3">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                <td className="p-2 text-center flex gap-2 justify-center items-center">
                  <Button 
                    className="bg-gray-500 hover:bg-secondary"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Order
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(order._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
          {selectedOrder && (
            <OrderDetails orderId={selectedOrder._id}/>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AllOrders;