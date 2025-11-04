import { useRef } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/Logo-1.jpg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FileDown } from "lucide-react";
import type { IOrder } from "@/components/admin/DownloadBill"; 

interface InvoiceModalProps {
  order: IOrder | null;
  shippingCharge: string;
  onClose: () => void;
}

export const InvoiceModal = ({
  order,
  shippingCharge,
  onClose,
}: InvoiceModalProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    const input = invoiceRef.current;
    if (input && order) {
      html2canvas(input, { scale: 3 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
        const imgX = (pdfWidth - canvasWidth * ratio) / 2;
        const imgY = 15;

        pdf.addImage(imgData, "JPEG", imgX, imgY, canvasWidth * ratio, canvasHeight * ratio, '', 'FAST');

        pdf.save(`invoice-${order.orderId}.pdf`); // 'selectedOrder' ko 'order' se replace kiya
      });
    }
  };

  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
        <>
          <div className="flex-1 overflow-y-auto pr-4">
            <div ref={invoiceRef} className="p-8 bg-white text-black text-sm">
              <div className="flex justify-between items-start pb-4 border-b">
                <img src={Logo} alt="Company Logo" className="h-16 w-20 object-contain" />
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
                  <p className="mt-1 text-gray-500">
                    <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
              <div className="flex justify-between my-6">
                <div>
                  <h4 className="font-bold mb-2">Seller Details:</h4>
                  <p><strong>Company:</strong> Kunj Creation</p>
                  <p><strong>Address:</strong> Jhotwara, Jaipur, Rajasthan</p>
                  <p><strong>Pincode:</strong> 302012</p>
                  <p><strong>Phone:</strong> 9529663375</p>
                </div>
                <div className="text-left">
                  <p className="mb-2 text-gray-500"><strong>Order ID:</strong> {order.orderId}</p>
                  <h4 className="font-bold mb-2 mt-4">Buyer Details:</h4>
                  <p><strong>Name:</strong> {order.customerName}</p>
                  <p><strong>Phone:</strong> {order.customerPhone}</p>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Order Details:</h3>
              {/* Table for order items */}
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr className="border-b">
                    <th className="p-2 text-left">Image</th>
                    <th className="p-2 text-left">Product Name</th>
                    <th className="p-2 text-center">Size & Name</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => {
                    const unitPrice = item.price + (item.pagdi?.price || 0);
                    const totalItemPrice = unitPrice * item.quantity;
                    return (
                      <tr key={item._id} className="border-b">
                        <td className="">
                          <img src={item.image} alt={item.productName} className="h-12 w-12 object-cover rounded" />
                        </td>
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
                        <td className="p-2 text-right">₹{unitPrice.toFixed(2)}</td>
                        <td className="p-2 text-right font-semibold">₹{totalItemPrice.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-right mt-6">
                <div className="text-right mt-6 space-y-1">
                  <p>Subtotal: ₹{order.totalPrice.toFixed(2)}</p>
                  <p>Shipping Charges: ₹{(Number(shippingCharge) || 0).toFixed(2)}</p>
                  <p className="text-xl font-bold">
                    Grand Total: <span className="text-gray-900">₹{(order.totalPrice + (Number(shippingCharge) || 0)).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 flex-shrink-0">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={handleDownloadPdf}><FileDown className="h-4 w-4 mr-2" /> Download PDF</Button>
          </DialogFooter>
        </>
      </DialogContent>
    </Dialog>
  );
};