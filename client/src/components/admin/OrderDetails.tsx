import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { IOrder } from "@/data/orderType"



const OrderDetails = ({
  orderId,
}: {
  orderId: string;
}) => {
  const { user: adminUser } = useAuth();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

useEffect(() => {
  const fetchOrder = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminUser?.token}` },
      };

      console.log("🟢 Fetching all orders...");
      const { data }: { data: IOrder[] } = await axios.get(`${API_URL}/api/orders`, config);
      console.log("🟢 Got all orders:", data.length);

      // Find the matching order by _id or orderId
      const foundOrder = data.find(
        (o: IOrder) => o._id === orderId || o.orderId === orderId
      );

      if (!foundOrder) {
        console.warn("⚠️ Order not found in fetched list!");
      }

      setOrder(foundOrder || null);
    } catch (err) {
      console.error("🔴 Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  };
  if (orderId) fetchOrder();
}, [orderId, API_URL, adminUser]);


  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading order details...</p>;
  if (!order)
    return <p className="p-6 text-center text-red-500">Order not found.</p>;

return (
  <div className="p-6 bg-white text-black rounded-lg">
    {/* Header */}
    <div className="flex justify-between items-center border-b pb-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold">Order Details</h2>
        <p className="text-sm text-gray-500">Order ID: {order.orderId}</p>
        <p className="text-sm text-gray-500">
          Date: {new Date(order.createdAt).toLocaleDateString("en-GB")}
        </p>
      </div>
    {/* Customer Info */}
    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Customer Info</h3>
        <p>
            <strong>Name:</strong> {order.customerName}
        </p>
        <p>
            <strong>Phone:</strong> {order.customerPhone}
        </p>
    </div>
    </div>

    {/* Order Items */}
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Order Items</h3>

    {/* Grid layout */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {order.orderItems.map((item) => (
        <div
          key={item._id}
          className="border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden flex flex-col"
        >
          {/* Image Section */}
          <div className="flex justify-center items-center bg-gray-50 p-3">
            {item.image ? (
              <img
                src={item.image}
                alt={item.productName}
                className="w-[140px] h-[140px] object-cover rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-[140px] h-[140px] flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded-lg border">
                No Image
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <h4 className="text-base text-wrap mb-1 font-semibold text-gray-800 truncate">
                {item.productName}
              </h4>
              <p className="text-xs text-gray-500">
                <strong className="text-secondary">Item Code:</strong>{" "}
                {item.itemCode || "-"}
              </p>

              {/* Size / Type */}
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                {item.sizeType === "Metal" || item.sizeType === "Marble" ? (
                  <p>
                    <strong className="text-gray-500">Size:</strong>{" "}
                    {item.size || "-"}
                  </p>
                ) : (
                  <p>
                    <strong className="text-gray-500">Type:</strong>{" "}
                    {item.size || "-"}
                  </p>
                )}
                <p className="text-gray-400 ml-1">({item.sizeType})</p>
              </div>

              {/* Pagdi Info Section */}
              {(item.sizeType === "Metal" || item.sizeType === "Marble") && (
                <div className="mt-1">
                  {item.pagdi ? (
                    <p className="text-xs text-secondary">
                      <strong className="text-gray-500">Pagdi:</strong>{" "}
                      {item.pagdi.type} – {item.pagdi.size} (₹{item.pagdi.price})
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Pagdi not included
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Qty & Price */}
            <div className="flex justify-between items-center border-t mt-2 pt-2">
              <p className="text-xs text-gray-600">
                Qty: <strong>{item.quantity}</strong>
              </p>
              <p className="text-sm font-semibold text-gray-800">
                ₹
                {(
                  item.price * item.quantity +
                  (item.pagdi ? item.pagdi.price : 0)
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>

    </div>
  </div>
);

};

export default OrderDetails;
