
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
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
        <h1 className="text-2xl font-bold text-academy-primary">Refund & Cancellation Policy</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">1. Refund Eligibility</h2>
          <p className="text-gray-700 mb-2">Refunds are available under the following conditions:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Course cancellation by Aavishkar Career Academy</li>
            <li>Technical issues preventing access to purchased materials</li>
            <li>Request made within 7 days of purchase (for digital materials)</li>
            <li>Request made within 24 hours of purchase (for live classes)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">2. Non-Refundable Items</h2>
          <p className="text-gray-700 mb-2">The following items are not eligible for refunds:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Digital study materials after 7 days of purchase</li>
            <li>Courses that have been substantially accessed (>50% completion)</li>
            <li>Physical study materials (books, printed materials)</li>
            <li>Special promotional offers and discounted courses</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">3. Cancellation Policy</h2>
          <p className="text-gray-700 mb-2">Class cancellations:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Students can cancel enrollment up to 24 hours before class starts</li>
            <li>Cancellations made less than 24 hours before class: 50% refund</li>
            <li>No-shows without prior notice: No refund</li>
            <li>Academy reserves the right to cancel classes due to insufficient enrollment</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">4. Refund Process</h2>
          <p className="text-gray-700 mb-2">To request a refund:</p>
          <ol className="list-decimal list-inside text-gray-700 space-y-1">
            <li>Contact us at khot.md@gmail.com with your order details</li>
            <li>Provide reason for refund request</li>
            <li>Allow 7-10 business days for processing</li>
            <li>Refunds will be processed to the original payment method</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">5. Pricing Policy</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-academy-primary mb-2">Current Pricing Structure:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Free Study Materials: ₹0 (No cost)</li>
              <li>Premium Study Materials: ₹99 - ₹999 (depending on content)</li>
              <li>Live Classes: ₹199 - ₹1,999 (per session or package)</li>
              <li>Complete Course Packages: ₹2,999 - ₹9,999</li>
              <li>One-on-One Mentorship: ₹1,500 per hour</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              *Prices are subject to change. Special discounts may be available during promotional periods.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">6. Force Majeure</h2>
          <p className="text-gray-700">
            In case of events beyond our control (natural disasters, government restrictions, etc.), we may need to postpone or cancel services. In such cases, we will offer rescheduling or full refunds.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">7. Contact for Refunds</h2>
          <p className="text-gray-700">
            For refund requests and queries, contact:
            <br />
            Email: khot.md@gmail.com
            <br />
            Phone: +91 9049137731 / +91 9890555432
            <br />
            Response time: Within 48 hours
          </p>
        </section>

        <div className="border-t pt-4 text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
