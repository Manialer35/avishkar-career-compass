
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PaymentModal from '@/components/PaymentModal';

interface EnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  classTitle: string;
  classDate: string;
  classId: string;
  classAmount: number;
}

const EnrollmentDialog = ({
  open,
  onClose,
  classTitle,
  classDate,
  classId,
  classAmount
}: EnrollmentDialogProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (classAmount > 0) {
      // For paid classes, show payment dialog
      setShowPayment(true);
    } else {
      // For free classes, register directly
      await completeRegistration();
    }
  };
  
  const completeRegistration = async (paymentId?: string) => {
    try {
      setLoading(true);
      
      const enrollment = {
        student_name: name,
        student_email: email,
        student_phone: phone,
        student_address: address,
        class_title: classTitle,
        class_date: classDate,
        class_id: classId,
        amount_paid: classAmount,
        payment_status: paymentId ? 'completed' : 'waived',
        payment_id: paymentId
      };
      
      // Record both in class_enrollments for enrolled students
      const { error: enrollmentError } = await supabase
        .from('class_enrollments')
        .insert(enrollment);
      
      if (enrollmentError) throw enrollmentError;
      
      // Also record in class_registrations for tracking
      const { error: registrationError } = await supabase
        .from('class_registrations')
        .insert({
          student_name: name,
          student_email: email,
          student_phone: phone,
          student_address: address,
          class_title: classTitle,
          class_date: classDate,
          class_id: classId
        });
      
      if (registrationError) throw registrationError;
      
      toast({
        title: "Success!",
        description: `You have successfully enrolled in ${classTitle}`,
      });
      
      onClose();
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
    } catch (error: any) {
      console.error('Error submitting enrollment:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePaymentComplete = () => {
    // Generate a mock payment ID for demo purposes
    const mockPaymentId = `pay_${Date.now()}`;
    completeRegistration(mockPaymentId);
  };

  return (
    <>
      <Dialog open={open && !showPayment} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Enroll in {classTitle}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                rows={2}
              />
            </div>
            
            <div className="pt-2 flex justify-between">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Processing...' : classAmount > 0 ? 'Proceed to Payment' : 'Enroll Now'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        amount={classAmount}
        productName={classTitle}
        onPaymentComplete={handlePaymentComplete}
        customerDetails={{
          name,
          email,
          phone
        }}
      />
    </>
  );
};

export default EnrollmentDialog;
