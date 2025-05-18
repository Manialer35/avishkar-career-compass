import { useState } from 'react';

export interface PaymentDetails {
  productName: string;
  amount: number;
}

export const usePayment = () => {
  const [currentPayment, setCurrentPayment] = useState<PaymentDetails | null>(null);
  
  const initiatePayment = (details: PaymentDetails) => {
    setCurrentPayment(details);
    // Handle payment initiation directly here instead of opening a modal
    console.log(`Payment initiated for ${details.productName}: $${details.amount}`);
    // You can implement your direct payment processing logic here
  };

  const handlePaymentComplete = () => {
    // Payment completion logic
    console.log(`Payment completed for ${currentPayment?.productName}`);
    // Reset the current payment after processing
    setCurrentPayment(null);
  };

  return {
    currentPayment,
    initiatePayment,
    handlePaymentComplete,
  };
};
