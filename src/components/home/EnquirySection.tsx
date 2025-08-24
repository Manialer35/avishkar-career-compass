
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';

const EnquirySection = () => {
  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold text-academy-primary mb-4">Quick Enquiry</h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">Have a question or interested in our courses? Fill out our enquiry form and our team will get back to you within 24 hours.</p>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button 
            className="bg-academy-red hover:bg-academy-red/90 text-white w-full sm:w-auto"
            asChild
          >
            <Link to="/enquiry">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us Now
            </Link>
          </Button>
          <span className="text-gray-500 hidden sm:inline">or</span>
          <div className="flex items-center text-academy-primary hover:text-academy-primary/80">
            <Link to="/enquiry" className="flex items-center font-medium">
              Learn more about our contact options
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnquirySection;
