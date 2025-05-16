import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Tag, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

// Sample enrollment form component for premium classes
const EnrollmentDialog = ({ isOpen, onClose, classItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'upi',
    agreeToTerms: false
  });
  
  const [step, setStep] = useState(1);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle payment method selection
  const handlePaymentMethodChange = (value) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      // Validate first step
      if (!formData.name || !formData.email || !formData.phone) {
        alert('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else {
      // Process payment and enrollment
      if (!formData.agreeToTerms) {
        alert('Please agree to the terms and conditions');
        return;
      }
      
      // Here you would typically handle the payment processing
      // For this example, we'll just simulate a successful enrollment
      alert('Enrollment successful! You will receive a confirmation email shortly.');
      onClose();
      setStep(1);
    }
  };
  
  // Reset form when dialog closes
  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      paymentMethod: 'upi',
      agreeToTerms: false
    });
    onClose();
  };
  
  if (!classItem) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Enroll in Class</span>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-semibold text-academy-primary">{classItem.title}</h3>
                <div className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {new Date(classItem.date).toLocaleDateString('en-IN', { 
                      day: 'numeric', month: 'short', year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {new Date(classItem.date).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit', hour12: true
                      })}
                    </span>
                  </div>
                  <span className="font-semibold text-academy-red">₹{classItem.price}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-semibold text-academy-primary">{classItem.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Course Fee</span>
                  <span className="font-semibold text-academy-red">₹{classItem.price}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">GST (18%)</span>
                  <span className="font-semibold text-gray-700">₹{Math.round(classItem.price * 0.18)}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-bold text-academy-red">₹{classItem.price + Math.round(classItem.price * 0.18)}</span>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Select Payment Method</Label>
                <RadioGroup 
                  value={formData.paymentMethod}
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi">UPI / Google Pay / PhonePe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Credit / Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Label htmlFor="netbanking">Net Banking</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="agreeToTerms" 
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreeToTerms: checked === true }))
                  }
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  I agree to the terms and conditions and refund policy
                </Label>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            {step === 2 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-academy-red hover:bg-academy-red/90"
            >
              {step === 1 ? "Continue to Payment" : "Make Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;
