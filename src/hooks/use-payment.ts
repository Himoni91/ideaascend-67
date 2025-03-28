
import { useState } from "react";
import { toast } from "sonner";
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

  // Mock payment function - returns successful payment for all providers
  const mockPayment = async (options: PaymentOptions, provider: string) => {
    if (!user) {
      toast.error("You must be logged in to make a payment");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate a brief delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPaymentId = `${provider}_${Math.random().toString(36).substring(2, 15)}`;
      
      toast.success("Payment successful! (Development mode)");
      
      if (options.onSuccess) {
        options.onSuccess(mockPaymentId);
      }
      
      return mockPaymentId;
    } catch (error) {
      console.error(`${provider} payment error:`, error);
      toast.error("Payment failed. Please try again.");
      
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const payWithRazorpay = async (options: PaymentOptions) => {
    return mockPayment(options, 'rzp');
  };

  const payWithPaypal = async (options: PaymentOptions) => {
    return mockPayment(options, 'pp');
  };

  const createFreePayment = async (options: { 
    description: string; 
    metadata?: Record<string, any>;
  }) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    
    return `free_${Math.random().toString(36).substring(2, 15)}`;
  };

  return {
    payWithRazorpay,
    payWithPaypal,
    createFreePayment,
    isLoading
  };
}
