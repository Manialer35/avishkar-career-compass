
import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  time: string;
  price: number;
}

// Mock paid event data
const paidEventData: EventDetails = {
  id: 'police-bharti-2025',
  title: 'Police Bharti Special Training 2025',
  description: 'Comprehensive coaching and preparation for Police Recruitment Examinations',
  date: 'Starting from June 15, 2025',
  location: 'Avishkar Career Academy, Main Campus, City Center',
  time: 'Morning Batch: 7:00 AM - 11:00 AM | Evening Batch: 4:00 PM - 8:00 PM',
  price: 4999
};

const EnrollmentForm = ({ event, onClose }: { event: EventDetails, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    batch: 'morning'
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGooglePay = async () => {
    try {
      setPaymentStatus('processing');
      setLoading(true);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record enrollment in Supabase
      const { error } = await supabase
        .from('class_enrollments')
        .insert({
          class_id: event.id,
          class_title: event.title,
          class_date: new Date().toISOString(),
          student_name: formData.name,
          student_email: formData.email,
          student_phone: formData.phone,
          student_address: formData.address,
          amount_paid: event.price,
          payment_status: 'completed',
          payment_id: `google-pay-${Date.now()}`
        });

      if (error) {
        throw error;
      }

      setPaymentStatus('success');
      toast({
        title: "Enrollment Successful!",
        description: "You have successfully enrolled in the class.",
        variant: "default",
      });

      // Close the dialog after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Enrollment error:", error);
      setPaymentStatus('error');
      toast({
        title: "Enrollment Failed",
        description: "There was a problem processing your enrollment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-8">
        <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
          <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Enrollment Successful!</h3>
        <p className="text-gray-600 mb-4">You have successfully enrolled in {event.title}.</p>
        <p className="text-sm text-gray-500">A confirmation email has been sent to {formData.email}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Batch</label>
            <select
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="morning">Morning (7:00 AM - 11:00 AM)</option>
              <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Course Fee:</span>
            <span className="font-bold text-lg">₹{event.price.toLocaleString()}</span>
          </div>

          <Button
            type="button"
            onClick={handleGooglePay}
            disabled={loading || !formData.name || !formData.email || !formData.phone || !formData.address}
            className="w-full flex items-center justify-center bg-black text-white hover:bg-gray-800 mb-2"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <img src="/google-pay-logo.svg" alt="Google Pay" className="h-6 mr-2" />
                Pay with Google Pay
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

const Event = () => {
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-academy-primary to-academy-secondary text-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-2">{paidEventData.title}</h2>
        <p className="text-lg">{paidEventData.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5 flex items-start">
          <Calendar className="h-6 w-6 text-academy-primary mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Date</h3>
            <p>{paidEventData.date}</p>
            <p className="text-sm text-gray-500">3-month intensive program</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-start">
          <MapPin className="h-6 w-6 text-academy-primary mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Location</h3>
            <p>{paidEventData.location}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-start">
          <Clock className="h-6 w-6 text-academy-primary mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Timing</h3>
            <p>{paidEventData.time}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-academy-primary mb-4">About the Program</h3>
        <p className="mb-4">
          Our Police Bharti Special Event is designed to provide comprehensive coaching and preparation for candidates 
          aspiring to join the police force. The program covers all aspects of the selection process, including written 
          examination, physical fitness test, and interview preparation.
        </p>
        <p>
          The coaching is provided by experienced faculty members who have in-depth knowledge of the examination pattern 
          and selection criteria. Our tailored approach ensures that candidates are well-prepared for all challenges they 
          may face during the recruitment process.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-academy-primary mb-4">Program Highlights</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Users className="h-5 w-5 text-academy-secondary mr-2 mt-0.5 flex-shrink-0" />
              <span>Expert faculty with experience in police recruitment training</span>
            </li>
            <li className="flex items-start">
              <FileText className="h-5 w-5 text-academy-secondary mr-2 mt-0.5 flex-shrink-0" />
              <span>Comprehensive study materials covering all subjects</span>
            </li>
            <li className="flex items-start">
              <Award className="h-5 w-5 text-academy-secondary mr-2 mt-0.5 flex-shrink-0" />
              <span>Special physical training sessions by fitness experts</span>
            </li>
            <li className="flex items-start">
              <Clock className="h-5 w-5 text-academy-secondary mr-2 mt-0.5 flex-shrink-0" />
              <span>Regular mock tests and performance assessment</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-academy-primary mb-4">Course Fee</h3>
          <div className="mb-6">
            <div className="text-3xl font-bold text-academy-primary mb-2">₹{paidEventData.price.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Full course fee including study materials</div>
          </div>
          
          <h4 className="font-medium mb-2">What's included:</h4>
          <ul className="space-y-1 mb-6">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Complete study materials
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Daily classes (3 months)
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Physical training sessions
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Mock tests & interview preparation
            </li>
          </ul>
          
          <Button 
            onClick={() => setShowEnrollForm(true)}
            className="w-full bg-academy-primary hover:bg-academy-secondary text-white"
          >
            Enroll Now with Google Pay
          </Button>
        </div>
      </div>
      
      <div className="bg-academy-light p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-academy-primary mb-3">Success Stories</h3>
        <p className="mb-4">
          Our Police Bharti Special Program has helped hundreds of candidates successfully join the police force. In the 
          last recruitment drive, over 75% of our students were selected, many securing top ranks in their respective categories.
        </p>
        <div className="border-t pt-4 mt-4">
          <p className="italic text-gray-700">
            "The coaching and guidance provided by Avishkar Career Academy was instrumental in my selection. The faculty's 
            support and the comprehensive preparation helped me excel in all stages of the recruitment process."
          </p>
          <p className="text-right mt-2 font-semibold">- Rajesh Sharma, Selected as Sub-Inspector</p>
        </div>
      </div>
      
      <Dialog open={showEnrollForm} onOpenChange={setShowEnrollForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll in {paidEventData.title}</DialogTitle>
          </DialogHeader>
          <EnrollmentForm event={paidEventData} onClose={() => setShowEnrollForm(false)} />
          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={() => setShowEnrollForm(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Event;
