// src/context/CartContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  size: string;
  sizeType: string;
  quantity: number;
  price: number;
  image: string;
  customization?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (newItem: Omit<CartItem, "id">) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.productId === newItem.productId &&
          item.size === newItem.size &&
          item.customization === newItem.customization
      );

      if (existingItem) {
        toast({
          title: "Cart Updated",
          description: `${newItem.productName} quantity updated in cart.`,
        });
        return prev.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        const cartItem: CartItem = {
          ...newItem,
          id: Date.now().toString() + Math.random().toString(36),
        };

        toast({
          title: "Added to Cart",
          description: `${newItem.productName} has been added to your cart.`,
        });

        return [...prev, cartItem];
      }
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart.",
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        getTotalItems,
        getTotalPrice,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
