
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
        <h1 className="text-2xl font-bold text-academy-primary">Privacy Policy</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">1. Information We Collect</h2>
          <p className="text-gray-700 mb-2">We collect information you provide directly to us, such as:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Name, email address, and phone number</li>
            <li>Payment information for course purchases</li>
            <li>Academic progress and performance data</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-2">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Provide and maintain our educational services</li>
            <li>Process payments and send receipts</li>
            <li>Send course updates and educational content</li>
            <li>Improve our services and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">3. Information Sharing</h2>
          <p className="text-gray-700">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with trusted service providers who assist us in operating our website and conducting our business.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">4. Data Security</h2>
          <p className="text-gray-700">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">5. Cookies</h2>
          <p className="text-gray-700">
            We use cookies to enhance your experience on our website. You can choose to disable cookies through your browser settings, but this may affect some functionality of our site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">6. Your Rights</h2>
          <p className="text-gray-700 mb-2">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-academy-primary mb-3">7. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy;
