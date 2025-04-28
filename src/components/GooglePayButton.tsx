
import React from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface GooglePayButtonProps {
  amount: number;
  productName: string;
}

const GooglePayButton = ({ amount, productName }: GooglePayButtonProps) => {
  const { toast } = useToast();

  const handlePayment = () => {
    const options = {
      key: 'YOUR_RAZORPAY_KEY', // Replace with your Razorpay key
      amount: amount * 100, // Amount in paise
      name: 'Avishkar Academy',
      description: productName,
      handler: function(response: any) {
        toast({
          title: "Payment Successful!",
          description: `Payment ID: ${response.razorpay_payment_id}`,
        });
      },
      prefill: {
        name: 'Student Name',
        contact: '', // Student's phone number
      },
      modal: {
        ondismiss: function() {
          toast({
            title: "Payment Cancelled",
            description: "You closed the payment window",
            variant: "destructive"
          });
        }
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  return (
    <Button 
      onClick={handlePayment}
      className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
    >
      Pay with Razorpay
    </Button>
  );
};

export default GooglePayButton;
