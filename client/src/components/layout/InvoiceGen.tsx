import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Plus, Trash2, FileText, User, Phone } from "lucide-react";
import Logo from "@/assets/Logo-2.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

// Interface Definitions
interface SizeOption {
  size: string;
  price: number;
}
interface Product {
  _id: string;
  name: string;
  category: string;
  sizes: SizeOption[];
  images: string[];
}
interface BillItem {
  id: string;
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}
interface ProductRowState {
  selectedSize: string;
  quantity: number | string;
  manualSize: string;
  manualPrice: number | string;
}

const BillingSystem = () => {
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState<Product[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isCustomerDetailStep, setIsCustomerDetailStep] = useState(true);
  const [rowStates, setRowStates] = useState<Record<string, ProductRowState>>({});
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  const [manualItem, setManualItem] = useState({
    name: "",
    size: "",
    price: "",
    quantity: "1",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/products`);
        setProducts(data);
        const initialStates: Record<string, ProductRowState> = {};
        data.forEach((p: Product) => {
          initialStates[p._id] = {
            selectedSize: p.sizes[0]?.size || "",
            quantity: 1,
            manualSize: "",
            manualPrice: 0,
          };
        });
        setRowStates(initialStates);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch products.",
        });
      }
    };
    fetchProducts();
  }, [API_URL, toast]);

  const handleRowStateChange = (
    productId: string,
    field: keyof ProductRowState,
    value: string | number
  ) => {
    setRowStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleManualItemChange = (
    field: keyof typeof manualItem,
    value: string
  ) => {
    setManualItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleManualAdd = () => {
    const { name, size } = manualItem;
    const price = Number(manualItem.price);
    const quantity = Number(manualItem.quantity);

    if (!name || !size || price <= 0 || quantity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    const newItem: BillItem = {
      id: `manual-${name}-${Date.now()}`,
      productId: "manual",
      name,
      size,
      price,
      quantity,
    };
    setBillItems((prev) => [...prev, newItem]);
    toast({
      title: "Item Added",
      description: `"${name} (${size})" has been added to the bill.`,
    });
    setManualItem({ name: "", size: "", price: "", quantity: "1" });
    setIsManualAddModalOpen(false);
  };

  const handleAddToBill = (product: Product) => {
    const currentState = rowStates[product._id];
    if (!currentState) return;

    const quantity = Number(currentState.quantity);
    const manualPrice = Number(currentState.manualPrice);
    const isManual = currentState.selectedSize === "manual";
    const size = isManual ? currentState.manualSize : currentState.selectedSize;

    if (!size || quantity < 1) {
      toast({ title: "Invalid", description: "Please select a size and quantity.", variant: "destructive"});
      return;
    }

    let price: number;
    if (isManual) {
      if(manualPrice <= 0) {
        toast({ title: "Invalid Price", description: "Please enter a valid price.", variant: "destructive"});
        return;
      }
      price = manualPrice;
    } else {
      const sizeOption = product.sizes.find((s) => s.size === size);
      price = sizeOption?.price || 0;
    }
    
    if (price <= 0) {
        toast({ title: "Price Error", description: "Could not determine a valid price.", variant: "destructive"});
        return;
    }

    const billItemId = `${product._id}-${size}`;
    const existingItemIndex = billItems.findIndex((item) => item.id === billItemId);

    if (existingItemIndex > -1) {
      const updatedBillItems = [...billItems];
      updatedBillItems[existingItemIndex].quantity += quantity;
      setBillItems(updatedBillItems);
    } else {
      const newItem: BillItem = {
        id: billItemId,
        productId: product._id,
        name: product.name,
        size,
        quantity,
        price,
      };
      setBillItems((prev) => [...prev, newItem]);
    }
    toast({
        title: "Item Added",
        description: `${product.name} (${size}) added to the bill.`,
    });
  };

  const handleRemoveFromBill = (itemId: string) => {
    setBillItems(billItems.filter((item) => item.id !== itemId));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory ? p.category === selectedCategory : true) &&
        (selectedSize ? p.sizes.some((s) => s.size === selectedSize) : true)
    );
  }, [products, searchTerm, selectedCategory, selectedSize]);

  const billTotal = useMemo(() => {
    return billItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [billItems]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products]
  );
  
  const allSizes = useMemo(() => {
    const sizeOrder = ["XS","S","M","L","XL","XXL","XXXL","4XL","5XL"];
    const uniqueSizes = [...new Set(products.flatMap((p) => p.sizes.map((s) => s.size)))];
    uniqueSizes.sort((a, b) => {
      const indexA = sizeOrder.indexOf(a.toUpperCase());
      const indexB = sizeOrder.indexOf(b.toUpperCase());
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
    return uniqueSizes;
  }, [products]);

  const handleGenerateBill = () => {
    if (billItems.length === 0) {
      toast({
        title: "Empty Bill",
        description: "Please add items to the bill first.",
        variant: "destructive",
      });
      return;
    }
    setIsCustomerDetailStep(true);
    setIsBillModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBillModalOpen(false);
    setCustomerName("");
    setCustomerPhone("");
    setOrderId("");
  };

  const handleDownloadPdf = () => {
    const input = invoiceRef.current;
    if (input) {
      html2canvas(input, { scale: 3 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = pdfWidth / canvasWidth;
        const imgHeight = canvasHeight * ratio;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
        pdf.save(`invoice-${orderId || "bill"}.pdf`);
      });
    }
  };

  return (
    <div className="p-6 bg-[hsl(var(--soft-beige))] min-h-screen">
      <div className="p-4 bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[hsl(var(--primary))]">
            Select Products
          </h2>
          <Button onClick={() => setIsManualAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Manually
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-center">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-300 focus:ring-[hsl(var(--primary))]"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border-gray-300 rounded-md p-2 w-full focus:ring-[hsl(var(--primary))]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border-gray-300 rounded-md p-2 w-full focus:ring-[hsl(var(--primary))]"
          >
            <option value="">All Sizes</option>
            {allSizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-left w-48">Size</th>
                <th className="p-3 text-left w-24">Price</th>
                <th className="p-3 text-left w-24">Quantity</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const state = rowStates[p._id] || { selectedSize: "", quantity: 1, manualSize: "", manualPrice: 0 };
                const price = p.sizes.find((s) => s.size === state.selectedSize)?.price || 0;
                return (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium flex items-center gap-2">
                      <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded" />
                      {p.name}
                    </td>
                    <td className="p-2">
                      <select value={state.selectedSize} onChange={(e) => handleRowStateChange(p._id, "selectedSize", e.target.value)} className="border-gray-300 rounded-md p-2 w-full">
                        <option value="" disabled>Select a size</option>
                        {p.sizes.map((s) => (<option key={s.size} value={s.size}>{s.size}</option>))}
                        <option value="manual">Enter Manually...</option>
                      </select>
                      {state.selectedSize === "manual" && (
                        <Input type="text" placeholder="Enter custom size" value={state.manualSize} onChange={(e) => handleRowStateChange(p._id, "manualSize", e.target.value)} className="mt-2" />
                      )}
                    </td>
                    <td className="p-2 font-semibold">
                      {state.selectedSize === "manual" ? (
                        <Input type="number" placeholder="Price" min="0" value={state.manualPrice} onChange={(e) => handleRowStateChange(p._id, "manualPrice", e.target.value)} className="w-24" />
                      ) : (`₹${price.toFixed(2)}`)}
                    </td>
                    <td className="p-2">
                      <Input type="number" min="1" value={state.quantity} onChange={(e) => handleRowStateChange(p._id, "quantity", e.target.value)} className="w-20" />
                    </td>
                    <td className="p-2">
                      <Button onClick={() => handleAddToBill(p)} className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">
                        <Plus className="h-4 w-4 mr-1" /> Add to Bill
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {billItems.length > 0 && (
        <div className="p-4 bg-white rounded-lg shadow mt-6">
          <h2 className="text-2xl font-bold mb-4 text-[hsl(var(--primary))]">
            Current Bill
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Item</th>
                  <th className="p-3 text-left">Size</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Quantity</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2">{item.size}</td>
                    <td className="p-2">₹{item.price.toFixed(2)}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td className="p-2">
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFromBill(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right mt-4">
            <p className="text-xl font-bold">
              Grand Total:{" "}
              <span className="text-[hsl(var(--primary))]">₹{billTotal.toFixed(2)}</span>
            </p>
            <Button onClick={handleGenerateBill} className="mt-4 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
              <FileText className="h-4 w-4 mr-2" />
              Generate Bill
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isBillModalOpen} onOpenChange={setIsBillModalOpen}>
        <DialogContent className="max-w-4xl flex flex-col max-h-[90vh]">
          {isCustomerDetailStep ? (
            <div className="space-y-4 py-4">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="pl-10" required />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="pl-10" required />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Customer Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="pl-10" required />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-4">
              <div ref={invoiceRef} className="p-6 border rounded-lg bg-white my-4 text-sm">
                <div className="flex justify-between items-start pb-4 border-b">
                  <img src={Logo} alt="Logo" className="h-16 w-20 object-contain" />
                  <div className="text-right">
                    <h2 className="text-3xl font-bold text-[hsl(var(--primary))]">INVOICE</h2>
                    <p className="text-gray-500 mt-1">Date: {new Date().toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
                <div className="flex justify-between items-start my-4">
                  <div>
                    <h4 className="font-bold mb-2">Seller Details:</h4>
                    <p><strong>Company:</strong> Kunj Creation</p>
                    {/* <p><strong>GST:</strong> 08AAAAA0000A1Z5</p> */}
                    <p><strong>Address:</strong> Jhotwara, Jaipur, Rajasthan</p>
                    <p><strong>Pincode:</strong> 302012</p>
                    <p><strong>Phone:</strong> 9529663375</p>
                  </div>
                  <div className="text-left">
                    <p className="mb-2 text-gray-500"><strong>Order ID:</strong> {orderId || "N/A"}</p>
                    <h4 className="font-bold mb-2">Buyer Details:</h4>
                    <p><strong>Name:</strong> {customerName || "N/A"}</p>
                    <p><strong>Phone:</strong> {customerPhone || "N/A"}</p>
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr className="border-b">
                      <th className="p-2 text-left">Item</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{item.name} ({item.size})</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">₹{item.price.toFixed(2)}</td>
                        <td className="p-2 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right mt-4 font-bold text-lg">
                  Grand Total:{" "}
                  <span className="text-[hsl(var(--primary))]">₹{billTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {isCustomerDetailStep ? (
              <Button onClick={() => setIsCustomerDetailStep(false)} disabled={!orderId || !customerName || !customerPhone} className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                Proceed to Bill
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCloseModal}>Close</Button>
                <Button onClick={handleDownloadPdf} className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]">Download PDF</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManualAddModalOpen} onOpenChange={setIsManualAddModalOpen}>
        <DialogContent>
          <h2 className="text-xl font-bold mb-4">Add Item Manually</h2>
          <div className="space-y-4">
            <div>
              <label>Item Name</label>
              <Input value={manualItem.name} onChange={(e) => handleManualItemChange("name", e.target.value)} placeholder="e.g., Radha Ji Dress" />
            </div>
            <div>
              <label>Size</label>
              <Input value={manualItem.size} onChange={(e) => handleManualItemChange("size", e.target.value)} placeholder="e.g., 3-inch" />
            </div>
            <div>
              <label>Price (per item)</label>
              <Input type="number" min="0" value={manualItem.price} onChange={(e) => handleManualItemChange("price", e.target.value)} placeholder="e.g., 1000" />
            </div>
            <div>
              <label>Quantity</label>
              <Input type="number" min="1" value={manualItem.quantity} onChange={(e) => handleManualItemChange("quantity", e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsManualAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleManualAdd}>Add Item to Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingSystem;