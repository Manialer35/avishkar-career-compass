import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { usePurchaseFlow } from '@/hooks/usePurchaseFlow';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PurchaseFlowWrapperProps {
  materialId: string;
  materialTitle: string;
  price: number;
  className?: string;
}

const PurchaseFlowWrapper: React.FC<PurchaseFlowWrapperProps> = ({
  materialId,
  materialTitle,
  price,
  className = ''
}) => {
  const { loading, initiatePurchase } = usePurchaseFlow();

  const handlePurchase = async () => {
    await initiatePurchase({
      materialId,
      materialTitle,
      price
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <LoadingSpinner text="Initiating purchase..." />
      </div>
    );
  }

  return (
    <Button 
      onClick={handlePurchase}
      className={`w-full ${className}`}
      size="lg"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Purchase for ₹{price}
    </Button>
  );
};

export default PurchaseFlowWrapper;