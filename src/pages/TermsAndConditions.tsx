
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
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
        <h1 className="text-2xl font-bold text-academy-primary">Terms and Conditions</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing and using Aavishkar Career Academy's services, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">2. Use License</h2>
          <p className="text-gray-700 mb-2">
            Permission is granted to temporarily download one copy of the materials on Aavishkar Career Academy's website for personal, non-commercial transitory viewing only.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">3. Course Materials and Content</h2>
          <p className="text-gray-700">
            All course materials, including but not limited to study guides, video lectures, practice tests, and downloadable content, are the intellectual property of Aavishkar Career Academy. Unauthorized distribution or sharing is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">4. Payment Terms</h2>
          <p className="text-gray-700">
            All payments must be made in advance. We accept various payment methods including UPI, credit/debit cards, and net banking. Prices are subject to change without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">5. User Conduct</h2>
          <p className="text-gray-700">
            Users are expected to maintain respectful behavior and follow all academy guidelines. Any misconduct may result in suspension or termination of services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">6. Disclaimer</h2>
          <p className="text-gray-700">
            The materials on Aavishkar Career Academy's website are provided on an 'as is' basis. Aavishkar Career Academy makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">7. Contact Information</h2>
          <p className="text-gray-700">
            For any questions regarding these terms and conditions, please contact us at:
            <br />
            Email: khot.md@gmail.com
            <br />
            Phone: +91 9049137731 / +91 9890555432
          </p>
        </section>

        <div className="border-t pt-4 text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
