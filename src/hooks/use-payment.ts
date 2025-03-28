
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { user } = useAuth();

  const payWithRazorpay = async ({
    amount,
    currency = 'INR',
    description,
    metadata,
    onSuccess,
    onError
  }: PaymentOptions) => {
    setIsLoading(true);

    try {
      // Call our Supabase Edge Function that handles payments
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount,
          currency,
          payment_method: 'razorpay',
          description,
          metadata: {
            ...metadata,
            user_id: user?.id
          }
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Payment processing failed');
      }
      
      const paymentId = data.data.id;
      
      if (onSuccess) {
        await onSuccess(paymentId);
      }
      
      return paymentId;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const payWithPaypal = async ({
    amount,
    currency = 'USD',
    description,
    metadata,
    onSuccess,
    onError
  }: PaymentOptions) => {
    setIsLoading(true);

    try {
      // Call our Supabase Edge Function that handles payments
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount,
          currency,
          payment_method: 'paypal',
          description,
          metadata: {
            ...metadata,
            user_id: user?.id
          }
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'Payment processing failed');
      }
      
      const paymentId = data.data.id;
      
      if (onSuccess) {
        await onSuccess(paymentId);
      }
      
      return paymentId;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createFreePayment = async (options: Omit<PaymentOptions, "amount" | "currency">) => {
    // For free payments, just generate a reference ID
    return `free_${Math.random().toString(36).substring(2, 15)}`;
  };

  return {
    payWithRazorpay,
    payWithPaypal,
    createFreePayment,
    isLoading
  };
}
