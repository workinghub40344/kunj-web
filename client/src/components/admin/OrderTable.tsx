import { Button } from "@/components/ui/button";
import { FileDown, Trash2 } from "lucide-react";
import type { IOrder } from "@/components/admin/DownloadBill";

interface OrderTableProps {
  orders: IOrder[];
  onViewBill: (order: IOrder) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderTable = ({ orders, onViewBill, onDeleteOrder }: OrderTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left font-semibold text-gray-600">Order ID</th>
            <th className="p-3 text-left font-semibold text-gray-600">Customer Name</th>
            <th className="p-3 text-left font-semibold text-gray-600">Order Date</th>
            <th className="p-3 text-left font-semibold text-gray-600">Total Price</th>
            <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-mono text-sm">{order.orderId}</td>
              <td className="p-3">{order.customerName}</td>
              <td className="p-3">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
              <td className="p-3 font-semibold">₹{order.totalPrice.toFixed(2)}</td>
              <td className="p-3 text-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => onViewBill(order)}>
                  <FileDown className="h-4 w-4 mr-2" /> Bill
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDeleteOrder(order._id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};