import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  productId: string;
  productName: string;
}

// Simplified GooglePay-only payment button
const PaymentButton: React.FC<PaymentButtonProps> = ({ amount, currency = 'INR', productId, productName }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with the payment.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Redirecting to Google Pay checkout for:", productName, "with amount:", amount);
      
      // Redirect to checkout page that uses Google Pay
      navigate(`/checkout/${productId}`);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handlePayment} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Pay ₹{amount} {currency}
    </Button>
  );
};

interface DownloadButtonProps {
  materialId: string;
  downloadUrl: string;
  onDownloadComplete?: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ materialId, downloadUrl, onDownloadComplete }) => {
  const { toast } = useToast();

  const downloadMaterial = async (materialId: string) => {
    try {
      // Call the RPC function to increment the download count
      const { data, error } = await supabase.rpc('increment_material_downloads', { 
        material_id: materialId 
      });
      
      if (error) {
        console.error('Error incrementing download count:', error);
      } else {
        console.log('New download count:', data);
      }
      
      // Create a temporary link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'filename.pdf'); // or any other extension
      document.body.appendChild(link);
  
      // Programmatically click the link to trigger the download
      link.click();
  
      // Clean up the temporary link
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your download will begin shortly.",
      });

      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch (error) {
      console.error('Error downloading material:', error);
      toast({
        title: "Download Error",
        description: "Failed to initiate the download. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={() => downloadMaterial(materialId)}>
      Download Now
    </Button>
  );
};

// Updated GooglePayButton with Payment Success Handler
export const GooglePayButton: React.FC<{
  productId: string;
  productName: string;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ productId, productName, price, onSuccess, onCancel }) => {
  // Import the real GooglePayButton component
  const RealGooglePayButton = React.lazy(() => import('./GooglePayButton'));
  
  return (
    <React.Suspense fallback={
      <Button 
        disabled
        className="w-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center gap-2 py-3"
      >
        <span>Loading Payment...</span>
      </Button>
    }>
      <RealGooglePayButton 
        productId={productId}
        productName={productName}
        price={price}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </React.Suspense>
  );
};

export const PaymentSummary: React.FC<{
  productName: string;
  price: number;
}> = ({ productName, price }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Product</span>
        <span>{productName}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Price</span>
        <span>₹{price.toFixed(2)}</span>
      </div>
      <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
        <span className="font-medium">Total</span>
        <span className="font-semibold">₹{price.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PaymentButton;
