import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EnquiryForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let tempErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      tempErrors.phone = 'Phone number should be 10 digits';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      tempErrors.subject = 'Subject is required';
      isValid = false;
    }

    if (!formData.message.trim()) {
      tempErrors.message = 'Message is required';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        console.log("Submitting enquiry data:", formData);
        
        // Send the enquiry data to our Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('send-enquiry', {
          body: formData
        });
        
        console.log("Edge function response:", data, error);
        
        if (error) {
          throw new Error(error.message);
        }
        
        toast({
          title: "Enquiry Submitted Successfully",
          description: "Thank you for your enquiry. Our team will contact you shortly.",
          duration: 5000,
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } catch (error: any) {
        console.error("Error submitting enquiry:", error);
        
        toast({
          title: "Error",
          description: error.message || "Could not submit enquiry. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-academy-primary mb-4">Send an Enquiry</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name <span className="text-blue-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? "border-red-500" : ""}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-blue-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-blue-500">*</span>
              </label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className={errors.phone ? "border-red-500" : ""}
                required
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-blue-500">*</span>
            </label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What is your enquiry about?"
              className={errors.subject ? "border-red-500" : ""}
              required
            />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-blue-500">*</span>
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              rows={4}
              className={errors.message ? "border-red-500" : ""}
              required
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-academy-primary hover:bg-academy-secondary text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnquiryForm;
