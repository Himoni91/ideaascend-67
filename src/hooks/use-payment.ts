
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentOptions {
  amount: number;
  currency?: string;
  description: string;
  metadata?: Record<string, any>;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
}

export function usePayment() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate Razorpay order ID from our backend
  const generateRazorpayOrder = async ({ amount, currency = 'INR', description, metadata }: PaymentOptions) => {
    if (!user) throw new Error("User must be logged in");
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount,
          currency,
          description,
          metadata: {
            user_id: user.id,
            ...metadata
          }
        }
      });
      
      if (error) throw error;
      
      return data.order_id;
    } catch (err: any) {
      setError(err);
      toast.error(`Failed to create payment: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Process Razorpay payment
  const payWithRazorpay = async (options: PaymentOptions) => {
    if (!user) throw new Error("User must be logged in");
    if (typeof window === 'undefined') return;
    
    try {
      setIsLoading(true);
      
      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      
      // Generate order ID
      const orderId = await generateRazorpayOrder(options);
      
      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay({
        key: 'rzp_test_YourTestKey', // This should come from environment or context
        amount: options.amount * 100, // Razorpay takes amount in paisa
        currency: options.currency || 'INR',
        name: 'Idolyst',
        description: options.description,
        order_id: orderId,
        handler: function(response: any) {
          if (options.onSuccess) {
            options.onSuccess(response.razorpay_payment_id);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name,
          email: user.email
        },
        theme: {
          color: '#6366F1'
        }
      });
      
      razorpay.open();
    } catch (err: any) {
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
      toast.error(`Payment failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Process PayPal payment
  const payWithPaypal = async (options: PaymentOptions) => {
    if (!user) throw new Error("User must be logged in");
    if (typeof window === 'undefined') return;
    
    try {
      setIsLoading(true);
      
      // Load PayPal script if not already loaded
      if (!(window as any).paypal) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=test&currency=${options.currency || 'USD'}`;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      
      // Create a temporary PayPal button container
      const container = document.createElement('div');
      container.style.display = 'none';
      document.body.appendChild(container);
      
      // Render the PayPal button
      (window as any).paypal.Buttons({
        createOrder: async () => {
          // Call your backend to create an order
          const { data, error } = await supabase.functions.invoke("create-paypal-order", {
            body: {
              amount: options.amount,
              currency: options.currency || 'USD',
              description: options.description,
              metadata: {
                user_id: user.id,
                ...options.metadata
              }
            }
          });
          
          if (error) throw error;
          return data.order_id;
        },
        onApprove: async (data: any) => {
          // Call your backend to capture the order
          const { data: captureData, error } = await supabase.functions.invoke("capture-paypal-order", {
            body: {
              order_id: data.orderID
            }
          });
          
          if (error) throw error;
          
          if (options.onSuccess) {
            options.onSuccess(captureData.capture_id);
          }
          
          // Clean up
          document.body.removeChild(container);
        },
        onError: (err: any) => {
          if (options.onError) {
            options.onError(err);
          }
          toast.error(`Payment failed`);
          
          // Clean up
          document.body.removeChild(container);
        }
      }).render(container);
      
      // Programmatically click the PayPal button
      const button = container.querySelector('button');
      if (button) button.click();
    } catch (err: any) {
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
      toast.error(`Payment failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a free payment for $0 sessions
  const createFreePayment = async (options: PaymentOptions) => {
    if (!user) throw new Error("User must be logged in");
    
    try {
      setIsLoading(true);
      
      // For free payments, we just generate a unique ID
      const paymentId = `free_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      if (options.onSuccess) {
        options.onSuccess(paymentId);
      }
      
      return paymentId;
    } catch (err: any) {
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
      toast.error(`Failed to process free session: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    payWithRazorpay,
    payWithPaypal,
    createFreePayment,
    isLoading,
    error
  };
}
