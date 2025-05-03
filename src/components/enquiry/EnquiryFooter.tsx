
import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const EnquiryFooter = () => {
  return (
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
            <a href="https://t.me/avishkarcareeracademy" className="text-white hover:text-academy-red transition-colors">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m22 3-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 3" />
                <path d="M2 3v18l10-8.85L22 21V3" />
              </svg>
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
              <span>+91 9049137731 / +91 9890555432</span>
            </li>
            <li className="flex items-center">
              <Mail className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red" />
              <span>atulhmadkar@gmail.com</span>
            </li>
            <li className="flex items-center">
              <Globe className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red" />
              <span>www.avishkaracademy.com</span>
            </li>
            <li className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red"
              >
                <path d="m22 3-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 3" />
                <path d="M2 3v18l10-8.85L22 21V3" />
              </svg>
              <a href="https://t.me/avishkarcareeracademy" className="hover:text-academy-red transition-colors">
                Join us on Telegram
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Avishkar Career Academy. All rights reserved.</p>
        <p className="mt-2">Designed & Developed for Success</p>
      </div>
    </footer>
  );
};

export default EnquiryFooter;
