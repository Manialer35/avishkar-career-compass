
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <p className="text-gray-700">Panna Chambers, 3rd Floor</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
