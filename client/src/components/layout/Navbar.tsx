// import { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { ShoppingCart, Menu, X, Search } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useCart } from "@/context/CartContext";
// import logo from "@/assets/Logo-3.png";

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const location = useLocation();
//   const {
//     getTotalItems
//   } = useCart();
//   const navItems = [{
//     name: "Home",
//     path: "/"
//   }, {
//     name: "Products",
//     path: "/products"
//   }, {
//     name: "About",
//     path: "/about"
//   }, {
//     name: "Contact",
//     path: "/contact"
//   }];
//   const isActive = (path: string) => location.pathname === path;
//   return <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center ">
//             <img src={logo} alt="Kunj Creation" className="h-16 w-auto" />
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8">
//             {navItems.map(item => <Link key={item.name} to={item.path} className={`text-sm font-medium transition-colors hover:text-primary ${isActive(item.path) ? "text-primary" : "text-muted-foreground"}`}>
//                 {item.name}
//               </Link>)}
//           </div>

//           {/* Desktop Actions */}
//           <div className="hidden md:flex items-center space-x-4">
//             <Link to="/cart">
//               <Button variant="ghost" size="icon" className="relative">
//                 <ShoppingCart className="h-5 w-5" />
//                 {getTotalItems() > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-primary text-primary-foreground">
//                     {getTotalItems()}
//                   </Badge>}
//               </Button>
//             </Link>
//             <Link to="/admin">
//               <Button variant="outline" size="sm">
//                 Admin
//               </Button>
//             </Link>
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden flex items-center space-x-2">
//             <Link to="/cart">
//               <Button variant="ghost" size="icon" className="relative">
//                 <ShoppingCart className="h-5 w-5" />
//                 {getTotalItems() > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-primary text-primary-foreground">
//                     {getTotalItems()}
//                   </Badge>}
//               </Button>
//             </Link>
//             <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
//               {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//             </Button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && <div className="md:hidden py-4 border-t border-border">
//             <div className="flex flex-col space-y-2">
//               {navItems.map(item => <Link key={item.name} to={item.path} onClick={() => setIsMenuOpen(false)} className={`hidden px-4 py-2 text-sm font-medium transition-colors hover:bg-muted rounded-md ${isActive(item.path) ? "text-primary bg-muted" : "text-muted-foreground"}`}>
//                   {item.name}
//                 </Link>)}
//               <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md">
//                 Admin Panel
//               </Link>
//             </div>
//           </div>}
//       </div>
//     </nav>;
// };
// export default Navbar;

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import logo from "@/assets/Logo-3.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator"; // Separator import ko theek kiya

// Dialog ke liye naye imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Firebase/Axios imports
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  isAdmin: boolean;
  token: string;
}

// Google Icon ka SVG
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    navigate("/");
  };

  // Google Login ka poora logic Navbar mein hi add kar diya
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await axios.post(`${API_URL}/api/users/google-login`, {
        token: idToken,
      });

      if (res.data) {
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        setUserInfo(res.data);
        toast({
          title: "Login Successful!",
          description: `Welcome, ${user.displayName}`,
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Google login failed:", error);
      toast({
        title: "Login Failed",
        description: "Could not log in. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Kunj Creation" className="h-16 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 ...">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>

            {userInfo ? (
              <>
                {userInfo.isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={userInfo.profilePicture}
                          alt={userInfo.name}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback>
                          {userInfo.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <img 
                            src={userInfo.profilePicture} 
                            alt={userInfo.name}
                            className="h-16 w-16 rounded-full mr-2"
                          />
                        </div>
                        <p className="text-sm font-medium leading-none">
                          {userInfo.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          {userInfo.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex justify-center" onClick={handleLogout}>
                      <p className="bg-primary px-4 py-1 rounded-sm ">Log out</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">Login</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Login to Your Account
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Button
                      onClick={handleGoogleLogin}
                      variant="outline"
                      className="w-full"
                    >
                      <GoogleIcon /> Login with Google
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {/* ... Mobile cart icon ... */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 ...`}
                >
                  {item.name}
                </Link>
              ))}
              <Separator />
              {userInfo ? (
                <>
                  {userInfo.isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-2 ..."
                    >
                      Admin Panel
                    </Link>
                  )}
                  <div className="px-4 py-2">{userInfo.email}</div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start ..."
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Login</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Login to Your Account
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className="w-full"
                      >
                        <GoogleIcon /> Login with Google
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
