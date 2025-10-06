import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import Logo from "@/assets/Logo-1.jpg";

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
  const invoiceRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

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
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-600">Order ID</th>
              <th className="p-3 text-left font-semibold text-gray-600">Customer</th>
              <th className="p-3 text-left font-semibold text-gray-600">Contact</th>
              <th className="p-3 text-left font-semibold text-gray-600">Date</th>
              <th className="p-3 text-right font-semibold text-gray-600">Total</th>
              <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-sm">{order.orderId}</td>
                <td className="p-3 font-semibold">{order.customerName}</td>
                <td className="p-3">{order.customerPhone}</td>
                <td className="p-3">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                <td className="p-3 text-right font-semibold">₹{order.totalPrice.toFixed(2)}</td>
                <td className="p-3 text-center">
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                    View Bill
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Invoice: {selectedOrder.orderId}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-4">
                <div ref={invoiceRef} className="p-8 bg-white text-black text-sm">
                  {/* Invoice Content Start */}
                  <div className="flex justify-between items-start pb-4 border-b">
                    <img src={Logo} alt="Company Logo" className="h-16 w-20 object-contain"/>
                    <div className="text-right">
                      <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
                      <p className="mt-1 text-gray-500"><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                  <div className="flex justify-between my-6">
                    <div>
                      <h4 className="font-bold mb-2">Seller Details:</h4>
                      <p><strong>Company:</strong> Kunj Creation</p>
                      <p><strong>Address:</strong> Jhotwara, Jaipur, Rajasthan</p>
                      <p><strong>Phone:</strong> 8504866930</p>
                    </div>
                    <div className="text-left">
                      <p className="mb-2 text-gray-500"><strong>Order ID:</strong> {selectedOrder.orderId}</p>
                      <h4 className="font-bold mb-2 mt-4">Buyer Details:</h4>
                      <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                      <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Order Details:</h3>
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr className="border-b"><th className="p-2 text-left">Product</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Unit Price</th><th className="p-2 text-right">Total</th></tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems.map((item) => (
                        <tr key={item._id} className="border-b">
                          <td className="p-2">{item.productName} ({item.size})</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">₹{item.price.toFixed(2)}</td>
                          <td className="p-2 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-right mt-6">
                    <p className="text-xl font-bold">Grand Total: <span className="text-gray-900">₹{selectedOrder.totalPrice.toFixed(2)}</span></p>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4 flex-shrink-0">
                <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrders;