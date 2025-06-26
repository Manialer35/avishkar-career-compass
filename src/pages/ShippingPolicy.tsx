
import { ArrowLeft, Truck, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-4" 
          asChild
        >
          <Link to="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-academy-primary">Shipping Policy</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">1. Shipping Overview</h2>
          <p className="text-gray-700">
            Aavishkar Career Academy ships physical study materials including books, printed notes, and stationery items across India. Most of our content is available digitally for instant access.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">2. Delivery Timelines</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Minimum Delivery Time</h3>
              </div>
              <ul className="text-green-700 space-y-1">
                <li>Within Pune: 1-2 business days</li>
                <li>Within Maharashtra: 2-3 business days</li>
                <li>Major Cities: 3-5 business days</li>
                <li>Other Locations: 5-7 business days</li>
              </ul>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-800">Maximum Delivery Time</h3>
              </div>
              <ul className="text-red-700 space-y-1">
                <li>Within Pune: 3-4 business days</li>
                <li>Within Maharashtra: 5-7 business days</li>
                <li>Major Cities: 7-10 business days</li>
                <li>Remote Areas: 10-15 business days</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">3. Shipping Charges</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Orders above ₹500: Free shipping</li>
              <li>Within Pune: ₹50</li>
              <li>Within Maharashtra: ₹100</li>
              <li>Other States: ₹150</li>
              <li>Express Delivery: Additional ₹100</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">4. Shipping Areas</h2>
          <div className="flex items-start mb-2">
            <MapPin className="h-5 w-5 text-academy-primary mr-2 mt-1" />
            <div>
              <p className="text-gray-700 mb-2">We currently ship to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>All major cities in India</li>
                <li>Pin codes serviceable by our courier partners</li>
                <li>Remote areas (with extended delivery time)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">5. Order Processing</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Orders are processed within 24-48 hours of payment confirmation</li>
              <li>You will receive a tracking number via SMS and email</li>
              <li>Processing time is not included in delivery timeline</li>
              <li>Orders placed on weekends/holidays are processed on next working day</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">6. Tracking & Updates</h2>
          <p className="text-gray-700 mb-2">Stay informed about your order:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>SMS updates at key delivery milestones</li>
            <li>Email notifications with tracking details</li>
            <li>Real-time tracking through courier partner website</li>
            <li>Customer support for any delivery queries</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">7. Delivery Issues</h2>
          <p className="text-gray-700 mb-2">In case of delivery problems:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Contact us immediately if package is damaged</li>
            <li>Report missing items within 48 hours of delivery</li>
            <li>Provide delivery photos if available</li>
            <li>We will arrange replacement or refund as appropriate</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">8. Digital Delivery</h2>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Truck className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-800">Instant Access</h3>
            </div>
            <p className="text-green-700">
              Most study materials are available for immediate download after payment. 
              Access links are sent to your registered email within 5-10 minutes of successful payment.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">9. Contact for Shipping Queries</h2>
          <p className="text-gray-700">
            For shipping related questions:
            <br />
            Email: khot.md@gmail.com
            <br />
            Phone: +91 9049137731 / +91 9890555432
            <br />
            Working Hours: Monday to Saturday, 9 AM to 6 PM
          </p>
        </section>

        <div className="border-t pt-4 text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
