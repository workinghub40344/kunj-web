import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Type definitions ko poora karein
interface IOrderItem {
  _id: string;
  productName: string;
  quantity: number;
  size: string;
  price: number;
  pagdi?: {
    type: string;
    size: string;
    price: number;
  }
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
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (user?.token) {
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
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
        <div className="text-center py-16 border rounded-lg bg-white shadow-sm">
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
                <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                <th className="p-3 text-right font-semibold text-gray-600">Total Amount</th>
                <th className="p-3 text-center font-semibold text-gray-600">Items</th>
                <th className="p-3 text-center font-semibold text-gray-600">Details</th>
              </tr>
            </thead>
            {/* Har order ke liye ek Collapsible section */}
            {orders.map((order) => (
              <Collapsible asChild key={order._id}>
                <>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">{order.orderId}</td>
                    <td className="p-3">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="p-3 text-right font-semibold">₹{order.totalPrice.toFixed(2)}</td>
                    <td className="p-3 text-center">{order.orderItems.length}</td>
                    <td className="p-3 text-center">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          View
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </CollapsibleTrigger>
                    </td>
                  </tr>
                  <CollapsibleContent asChild>
                    <tr className="bg-muted/50">
                      <td colSpan={5} className="p-4">
                        <h4 className="font-semibold mb-2 text-sm">Items in this Order:</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {order.orderItems.map((item) => (
                            <li key={item._id} className="text-sm text-muted-foreground">
                              {item.quantity} x {item.productName} (Size: {item.size})
                              {item.pagdi && (
                                <span className="text-xs text-green-600 font-semibold block pl-2">
                                  + {item.pagdi.type} ({item.pagdi.size})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;