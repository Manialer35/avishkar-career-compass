
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, CreditCard } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  productName: string;
  onPaymentComplete?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  open, 
  onClose, 
  amount, 
  productName,
  onPaymentComplete 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: "Payment Successful!",
        description: `Your payment of ₹${amount} for ${productName} was successful.`,
      });
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
      
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Your Payment</DialogTitle>
          <DialogDescription>
            Pay ₹{amount} for {productName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'phonepe' 
              ? 'border-accent border-2' 
              : 'hover:border-accent'}`}
            onClick={() => setSelectedMethod('phonepe')}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <Phone className="text-indigo-600 h-6 w-6" />
              </div>
              <span className="font-medium">PhonePe</span>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'razorpay' 
              ? 'border-accent border-2' 
              : 'hover:border-accent'}`}
            onClick={() => setSelectedMethod('razorpay')}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <CreditCard className="text-blue-600 h-6 w-6" />
              </div>
              <span className="font-medium">Razorpay</span>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose} className="btn-hover">
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={!selectedMethod || processing}
            className="btn-hover bg-accent hover:bg-accent/90"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
