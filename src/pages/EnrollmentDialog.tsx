
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GooglePayButton } from '@/components/PaymentComponents';

export interface EnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  classTitle: string;
  classDate: string;
  classId: string;
  price?: number; // Make price optional
}

const EnrollmentDialog: React.FC<EnrollmentDialogProps> = ({
  open,
  onClose,
  classTitle,
  classDate,
  classId,
  price = 0 // Default price to 0
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all the fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (price > 0) {
      // Show payment options if there's a price
      setShowPayment(true);
    } else {
      // Free enrollment
      processEnrollment();
    }
  };

  const processEnrollment = async (paymentId?: string) => {
    setSubmitting(true);
    
    try {
      // Add your enrollment logic here
      
      // Success toast
      toast({
        title: "Enrollment Successful!",
        description: `You have successfully enrolled for ${classTitle}${paymentId ? " and your payment was processed" : ""}`,
      });
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error during enrollment:', error);
      toast({
        title: "Enrollment Failed",
        description: "An error occurred during enrollment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    processEnrollment(`google-pay-${Date.now()}`);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enroll for Class</DialogTitle>
          <DialogDescription>
            Please fill in your details to enroll for {classTitle} on {classDate}
            {price > 0 && ` (₹${price})`}
          </DialogDescription>
        </DialogHeader>
        
        {!showPayment ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Processing...' : price > 0 ? 'Continue to Payment' : 'Enroll Now'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
              <h3 className="font-medium mb-2">Payment Details</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete your payment to enroll in {classTitle}.
              </p>
              <div className="font-bold text-lg mb-4">Total: ₹{price}</div>
              
              <GooglePayButton
                productId={classId}
                productName={classTitle}
                price={price || 0}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPayment(false)}>
                Back
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;
