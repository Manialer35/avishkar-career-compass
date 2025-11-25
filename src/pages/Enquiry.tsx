
import { useState } from 'react';
import { Phone, Mail, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Refactored components
import ContactInfo from '@/components/enquiry/ContactInfo';
import EnquiryForm from '@/components/enquiry/EnquiryForm';
import Faq from '@/components/enquiry/Faq';
import EnquiryFooter from '@/components/enquiry/EnquiryFooter';
import BackButton from '@/components/BackButton';

const Enquiry = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h2 className="text-2xl font-bold text-academy-primary mb-6">Contact Us</h2>
      
      <ContactInfo />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <EnquiryForm />
        <Faq />
      </div>
      
      <EnquiryFooter />
    </div>
  );
};

export default Enquiry;
