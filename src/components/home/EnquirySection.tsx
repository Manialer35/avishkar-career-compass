
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const EnquirySection = () => {
  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold text-academy-primary mb-4">Quick Enquiry</h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">Have a question or interested in our courses? Fill out this form and our team will get back to you soon.</p>
        <Button 
          className="bg-academy-red hover:bg-academy-red/90 text-white w-full sm:w-auto"
          asChild
        >
          <Link to="/enquiry">
            <Mail className="h-4 w-4 mr-2" />
            Contact Us Now
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default EnquirySection;
