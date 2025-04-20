
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PaymentDetails {
  productName: string;
  amount: number;
}

export const usePayment = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentDetails | null>(null);
  const { toast } = useToast();

  const initiatePayment = (details: PaymentDetails) => {
    setCurrentPayment(details);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handlePaymentComplete = () => {
    // This function can be extended to handle database operations
    // or other post-payment actions
    toast({
      title: "Purchase Complete",
      description: `Thank you for purchasing ${currentPayment?.productName}!`,
    });
  };

  return {
    isPaymentModalOpen,
    currentPayment,
    initiatePayment,
    closePaymentModal,
    handlePaymentComplete,
  };
};
