
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentOptions {
  amount: number;
  currency?: string;
  description: string;
  metadata?: Record<string, any>;
  onSuccess?: (paymentId: string) => Promise<void> | void;
  onError?: (error: any) => void;
}

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);

  const createPaymentOrder = async (provider: string, options: PaymentOptions) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("payment-integration", {
        body: {
          provider,
          amount: options.amount,
          currency: options.currency || "INR",
          description: options.description,
          metadata: options.metadata || {}
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Payment error:", error);
      if (options.onError) options.onError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const payWithRazorpay = async (options: PaymentOptions) => {
    try {
      const data = await createPaymentOrder("razorpay", options);
      
      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      // Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: options.amount * 100, // paise
        currency: options.currency || "INR",
        name: "Idolyst",
        description: options.description,
        order_id: data.order_id,
        handler: async function (response: any) {
          // Payment successful
          const paymentId = response.razorpay_payment_id;
          if (options.onSuccess) await options.onSuccess(paymentId);
        },
        prefill: {
          name: "User",
          email: "user@example.com"
        },
        theme: {
          color: "#7c3aed"
        },
        modal: {
          ondismiss: function() {
            toast.error("Payment cancelled");
          }
        }
      });
      
      rzp.open();
      return data;
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast.error("Payment processing failed. Please try again.");
      if (options.onError) options.onError(error);
      throw error;
    }
  };

  const payWithPaypal = async (options: PaymentOptions) => {
    try {
      const data = await createPaymentOrder("paypal", options);
      
      // Open PayPal in a new window
      const paypalWindow = window.open(data.approval_url, "_blank");
      
      // If window is blocked, provide a manual link
      if (!paypalWindow) {
        toast("Please click the link to complete payment", {
          action: {
            label: "Open PayPal",
            onClick: () => window.open(data.approval_url, "_blank")
          }
        });
      }
      
      // We would need a webhook or callback to handle the success case
      // For now, we'll assume it's handled separately
      
      return data;
    } catch (error) {
      console.error("PayPal payment error:", error);
      toast.error("Payment processing failed. Please try again.");
      if (options.onError) options.onError(error);
      throw error;
    }
  };

  const createFreePayment = async (options: PaymentOptions) => {
    try {
      const data = await createPaymentOrder("free", options);
      if (options.onSuccess) await options.onSuccess(data.payment_id);
      return data.payment_id;
    } catch (error) {
      console.error("Free payment error:", error);
      if (options.onError) options.onError(error);
      throw error;
    }
  };

  return {
    isLoading,
    payWithRazorpay,
    payWithPaypal,
    createFreePayment
  };
}
