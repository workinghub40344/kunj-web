// src/pages/Cart.tsx

import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";

const Cart = () => {
  const { toast } = useToast();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal > 2500 ? 0 : 150;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products to your cart first.",
        variant: "destructive",
      });
      return;
    }

    // Prepare WhatsApp message
    const phoneNumber = "918504866930"; // Replace with actual WhatsApp number
    let message = "Hello Kunj *_Creation_*, I want to purchase the following products:\n\n";
    
    cartItems.forEach((item, index) => {
  message += `*${index + 1}. ${item.productName}*\n`; // Product name bold
  message += `   *Size:* ${item.size}\n`;
  message += `   *Quantity:* ${item.quantity}\n`;
  if (item.customization) {
    message += `   *Customization:* _${item.customization}_\n`; // italic customization
  }
  message += `-------------------------------\n`;
});


    message += `  Order Summary:-\n`;
    message += `  Subtotal: ₹${subtotal}\n`;
    message += `  Total: ₹${total}\n\n`;
    

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    toast({
      title: "Order placed!",
      description: "Your order details have been sent via WhatsApp.",
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
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
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">Review your items and proceed to checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
        {cartItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Image */}
                <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{item.productName}</h3>
                      <Badge variant="secondary" className="mt-1">
                        Krishna Poshak
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Size: {item.size}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-bold text-primary text-lg">
                        ₹{item.price * item.quantity}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{item.price} each
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{subtotal}</span>
              </div>
              
              {/* <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>

              {shipping === 0 && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  🎉 You qualify for free shipping!
                </div>
              )} */}

              {/* {subtotal < 2500 && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                  Add ₹{2500 - subtotal} more to qualify for free shipping
                </div>
              )} */}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{total}</span>
              </div>

              <Button 
                onClick={handlePlaceOrder}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Place Order via WhatsApp
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                Your order details will be sent via WhatsApp for confirmation
              </div>

              {/* Continue Shopping */}
              <Separator />
              
              <Button variant="outline" className="w-full" asChild>
                <a href="/products">Continue Shopping</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;