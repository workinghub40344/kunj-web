import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import logo from "@/assets/Logo-3.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { auth, googleProvider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface user {
  _id: string; name: string; email: string; profilePicture: string; isAdmin: boolean; token: string;
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

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;



  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const res = await axios.post(`${API_URL}/api/users/google-login`, { token: idToken });

      if (res.data) {
        login(res.data);
        toast({ title: "Login Successful!", description: `Welcome, ${user.displayName}` });
        window.location.reload();
      }
    } catch (error) {
      console.error("Google login failed:", error);
      toast({ title: "Login Failed", description: "Could not log in. Please try again.", variant: "destructive" });
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
              <Link key={item.name} to={item.path} className={`text-sm font-medium transition-colors hover:text-primary ${ isActive(item.path) ? "text-primary" : "text-muted-foreground" }`}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-primary text-primary-foreground">{getTotalItems()}</Badge>}
              </Button>
            </Link>
            {user ? (
              <>
                {!user.isAdmin && (<Link to="/my-orders"><Button variant="outline" size="sm">My Orders</Button></Link>)}
                {user.isAdmin && (<Link to="/admin"><Button variant="outline" size="sm">Admin</Button></Link>)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8  rounded-full">
                      <Avatar className="h-8 w-8"><AvatarImage src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center justify-center mb-2">
                        <img 
                          src={user.profilePicture} 
                          alt={user.name}
                          className="h-16 w-16 rounded-full mr-2"
                        />
                      </div>
                      <div className="flex flex-col space-y-1 text-center">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex justify-center bg-white"
                      onClick={handleLogout}>
                        <p className="bg-primary w-fit px-4 py-1 rounded-[2px] md:rounded-sm text-black">Log out</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Dialog>
                <DialogTrigger asChild><Button size="sm">Login</Button></DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                  <DialogHeader><DialogTitle className="text-center">Login to Your Account</DialogTitle></DialogHeader>
                  <div className="py-4"><Button onClick={handleGoogleLogin} variant="outline" className="w-full"><GoogleIcon /> Login with Google</Button></div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Mobile Actions (Updated) */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hidden md:inline-flex">
                <ShoppingCart className="h-5 w-5 hidden md:inline-flex" />
                {getTotalItems() > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-primary text-primary-foreground">{getTotalItems()}</Badge>}
              </Button>
            </Link>

            {user ? (
              <>
                {user.isAdmin && (<Link to="/admin"><Button variant="outline" size="sm">Admin</Button></Link>)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center justify-center mb-2">
                        <img 
                          src={user.profilePicture} 
                          alt={user.name}
                          className="h-16 w-16 rounded-full mr-2"
                        />
                      </div>
                      <div className="flex flex-col space-y-1 text-center">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex justify-center bg-white"
                      onClick={handleLogout}>
                        <p className="bg-primary w-fit px-4 py-1 rounded-[2px] md:rounded-sm text-black">Log out</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Dialog>
                <DialogTrigger asChild><Button size="sm">Login</Button></DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                  <DialogHeader><DialogTitle className="text-center">Login to Your Account</DialogTitle></DialogHeader>
                  <div className="py-4"><Button onClick={handleGoogleLogin} variant="outline" className="w-full"><GoogleIcon /> Login with Google</Button></div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;



