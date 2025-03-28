
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentOptions {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: any) => void;
}

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const payWithRazorpay = async (options: PaymentOptions) => {
    if (!user) {
      toast.error("You must be logged in to make a payment");
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, this would create a payment intent on the server
      // and open the Razorpay payment modal with proper order ID etc.
      
      // For now, we'll just simulate a successful payment after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPaymentId = `rzp_${Math.random().toString(36).substring(2, 15)}`;
      
      if (options.onSuccess) {
        options.onSuccess(mockPaymentId);
      }
      
      return mockPaymentId;
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast.error("Payment failed. Please try again.");
      
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const payWithPaypal = async (options: PaymentOptions) => {
    if (!user) {
      toast.error("You must be logged in to make a payment");
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, this would create a PayPal payment and redirect
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPaymentId = `pp_${Math.random().toString(36).substring(2, 15)}`;
      
      if (options.onSuccess) {
        options.onSuccess(mockPaymentId);
      }
      
      return mockPaymentId;
    } catch (error) {
      console.error("PayPal payment error:", error);
      toast.error("Payment failed. Please try again.");
      
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createFreePayment = async (options: { 
    description: string; 
    metadata?: Record<string, any>;
  }) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    
    // For free sessions, we just generate a mock payment ID
    return `free_${Math.random().toString(36).substring(2, 15)}`;
  };

  return {
    payWithRazorpay,
    payWithPaypal,
    createFreePayment,
    isLoading
  };
}
