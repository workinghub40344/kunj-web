import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/assets/Logo-1.jpg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FileDown, Trash2, Search, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface IOrderItem {
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
interface IOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderItems: IOrderItem[];
  totalPrice: number;
  createdAt: string;
}
interface DownloadBillProps {
  userId?: string;
}

const DownloadBill = ({ userId }: DownloadBillProps) => {
  const { user: adminUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const invoiceRef = useRef<HTMLDivElement>(null);
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
  }, [API_URL, userId, adminUser]); // Dependency mein adminUser add karein

  const handleDownloadPdf = () => {
    const input = invoiceRef.current;
    if (input && selectedOrder) {
      html2canvas(input, { scale: 3 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = Math.min(
          pdfWidth / canvasWidth,
          pdfHeight / canvasHeight
        );
        const imgX = (pdfWidth - canvasWidth * ratio) / 2;
        const imgY = 15;

        pdf.addImage(
          imgData,
          "PNG",
          imgX,
          imgY,
          canvasWidth * ratio,
          canvasHeight * ratio
        );
        pdf.save(`invoice-${selectedOrder.orderId}.pdf`);
      });
    }
  };

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
  const filteredOrders = searchTerm
    ? orders.filter(
        (order) =>
          order.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;

  return (
    <div className="p-6 bg-white rounded-lg shadow min-h-screen">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Download Previous Bills
        </h1>
        {/* Search Input */}
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* Reset Order Button */}
        <Button
          variant="destructive"
          onClick={handleResetOrders}
          className="w-fit text-xs px-2"
        >
          <RefreshCw className="h-2 w-2 mr-0" />
          Reset All Orders
        </Button>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-600">
                  Order ID
                </th>
                <th className="p-3 text-left font-semibold text-gray-600">
                  Customer Name
                </th>
                <th className="p-3 text-left font-semibold text-gray-600">
                  Order Date
                </th>
                <th className="p-3 text-left font-semibold text-gray-600">
                  Total Price
                </th>
                <th className="p-3 text-center font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{order.orderId}</td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-3 font-semibold">
                    ₹{order.totalPrice.toFixed(2)}
                  </td>
                  <td className="p-3 text-center space-x-2">
                    {/* Shipping Charges Modal Open */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // setSelectedOrder(order);
                        setShowShippingModal(true);
                      }}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Bill
                    </Button>
                    {/* Delete Order Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Shipping Charges Modal */}
      <Dialog open={showShippingModal} onOpenChange={setShowShippingModal}>
        <DialogContent className="sm:max-w-sm">
          <h3 className="text-lg font-bold mb-2">Add Shipping Charges</h3>
          <Input
            type="number"
            placeholder="Enter shipping amount (₹)"
            value={shippingCharge}
            onChange={(e) => setShippingCharge(e.target.value)}
          />
          <DialogFooter>
            <Button
              onClick={() => {
                setShowShippingModal(false);
                setSelectedOrder(orders[0]); // ensure selected order still active
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
          {selectedOrder && (
            <>
              <div className="flex-1 overflow-y-auto pr-4">
                <div
                  ref={invoiceRef}
                  className="p-8 bg-white text-black text-sm"
                >
                  <div className="flex justify-between items-start pb-4 border-b">
                    <img
                      src={Logo}
                      alt="Company Logo"
                      className="h-16 w-20 object-contain"
                    />
                    <div className="text-right">
                      <h2 className="text-3xl font-bold text-gray-800">
                        INVOICE
                      </h2>
                      <p className="mt-1 text-gray-500">
                        <strong>Date:</strong>{" "}
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between my-6">
                    <div>
                      <h4 className="font-bold mb-2">Seller Details:</h4>
                      <p>
                        <strong>Company:</strong> Kunj Creation
                      </p>
                      <p>
                        <strong>Address:</strong> Jhotwara, Jaipur, Rajasthan
                      </p>
                      <p>
                        <strong>Pincode:</strong> 302012
                      </p>
                      <p>
                        <strong>Phone:</strong> 8504866930
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="mb-2 text-gray-500">
                        <strong>Order ID:</strong> {selectedOrder.orderId}
                      </p>
                      <h4 className="font-bold mb-2 mt-4">Buyer Details:</h4>
                      <p>
                        <strong>Name:</strong> {selectedOrder.customerName}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Order Details:</h3>
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr className="border-b">
                        <th className="p-2 text-left">Product Name</th>
                        <th className="p-2 text-center">Size</th>
                        <th className="p-2 text-center">Quantity</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems.map((item) => {
                        const unitPrice = item.price + (item.pagdi?.price || 0);
                        const totalItemPrice = unitPrice * item.quantity;
                        return (
                          <tr key={item._id} className="border-b">
                            <td className="p-2">
                              {item.productName}
                              {item.pagdi && (
                                <span className="text-xs text-gray-500 block">
                                  + {item.pagdi.type} ({item.pagdi.size})
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-center">{item.size}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">
                              ₹{unitPrice.toFixed(2)}
                            </td>
                            <td className="p-2 text-right font-semibold">
                              ₹{totalItemPrice.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="text-right mt-6">
                    <div className="text-right mt-6 space-y-1">
                      <p>Subtotal: ₹{selectedOrder.totalPrice.toFixed(2)}</p>
                      <p>
                        Shipping Charges: ₹
                        {(Number(shippingCharge) || 0).toFixed(2)}
                      </p>
                      <p className="text-xl font-bold">
                        Grand Total:{" "}
                        <span className="text-gray-900">
                          ₹
                          {(
                            selectedOrder.totalPrice +
                            (Number(shippingCharge) || 0)
                          ).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 flex-shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
                <Button onClick={handleDownloadPdf}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DownloadBill;
