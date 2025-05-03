
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PaymentModal from '@/components/PaymentModal';

interface EnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: any;
}

const EnrollmentDialog = ({ isOpen, onClose, classItem }: EnrollmentDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { toast } = useToast();
  
  if (!classItem) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open payment modal
    setIsPaymentModalOpen(true);
  };
  
  const handlePaymentComplete = async () => {
    setLoading(true);
    
    try {
      // Save enrollment to database
      const { data, error } = await supabase
        .from('class_enrollments')
        .insert({
          class_id: classItem.id,
          class_title: classItem.title,
          class_date: classItem.date,
          amount_paid: classItem.price,
          student_name: formData.name,
          student_email: formData.email,
          student_phone: formData.phone,
          student_address: formData.address
        });
      
      if (error) throw error;
      
      toast({
        title: "Enrollment Successful!",
        description: `You've been enrolled for ${classItem.title}. Check your email for details.`
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll for Class</DialogTitle>
            <DialogDescription>
              Fill out this form to enroll for "{classItem.title}" on {new Date(classItem.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Class Fee:</span>
                <span className="font-semibold text-academy-red">₹{classItem.price}</span>
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Proceed to Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <PaymentModal 
        open={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        amount={classItem?.price || 0}
        productName={classItem?.title || ""}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
};

export default EnrollmentDialog;
