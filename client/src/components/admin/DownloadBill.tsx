import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Search, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { OrderTable } from "@/components/admin/OrderTable";
import { InvoiceModal } from "@/components/admin/InvoiceModal";

export interface IOrderItem {
  productName: string;
  quantity: number;
  size: string;
  price: number;
  image: string;
  customization?: string;
  _id: string;
  pagdi?: {
    type: string;
    size: string;
    price: number;
  };
}
export interface IOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderItems: IOrderItem[];
  totalPrice: number;
  createdAt: string;
}

const DownloadBill = ({ userId }: { userId?: string }) => {
  const { user: adminUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [shippingCharge, setShippingCharge] = useState<string>("");
  const [showShippingModal, setShowShippingModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!adminUser?.token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const url = userId
          ? `${API_URL}/api/orders/user/${userId}`
          : `${API_URL}/api/orders`;

        const config = {
          headers: { Authorization: `Bearer ${adminUser.token}` },
          params: { _cacheBust: new Date().getTime() },
        };
        const { data } = await axios.get(url, config);

        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_URL, userId, adminUser]);
  // Delete Order Function
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }
    try {
      // Token ke saath config object banayein
      const config = {
        headers: { Authorization: `Bearer ${adminUser?.token}` },
      };
      await axios.delete(`${API_URL}/api/orders/${orderId}`, config); // config ko yahan pass karein

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
      // Token ke saath config object banayein
      const config = {
        headers: { Authorization: `Bearer ${adminUser?.token}` },
      };
      const response = await axios.delete(
        `${API_URL}/api/orders/reset`,
        config
      ); // config ko yahan pass karein

      alert(response.data.message);
      setOrders([]);
    } catch (error) {
      console.error("Failed to reset orders:", error);
      alert("Failed to reset orders. Please try again.");
    }
  };
  // Corrected filter logic
  const filteredOrders = useMemo(() => {
    return searchTerm
      ? orders.filter(order =>
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : orders;
  }, [orders, searchTerm]);

  const openShippingModal = (order: IOrder) => {
    setSelectedOrder(order);
    setShowShippingModal(true);
  };

  const confirmShipping = () => {
    setShowShippingModal(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow min-h-screen">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {userId ? `Orders for User` : 'Download Previous Bills'}
        </h1>
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        {!userId && <Button variant="destructive" onClick={handleResetOrders} className="flex-shrink-0"><RefreshCw className="h-4 w-4 mr-2" /> Reset All Orders</Button>}
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <OrderTable orders={filteredOrders} onViewBill={openShippingModal} onDeleteOrder={handleDeleteOrder} />
      )}

      <Dialog open={showShippingModal} onOpenChange={setShowShippingModal}>
        <DialogContent className="sm:max-w-sm">
          <h3 className="text-lg font-bold mb-2">Add Shipping Charges</h3>
          <Input type="number" placeholder="Enter shipping amount (₹)" value={shippingCharge} onChange={(e) => setShippingCharge(e.target.value)} />
          <DialogFooter>
            <Button onClick={confirmShipping}>Add & View Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InvoiceModal 
        order={selectedOrder} 
        shippingCharge={shippingCharge}
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  );
};

export default DownloadBill;
