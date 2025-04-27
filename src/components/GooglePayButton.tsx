
import React from 'react';
import { Button } from './ui/button';

interface GooglePayButtonProps {
  amount: number;
  productName: string;
}

const GooglePayButton = ({ amount, productName }: GooglePayButtonProps) => {
  const handlePayment = () => {
    // Format the UPI deep link
    const upiLink = `upi://pay?pa=9049137731@upi&pn=AvishkarAcademy&am=${amount}&cu=INR&tn=${encodeURIComponent(productName)}`;
    
    // Open the UPI link
    window.location.href = upiLink;
  };

  return (
    <Button 
      onClick={handlePayment}
      className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
    >
      Pay with Google Pay
    </Button>
  );
};

export default GooglePayButton;
