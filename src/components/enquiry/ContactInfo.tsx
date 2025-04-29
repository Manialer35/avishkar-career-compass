
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
  );
};

export default ContactInfo;
