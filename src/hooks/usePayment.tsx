
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface PaymentDetails {
  productId: string;
  productName: string;
  amount: number;
}

export const usePayment = () => {
  const [currentPayment, setCurrentPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const initiatePayment = (details: PaymentDetails) => {
    setCurrentPayment(details);
    setLoading(true);
    
    console.log(`Payment initiated for ${details.productName}: $${details.amount}`);
    
    // Redirect to the checkout page with the product ID
    navigate(`/checkout/${details.productId}`);
  };

  const handlePaymentComplete = (productId: string) => {
    setLoading(false);
    setCurrentPayment(null);
    
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
      duration: 5000,
    });
    
    // Navigate to the material access page
    navigate(`/material/${productId}/access`, { 
      state: { 
        purchaseSuccess: true,
        productName: currentPayment?.productName 
      } 
    });
  };

  return {
    currentPayment,
    loading,
    initiatePayment,
    handlePaymentComplete,
  };
};
