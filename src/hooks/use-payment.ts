
import { useState } from "react";
import { toast } from "sonner";

type PaymentProps = {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: any) => void;
};

type FreePaymentProps = {
  description: string;
  metadata?: Record<string, any>;
};

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);

  const payWithRazorpay = async ({
    amount,
    currency,
    description,
    metadata,
    onSuccess,
    onError,
  }: PaymentProps) => {
    setIsLoading(true);
    try {
      // For now we're just mocking successful payments
      // In a real implementation, this would integrate with Razorpay SDK
      console.log('Processing Razorpay payment:', { amount, currency, description, metadata });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock payment ID
      const paymentId = `rzp_${Math.random().toString(36).substring(2, 15)}`;
      
      // Call success callback
      if (onSuccess) {
        onSuccess(paymentId);
      }
      
      setIsLoading(false);
      return paymentId;
    } catch (error) {
      setIsLoading(false);
      console.error("Payment error:", error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };

  const payWithPaypal = async ({
    amount,
    currency,
    description,
    metadata,
    onSuccess,
    onError,
  }: PaymentProps) => {
    setIsLoading(true);
    try {
      // For now we're just mocking successful payments
      // In a real implementation, this would integrate with PayPal SDK
      console.log('Processing PayPal payment:', { amount, currency, description, metadata });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock payment ID
      const paymentId = `pp_${Math.random().toString(36).substring(2, 15)}`;
      
      // Call success callback
      if (onSuccess) {
        onSuccess(paymentId);
      }
      
      setIsLoading(false);
      return paymentId;
    } catch (error) {
      setIsLoading(false);
      console.error("Payment error:", error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };

  const createFreePayment = async ({ description, metadata }: FreePaymentProps) => {
    setIsLoading(true);
    try {
      console.log('Processing free session:', { description, metadata });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a mock free payment ID
      const paymentId = `free_${Math.random().toString(36).substring(2, 15)}`;
      
      setIsLoading(false);
      return paymentId;
    } catch (error) {
      setIsLoading(false);
      console.error("Free payment registration error:", error);
      throw error;
    }
  };

  return {
    payWithRazorpay,
    payWithPaypal,
    createFreePayment,
    isLoading
  };
}
