
import { useState } from 'react';
import { Phone, Mail, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Enquiry = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        console.log('Form submitted:', formData);
        
        // Show success toast
        toast({
          title: "Enquiry Submitted Successfully",
          description: "Thank you for your enquiry. Our team will contact you shortly.",
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        
        setIsSubmitting(false);
      }, 1000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-academy-primary mb-6">Contact Us</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
          <div className="bg-academy-light p-3 rounded-full mb-4">
            <Phone className="h-6 w-6 text-academy-primary" />
          </div>
          <h3 className="font-semibold mb-2">Call Us</h3>
          <p className="text-gray-700">+91 98765 43210</p>
          <p className="text-gray-700">+91 98765 43211</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
          <div className="bg-academy-light p-3 rounded-full mb-4">
            <Mail className="h-6 w-6 text-academy-primary" />
          </div>
          <h3 className="font-semibold mb-2">Email Us</h3>
          <p className="text-gray-700">info@avishkaracademy.com</p>
          <p className="text-gray-700">admissions@avishkaracademy.com</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
          <div className="bg-academy-light p-3 rounded-full mb-4">
            <MapPin className="h-6 w-6 text-academy-primary" />
          </div>
          <h3 className="font-semibold mb-2">Visit Us</h3>
          <p className="text-gray-700">123 Education Street,</p>
          <p className="text-gray-700">City Center, State - 123456</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-academy-primary mb-4">Send an Enquiry</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-academy-red">*</span>
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
                    Email Address <span className="text-academy-red">*</span>
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
                    Phone Number <span className="text-academy-red">*</span>
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
                  Subject <span className="text-academy-red">*</span>
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
                  Message <span className="text-academy-red">*</span>
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
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-academy-primary mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-academy-red">What courses do you offer?</h4>
              <p className="text-gray-700 mt-1">
                We offer coaching for various competitive exams including Police Bharti, Banking, SSC, Railways, and other government exams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-academy-red">What are the batch timings?</h4>
              <p className="text-gray-700 mt-1">
                We have morning, afternoon, and evening batches to accommodate students with different schedules. Please contact us for specific timing details.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-academy-red">Do you provide study materials?</h4>
              <p className="text-gray-700 mt-1">
                Yes, we provide comprehensive study materials, practice papers, and online resources to all our enrolled students.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-academy-red">How can I enroll in a course?</h4>
              <p className="text-gray-700 mt-1">
                You can visit our institute, call us, or fill out the enquiry form on this page. Our counselors will guide you through the enrollment process.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-academy-red">Do you offer online classes?</h4>
              <p className="text-gray-700 mt-1">
                Yes, we offer online classes for students who cannot attend in-person sessions. These include live lectures, recorded sessions, and online assessments.
              </p>
            </div>
            
            <div className="bg-academy-light p-4 rounded-lg mt-6">
              <h4 className="font-semibold text-academy-primary">Have more questions?</h4>
              <p className="text-gray-700 mt-1">
                Feel free to reach out to us using the contact information provided or submit your enquiry using the form. Our team is always happy to help!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-gray-800 text-white py-10 px-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">About Us</h4>
            <p className="text-gray-300 text-sm">
              Avishkar Career Academy is a leading coaching institute specializing in competitive exam preparation, with a special focus on Police Bharti examinations.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-white hover:text-academy-red transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-academy-red transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-academy-red transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-academy-red transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="/" className="hover:text-academy-red transition-colors">Home</a></li>
              <li><a href="/about" className="hover:text-academy-red transition-colors">About Us</a></li>
              <li><a href="/event" className="hover:text-academy-red transition-colors">Police Bharti Event</a></li>
              <li><a href="/enquiry" className="hover:text-academy-red transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-academy-red transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-academy-red transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-academy-red transition-colors">Police Bharti</a></li>
              <li><a href="#" className="hover:text-academy-red transition-colors">SSC Exams</a></li>
              <li><a href="#" className="hover:text-academy-red transition-colors">Banking Exams</a></li>
              <li><a href="#" className="hover:text-academy-red transition-colors">Railway Exams</a></li>
              <li><a href="#" className="hover:text-academy-red transition-colors">State Exams</a></li>
              <li><a href="#" className="hover:text-academy-red transition-colors">UPSC Preparation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red" />
                <span>123 Education Street, City Center, State - 123456</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red" />
                <span>info@avishkaracademy.com</span>
              </li>
              <li className="flex items-center">
                <Globe className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red" />
                <span>www.avishkaracademy.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Avishkar Career Academy. All rights reserved.</p>
          <p className="mt-2">Designed & Developed for Success</p>
        </div>
      </footer>
    </div>
  );
};

export default Enquiry;
