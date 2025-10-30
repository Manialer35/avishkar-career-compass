
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
          <h2 className="text-xl font-semibold text-academy-primary mb-3">1. Course Cancellation</h2>
          <p className="text-gray-700 mb-2">
            Students may cancel their course enrollment within 7 days of registration and receive a full refund, provided:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>No study materials have been downloaded</li>
            <li>Less than 10% of the course content has been accessed</li>
            <li>Original payment proof is provided</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">2. Refund Processing</h2>
          <p className="text-gray-700">
            Approved refunds will be processed within 7-10 business days. Refunds will be credited to the original payment method used during purchase.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">3. Non-Refundable Items</h2>
          <p className="text-gray-700 mb-2">The following items are non-refundable:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Downloaded study materials and PDFs</li>
            <li>Completed courses (greater than 50% progress)</li>
            <li>Personal coaching sessions that have been conducted</li>
            <li>Examination fees paid to external boards</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">4. Course Pricing</h2>
          <div className="bg-academy-light p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current Course Fees:</h3>
            <ul className="text-gray-700 space-y-1">
              <li>• Basic Study Materials: ₹500 - ₹2,000</li>
              <li>• Premium Course Package: ₹3,000 - ₹8,000</li>
              <li>• Complete Coaching Program: ₹10,000 - ₹25,000</li>
              <li>• Personal Mentoring Sessions: ₹1,500 per session</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              *Prices are subject to change. Current pricing will be displayed at the time of purchase.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">5. Technical Issues</h2>
          <p className="text-gray-700">
            If you experience technical difficulties preventing access to purchased materials, please contact our support team. We will work to resolve the issue or provide appropriate compensation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">6. Contact for Refunds</h2>
          <p className="text-gray-700">
            To request a refund or cancellation, please contact us at:
            <br />
            Email: khot.md@gmail.com
            <br />
            Phone: +91 9049137731 / +91 9890555432
            <br />
            <br />
            Please include your order number and reason for refund in your request.
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
