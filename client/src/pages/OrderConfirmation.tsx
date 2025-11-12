import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, MessageCircle } from "lucide-react"; // MessageCircle icon add kiya
import { Button } from "@/components/ui/button"; // Button component import karein

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Cart page se bheja gaya WhatsApp URL yahan receive hoga
  const whatsappUrl = location.state?.url;

  useEffect(() => {
    // 1. Page load hote hi sabse upar scroll karein
    window.scrollTo(0, 0);

    if (!whatsappUrl) {
      navigate("/");
      return;
    }

    // 2. 3 Second delay, phir redirect
    const timer = setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 3000);

    return () => clearTimeout(timer);
  }, [whatsappUrl, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-white">
      <div className="space-y-6 animate-in fade-in zoom-in duration-500 max-w-md w-full">
        
        {/* Success Icon */}
        <div className="mx-auto bg-green-100 p-4 rounded-full w-fit">
            <CheckCircle className="w-16 h-16 text-green-600" />
        </div>

        <div>
            <h1 className="text-2xl font-bold text-gray-800">Order Saved Successfully!</h1>
            <p className="text-gray-500 mt-2">Please wait while we redirect you to WhatsApp...</p>
        </div>

        {/* Loader Animation */}
        <div className="flex items-center justify-center gap-2 text-primary bg-primary/10 py-3 px-6 rounded-full w-fit mx-auto border border-primary/20">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Redirecting in 3 seconds...</span>
        </div>

        <div className="text-xs text-red-500 mt-8 bg-red-50 p-3 rounded border border-red-100">
          ⚠️ Please do not close this window or press back button.
        </div>
        
        {/* 3. Backup Button (Visible Button) */}
        <div className="mt-8 pt-4 border-t">
            <p className="text-sm text-gray-400 mb-3">
                If WhatsApp doesn't open automatically:
            </p>
            <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg shadow-md"
                onClick={() => window.location.href = whatsappUrl}
            >
                <MessageCircle className="mr-2 h-6 w-6" />
                Click here to Open WhatsApp
            </Button>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;