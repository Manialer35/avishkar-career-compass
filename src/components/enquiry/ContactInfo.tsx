
import { Phone, Mail, MapPin, Building } from 'lucide-react';

const ContactInfo = () => {
  return (
    <div className="space-y-6">
      {/* Billing Information - Prominent Display */}
      <div className="bg-academy-primary text-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <Building className="h-8 w-8 mr-3" />
          <h2 className="text-2xl font-bold">Official Billing Entity</h2>
        </div>
        <h3 className="text-3xl font-bold mb-2">AAVISHKAR CAREER ACADEMY</h3>
        <p className="text-academy-light text-lg">Registered Educational Institution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
          <div className="bg-academy-light p-3 rounded-full mb-4">
            <Phone className="h-6 w-6 text-academy-primary" />
          </div>
          <h3 className="font-semibold mb-2">Call Us</h3>
          <p className="text-gray-700">+91 9049137731</p>
          <p className="text-gray-700">+91 9890555432</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
          <div className="bg-academy-light p-3 rounded-full mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="h-6 w-6 text-academy-primary"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </div>
          <h3 className="font-semibold mb-2">WhatsApp</h3>
          <a href="https://wa.me/919049137731" className="text-academy-primary hover:text-academy-red transition-colors" target="_blank" rel="noopener noreferrer">
            Chat with us
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
          <div className="bg-academy-light p-3 rounded-full mb-4">
            <Mail className="h-6 w-6 text-academy-primary" />
          </div>
          <h3 className="font-semibold mb-2">Email Us</h3>
          <p className="text-gray-700">khot.md@gmail.com</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
          <div className="bg-academy-light p-3 rounded-full mb-4">
            <MapPin className="h-6 w-6 text-academy-primary" />
          </div>
          <h3 className="font-semibold mb-2">Visit Us</h3>
          <p className="text-gray-700">Swargate Chowk, Near HP Petrol Pump,</p>
          <p className="text-gray-700">Infront of Naik B Biyane,</p>
          <p className="text-gray-700">Panna Chambers, 3rd Floor,</p>
          <p className="text-gray-700">Pune, Maharashtra, India</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
