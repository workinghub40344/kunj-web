import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import axios from "axios";
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "@/context/AuthContext"; 

interface user {
  _id: string; name: string; email: string; profilePicture: string; isAdmin: boolean; token: string; phone?: string;
}

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
);

const Cart = () => {
  const { toast } = useToast();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { user, login } = useAuth();
  const [isuserModalOpen, setIsuserModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const subtotal = getTotalPrice();
  const total = subtotal;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast({ title: "Cart is empty", description: "Add some products to your cart first.", variant: "destructive" });
      return;
    }
    
    if (user) {
      setIsuserModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const res = await axios.post(`${API_URL}/api/users/google-login`, { token: idToken });

      if (res.data) {
        login(res.data);
        setCustomerPhone(res.data.phone || "");
        setIsLoginModalOpen(false);
        setIsuserModalOpen(true);
      }
    } catch (error) {
      console.error("Google login failed:", error);
      toast({ title: "Login Failed", description: "Could not log in with Google. Please try again.", variant: "destructive" });
    }
  };

  const handleConfirmOrder = async () => {
    if (!customerPhone.trim()) {
      toast({ title: "Phone Number Required", description: "Please enter your phone number.", variant: "destructive" });
      return;
    }

    if (!user) {
        toast({ title: "Login Required", description: "Something went wrong. Please log in again.", variant: "destructive" });
        return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const orderData = {
        customerName: user.name,
        customerPhone,
        orderItems: cartItems,
        totalPrice: total,
      };

      const { data: savedOrder } = await axios.post(`${API_URL}/api/orders/create`, orderData, config);

      const phoneNumber = "918504866930";
      let message = `Hello Kunj *_Creation_*, New Order Received!\n\n`;
      message += `*Order ID:* ${savedOrder.orderId}\n`;
      message += `*Customer Name:* ${orderData.customerName}\n`;
      message += `*Phone Number:* ${customerPhone}\n\n`;
      message += `--- *Order Details* ---\n`;
      cartItems.forEach((item, index) => {
        message += `*${index + 1}. ${item.productName}*\n`;
        message += `   *${item.sizeType} Size:* ${item.size}\n`;
        message += `   *Quantity:* ${item.quantity}\n`;
        if (item.customization) {
          message += `   *Customization:* _${item.customization}_\n`;
        }
        message += `-------------------------------\n`;
      });
      message += `*Total Amount:* ₹${total}\n`;

      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");

      toast({ title: "Order Saved & Redirecting!", description: "Your order has been saved successfully." });
      
      setIsuserModalOpen(false);
      clearCart();
      setCustomerPhone("");

    } catch (error) {
      console.error("Failed to save order", error);
      toast({ title: "Error", description: "Could not save your order. Please try again.", variant: "destructive" });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <a href="/products">Continue Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Shopping Cart
        </h1>
        <p className="text-muted-foreground">
          Review your items and proceed to checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{item.productName}</h3>
                        <Badge variant="secondary" className="mt-1">Krishna Poshak</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>{item.sizeType} Size:</strong> {item.size}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary text-lg">₹{item.price * item.quantity}</div>
                        <div className="text-sm text-muted-foreground">₹{item.price} each</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}items)</span>
                <span>₹{subtotal}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{total}</span>
              </div>
              <Button onClick={handlePlaceOrder} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                <MessageCircle className="mr-2 h-4 w-4" />
                Place Order via WhatsApp
              </Button>
              <div className="text-xs text-muted-foreground text-center">Your order details will be sent via WhatsApp for confirmation</div>
              <Separator />
              <Button variant="outline" className="w-full" asChild>
                <a href="/products">Continue Shopping</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isuserModalOpen} onOpenChange={setIsuserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Your Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Name</label>
              <Input value={user?.name || ''} className="col-span-3" readOnly disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right">Phone</label>
              <Input 
                id="phone" 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)} 
                className="col-span-3" 
                placeholder="Enter your phone number" 
                readOnly={!!user?.phone && user.phone !== ""}
                disabled={!!user?.phone && user.phone !== ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmOrder} className="w-full bg-primary hover:bg-primary/90">
              Confirm & Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">Login to Place Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-sm text-muted-foreground mb-4">Please login to continue your purchase.</p>
            <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
              <GoogleIcon /> Login with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;