// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Lock, User, Timer } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";

// const AdminLogin = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [credentials, setCredentials] = useState({ username: "", password: "" });
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   // Rate Limiting States
//   const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
//   const [isLocked, setIsLocked] = useState(false);
//   const [countdown, setCountdown] = useState(0);

//   // Timer logic
//     useEffect(() => {
//         let timer: NodeJS.Timeout;
//         if (isLocked && countdown > 0) {
//             timer = setTimeout(() => {
//                 setCountdown(countdown - 1);
//             }, 1000);
//         } else if (countdown === 0 && isLocked) {
//             setIsLocked(false);
//             setAttemptsLeft(null); // Reset attempts message when timer ends
//         }
//         return () => clearTimeout(timer);
//     }, [isLocked, countdown]);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if(isLocked) return;
//     try {
//       const { data } = await axios.post(
//         `${API_URL}/api/admin/login`,
//         credentials
//       );
//       localStorage.setItem("adminInfo", JSON.stringify(data));
//       toast({
//         title: "Login Successful",
//         description: "Welcome to Admin Dashboard",
//         className: "bg-primary text-primary-foreground border-primary",
//       });
//       navigate("/admin/dashboard");
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Login Failed",
//         description: "Invalid username or password",
//         className: "bg-destructive text-destructive-foreground border-destructive",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
//             <Lock className="h-6 w-6 text-primary-foreground" />
//           </div>
//           <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
//           <p className="text-muted-foreground">Access your admin dashboard</p>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="space-y-2">
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//                 <Input
//                   type="text"
//                   placeholder="Username"
//                   value={credentials.username}
//                   onChange={(e) => setCredentials({...credentials, username: e.target.value})}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//                 <Input
//                   type="password"
//                   placeholder="Password"
//                   value={credentials.password}
//                   onChange={(e) => setCredentials({...credentials, password: e.target.value})}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>
//             <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
//               Sign In
//             </Button>
//           </form>
//           <div className="mt-4 text-center text-sm text-muted-foreground">
//             Go to Home Page?{" "}
//             <Button
//               variant="link"
//               className="p-0 text-primary hover:underline"
//               onClick={() => navigate("/")}
//             >
//               Click Here
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AdminLogin;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock, User, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Rate limiting states
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Timer logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLocked && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isLocked) {
      setIsLocked(false);
      setAttemptsLeft(null);
    }
    return () => clearTimeout(timer);
  }, [isLocked, countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    try {
      const { data } = await axios.post(
        `${API_URL}/api/admin/login`,
        credentials
      );
      localStorage.setItem("adminInfo", JSON.stringify(data));
      toast({
        title: "Login Successful",
        description: "Welcome to Admin Dashboard",
        className: "bg-primary text-primary-foreground",
      });
      navigate("/admin/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { headers, data } = error.response;

        // ⚡ Axios headers are lowercase
        const remaining = headers["ratelimit-remaining"];
        const resetTime = headers["ratelimit-reset"];

        if (remaining !== undefined) {
          setAttemptsLeft(Number(remaining) || 0);
        }

        if (remaining === "0" && resetTime) {
          setIsLocked(true);

          const resetVal = Number(resetTime);

          // If reset time looks like epoch timestamp
          if (resetVal > 1000000000) {
            const resetTimestamp = resetVal * 1000;
            const now = Date.now();
            const timeLeft = Math.round((resetTimestamp - now) / 1000);
            setCountdown(timeLeft > 0 ? timeLeft : 0);
          } else {
            // Else assume reset time is in seconds
            setCountdown(resetVal > 0 ? resetVal : 0);
          }
        }

        let errorMessage = "Invalid username or password.";

        if (
          typeof data === "string" &&
          data.includes("Too many login attempts")
        ) {
          errorMessage = data;
        } else if (
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message: unknown }).message === "string"
        ) {
          errorMessage = (data as { message: string }).message;
        }

        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorMessage,
        });
      } else {
        toast({
          variant: "destructive",
          title: "An Error Occurred",
          description: "Please try again later.",
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <p className="text-muted-foreground">Access your admin dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="pl-10"
                required
                disabled={isLocked}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="pl-10"
                required
                disabled={isLocked}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLocked}
            >
              {isLocked ? `Locked (${formatTime(countdown)})` : "Sign In"}
            </Button>
          </form>

          {/* Status Messages */}
          <div className="mt-2 text-center text-sm font-medium h-2">
            {isLocked && countdown > 0 && (
              <p className="text-destructive flex items-center justify-center gap-2">
                <Timer className="h-4 w-4" />
                Too many attempts. Please wait {formatTime(countdown)}.
              </p>
            )}
            {!isLocked && attemptsLeft !== null && (
              <p
                className={
                  attemptsLeft === 0 ? "text-red-600" : "text-amber-600"
                }
              >
                You have {attemptsLeft}{" "}
                {attemptsLeft === 1 ? "attempt" : "attempts"} remaining.
              </p>
            )}
          </div>

          <div className=" mt-2 text-center text-sm text-muted-foreground">
            <Button
              variant="link"
              className="p-0 text-primary hover:underline"
              onClick={() => navigate("/")}
            >
              Go to Home Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
