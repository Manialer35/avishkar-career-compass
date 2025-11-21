
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GooglePayButton } from '@/components/PaymentComponents';
import { validateEmail, validatePhone, validateName, sanitizeInput, RateLimiter } from '@/utils/inputValidation';
import { useAuth } from "@/context/AuthContext";

interface EnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  classTitle: string;
  classDate: string;
  classId: string;
  classAmount: number;
}

// Rate limiter for enrollment attempts
const enrollmentRateLimiter = new RateLimiter(3, 300000); // 3 attempts per 5 minutes

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
  const [paymentStep, setPaymentStep] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error!;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error!;
    }
    
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error!;
    }
    
    // Verify email matches authenticated user (if logged in)
    if (user && user.email !== email) {
      errors.email = "Email must match your account email";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const rateLimitKey = user?.uid || email;
    if (!enrollmentRateLimiter.isAllowed(rateLimitKey)) {
      toast({
        title: "Too Many Attempts",
        description: "Please wait before trying again",
        variant: "destructive",
      });
      return;
    }
    
    // Form validation
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    if (classAmount > 0) {
      // For paid classes, show payment form
      setPaymentStep(true);
    } else {
      // For free classes, register directly
      await completeRegistration();
    }
  };
  
  const completeRegistration = async (paymentId?: string) => {
    try {
      setLoading(true);
      
      // Sanitize all inputs
      const sanitizedData = {
        student_name: sanitizeInput(name),
        student_email: sanitizeInput(email),
        student_phone: sanitizeInput(phone),
        student_address: sanitizeInput(address),
        class_title: sanitizeInput(classTitle),
        class_date: classDate,
        class_id: sanitizeInput(classId),
        amount_paid: classAmount,
        payment_status: paymentId ? 'completed' : 'waived',
        payment_id: paymentId,
        payment_method: paymentId ? 'razorpay' : 'free'
      };
      
      // Additional security check: verify class exists and amount matches
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, class_price, is_active')
        .eq('id', classId)
        .single();
      
      if (classError || !classData) {
        throw new Error("Class not found or inactive");
      }
      
      if (Math.abs(classAmount - classData.class_price) > 0.01) {
        throw new Error("Price mismatch detected");
      }
      
      // Check for duplicate enrollments
      const { data: existingEnrollment, error: duplicateError } = await supabase
        .from('class_enrollments')
        .select('id')
        .eq('student_email', sanitizedData.student_email)
        .eq('class_id', classId)
        .maybeSingle();
      
      if (duplicateError) {
        console.error('Error checking duplicate enrollment:', duplicateError);
      }
      
      if (existingEnrollment) {
        throw new Error("You are already enrolled in this class");
      }
      
      // Record both in class_enrollments for enrolled students
      const { error: enrollmentError } = await supabase
        .from('class_enrollments')
        .insert(sanitizedData);
      
      if (enrollmentError) throw enrollmentError;
      
      // Also record in class_registrations for tracking
      const { error: registrationError } = await supabase
        .from('class_registrations')
        .insert({
          student_name: sanitizedData.student_name,
          student_email: sanitizedData.student_email,
          student_phone: sanitizedData.student_phone,
          student_address: sanitizedData.student_address,
          class_title: sanitizedData.class_title,
          class_date: sanitizedData.class_date,
          class_id: sanitizedData.class_id
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
      setValidationErrors({});
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
  
  const handleBackToInfo = () => {
    setPaymentStep(false);
  };

  const handlePaymentSuccess = () => {
    // Complete the registration with a payment ID using timestamp for uniqueness
    completeRegistration(`razorpay-${Date.now()}`);
  };

  const handlePaymentCancel = () => {
    setPaymentStep(false);
    toast({
      title: "Payment Cancelled",
      description: "You cancelled the payment process.",
      variant: "default",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {paymentStep ? `Payment for ${classTitle}` : `Enroll in ${classTitle}`}
          </DialogTitle>
        </DialogHeader>
        
        {!paymentStep ? (
          // Step 1: User information form
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
                className={validationErrors.name ? "border-red-500" : ""}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
              )}
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
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
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
                className={validationErrors.phone ? "border-red-500" : ""}
              />
              {validationErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
              )}
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
                maxLength={500}
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
        ) : (
          // Step 2: Payment form with Google Pay
          <div className="space-y-4 mt-4">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Amount: ₹{classAmount.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Please complete your payment using Google Pay to enroll in this class.
                </p>
                <GooglePayButton
                  productId={classId}
                  productName={classTitle}
                  price={classAmount}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </CardContent>
            </Card>
            
            <div className="pt-2 flex justify-between">
              <Button type="button" variant="outline" onClick={handleBackToInfo}>
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;
