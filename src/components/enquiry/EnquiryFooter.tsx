import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const EnquiryFooter = () => {
  return (
    <footer className="bg-gray-800 text-white py-10 px-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">About Us</h4>
          <p className="text-gray-300 text-sm">
            Aavishkar Career Academy is a leading coaching institute specializing in competitive exam preparation, with a special focus on Police Bharti examinations.
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
            <a href="https://wa.me/919049137731" className="text-white hover:text-academy-red transition-colors" target="_blank" rel="noopener noreferrer">
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
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
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
            <li><Link to="/" className="hover:text-academy-red transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-academy-red transition-colors">About Us</Link></li>
            <li><Link to="/event" className="hover:text-academy-red transition-colors">Police Bharti Event</Link></li>
            <li><Link to="/enquiry" className="hover:text-academy-red transition-colors">Contact Us</Link></li>
            <li><Link to="/study-materials" className="hover:text-academy-red transition-colors">Study Materials</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Policies</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-academy-red transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-academy-red transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/refund-policy" className="hover:text-academy-red transition-colors">Refund & Cancellation</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-academy-red transition-colors">Shipping Policy</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red" />
              <span>Swargate Chowk, Near HP Petrol Pump, Infront of Naik B Biyane, Panna Chambers, 3rd Floor, Pune, Maharashtra, India</span>
            </li>
            <li className="flex items-center">
              <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red" />
              <span>+91 9049137731 / +91 9890555432</span>
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
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <a href="https://wa.me/919049137731" className="hover:text-academy-red transition-colors" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </li>
            <li className="flex items-center">
              <Mail className="h-5 w-5 mr-2 flex-shrink-0 text-academy-red" />
              <span>khot.md@gmail.com</span>
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
      
      <div className="border-t border-gray-700 mt-8 pt-6">
        <div className="text-center text-gray-400 text-sm space-y-2">
          <div className="bg-academy-primary/10 rounded-lg p-3 mb-4">
            <p className="text-academy-red font-semibold text-lg">AAVISHKAR CAREER ACADEMY</p>
            <p className="text-gray-300">Official Billing Entity for All Transactions</p>
          </div>
          <p>&copy; {new Date().getFullYear()} Aavishkar Career Academy. All rights reserved.</p>
          <p className="mt-2">Designed & Developed for Success</p>
        </div>
      </div>
    </footer>
  );
};

export default EnquiryFooter;
