import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Filter, X, IndianRupee, ShoppingBag, CalendarDays, AlertTriangle } from "lucide-react";
import OrderDetails from "./OrderDetails";

// Interfaces
interface IOrderItem {
  productName: string;
  quantity: number;
  size: string;
  price: number;
  _id: string;
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const AllOrders = () => {
  const { user: adminUser } = useAuth();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // --- Reset Confirmation Dialog ---
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Available years derived from order data
  const availableYears = useMemo(() => {
    const years = new Set(orders.map((o) => new Date(o.createdAt).getFullYear().toString()));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [orders]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (adminUser?.token) {
        try {
          const config = { headers: { Authorization: `Bearer ${adminUser.token}` } };
          const { data } = await axios.get(`${API_URL}/api/orders`, config);
          const sorted = data.sort(
            (a: IOrder, b: IOrder) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sorted);
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
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${adminUser?.token}` } };
      await axios.delete(`${API_URL}/api/orders/${orderId}`, config);
      setOrders(orders.filter((order) => order._id !== orderId));
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete the order. Please try again.");
    }
  };

  const handleResetOrders = async () => {
    if (resetConfirmText !== "DELETE") return;
    setIsResetting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${adminUser?.token}` } };
      await axios.delete(`${API_URL}/api/orders/reset`, config);
      setOrders([]);
      setIsResetDialogOpen(false);
      setResetConfirmText("");
    } catch (error) {
      console.error("Failed to reset orders:", error);
      alert("Failed to reset orders. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setSelectedYear("");
  };

  // --- Client-side filtering ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      // Search filter
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerPhone.includes(search) ||
        order.orderId.toLowerCase().includes(search);

      // From date filter
      const matchesFrom = !fromDate || orderDate >= new Date(fromDate);

      // To date filter — include the entire "to" day
      const toDateEnd = toDate ? new Date(new Date(toDate).setHours(23, 59, 59, 999)) : null;
      const matchesTo = !toDate || orderDate <= toDateEnd!;

      // Month filter
      const matchesMonth =
        !selectedMonth || orderDate.getMonth() === parseInt(selectedMonth);

      // Year filter
      const matchesYear =
        !selectedYear || orderDate.getFullYear().toString() === selectedYear;

      return matchesSearch && matchesFrom && matchesTo && matchesMonth && matchesYear;
    });
  }, [orders, searchTerm, fromDate, toDate, selectedMonth, selectedYear]);

  // --- Summary Stats ---
  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0),
    [filteredOrders]
  );

  const activeFiltersCount = [fromDate, toDate, selectedMonth, selectedYear].filter(Boolean).length;

  if (loading) return <p className="p-6">Loading all orders...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h1 className="text-3xl font-bold">All Customer Orders</h1>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            className="relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={resetFilters} className="text-sm text-muted-foreground">
              <X className="h-4 w-4 mr-1" /> Clear Filters
            </Button>
          )}
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => { setResetConfirmText(""); setIsResetDialogOpen(true); }}
          >
            Reset All Orders
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search by Name, Phone, or Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* From Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">From Date</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">To Date</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Months</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3 shadow-sm">
          <div className="bg-blue-100 p-2 rounded-full">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Showing Orders</p>
            <p className="text-2xl font-bold">{filteredOrders.length}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3 shadow-sm">
          <div className="bg-green-100 p-2 rounded-full">
            <IndianRupee className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3 shadow-sm">
          <div className="bg-purple-100 p-2 rounded-full">
            <CalendarDays className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Orders (All Time)</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-600">Order ID</th>
              <th className="p-3 text-left font-semibold text-gray-600">Customer</th>
              <th className="p-3 text-left font-semibold text-gray-600">Phone</th>
              <th className="p-3 text-left font-semibold text-gray-600">Date</th>
              <th className="p-3 text-right font-semibold text-gray-600">Amount</th>
              <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No orders found matching your filters.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{order.orderId}</td>
                  <td className="p-3 font-semibold">{order.customerName}</td>
                  <td className="p-3 text-sm text-gray-600">{order.customerPhone}</td>
                  <td className="p-3 text-sm">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3 text-right font-semibold text-green-700">
                    ₹{order.totalPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="p-2 text-center flex gap-2 justify-center items-center">
                    <Button
                      className="bg-gray-500 hover:bg-secondary"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
          {selectedOrder && <OrderDetails orderId={selectedOrder._id} />}
        </DialogContent>
      </Dialog>

      {/* ⚠️ Reset Confirmation Dialog */}
      <Dialog
        open={isResetDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isResetting) {
            setIsResetDialogOpen(isOpen);
            setResetConfirmText("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Reset All Orders
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 space-y-1">
              <p className="font-bold">⚠️ Yeh action permanent hai!</p>
              <p>• Saare orders permanently delete ho jaenge</p>
              <p>• Order ID counter reset ho jaayega</p>
              <p>• Yeh data recover <strong>nahi</strong> ho sakta</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm karne ke liye niche{" "}
                <span className="font-bold text-red-600 bg-red-50 px-1 rounded">DELETE</span>{" "}
                type karein:
              </label>
              <Input
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                placeholder="DELETE likhein..."
                className={`font-mono tracking-widest ${
                  resetConfirmText === "DELETE"
                    ? "border-green-500 focus-visible:ring-green-500"
                    : "border-red-200"
                }`}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setIsResetDialogOpen(false); setResetConfirmText(""); }}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 disabled:opacity-40"
              onClick={handleResetOrders}
              disabled={resetConfirmText !== "DELETE" || isResetting}
            >
              {isResetting ? "Deleting..." : "Haan, Sab Delete Karo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrders;