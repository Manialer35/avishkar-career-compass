
import { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const Enquiry = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    // Show success toast
    toast({
      title: "Enquiry Submitted",
      description: "Thank you for your enquiry. We will get back to you soon.",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-academy-primary mb-4">Send an Enquiry</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is your enquiry about?"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={4}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-academy-primary hover:bg-academy-secondary text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-academy-primary mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-academy-secondary">What courses do you offer?</h4>
              <p className="text-gray-700 mt-1">
                We offer coaching for various competitive exams including Police Bharti, Banking, SSC, Railways, and other government exams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-academy-secondary">What are the batch timings?</h4>
              <p className="text-gray-700 mt-1">
                We have morning, afternoon, and evening batches to accommodate students with different schedules. Please contact us for specific timing details.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-academy-secondary">Do you provide study materials?</h4>
              <p className="text-gray-700 mt-1">
                Yes, we provide comprehensive study materials, practice papers, and online resources to all our enrolled students.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-academy-secondary">How can I enroll in a course?</h4>
              <p className="text-gray-700 mt-1">
                You can visit our institute, call us, or fill out the enquiry form on this page. Our counselors will guide you through the enrollment process.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-academy-secondary">Do you offer online classes?</h4>
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
    </div>
  );
};

export default Enquiry;
