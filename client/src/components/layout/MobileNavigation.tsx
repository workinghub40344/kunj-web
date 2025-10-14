import { Link, useLocation } from "react-router-dom";
import { Home, Package, ShoppingCart, Info, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";

const MobileNavigation = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Products", path: "/products", icon: Package },
    { name: "Accessories", path: "/Accessories", icon: Gem },
    { name: "Cart", path: "/cart", icon: ShoppingCart, hasCount: true },
    { name: "About", path: "/about", icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`mobile-nav-item flex-1 relative ${
                isActive(item.path) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative flex justify-center">
                <IconComponent className="h-5 w-5" />
                {item.hasCount && getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-3 h-4 w-4 flex items-center justify-center text-xs bg-primary text-primary-foreground p-0">
                    {getTotalItems()}
                  </Badge>
                )}
              </div>
              <span className="mt-1 text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;