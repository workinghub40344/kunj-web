import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Order ke data ke liye type definitions
interface IOrderItem {
  productName: string;
  quantity: number;
  size: string;
  price: number;
}
interface IOrder {
  _id: string;
  orderId: string;
  totalPrice: number;
  createdAt: string;
  orderItems: IOrderItem[];
}

const MyOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // AuthContext se user ki details lein
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchMyOrders = async () => {
      // Check karein ki user logged-in hai aur uske paas token hai
      if (user?.token) {
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`, // Apna application token bhejein
            },
          };
          // Sahi API endpoint ko call karein
          const { data } = await axios.get(`${API_URL}/api/orders/myorders`, config);
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch my orders:", error);
        } finally {
          setLoading(false);
        }
      } else {
          setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, API_URL]);

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Loading your orders...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground">Here is a list of all your past orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-600">Order ID</th>
                <th className="p-3 text-left font-semibold text-gray-600">Product Name</th>
                <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                <th className="p-3 text-right font-semibold text-gray-600">Total</th>
                <th className="p-3 text-center font-semibold text-gray-600">Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{order.orderId}</td>
                  <td className="p-3">{order.orderItems[0]?.productName}</td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="p-3 text-right font-semibold">₹{order.totalPrice.toFixed(2)}</td>
                  <td className="p-3 text-center">{order.orderItems.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;