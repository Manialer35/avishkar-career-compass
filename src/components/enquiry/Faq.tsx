
import { Component } from 'react';

const Faq = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-academy-primary mb-4">Frequently Asked Questions</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-academy-red">What courses do you offer?</h4>
          <p className="text-gray-700 mt-1">
            We offer coaching for various competitive exams including Police Bharti, Banking, SSC, Railways, and other government exams.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-academy-red">What are the batch timings?</h4>
          <p className="text-gray-700 mt-1">
            We have morning, afternoon, and evening batches to accommodate students with different schedules. Please contact us for specific timing details.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-academy-red">Do you provide study materials?</h4>
          <p className="text-gray-700 mt-1">
            Yes, we provide comprehensive study materials, practice papers, and online resources to all our enrolled students.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-academy-red">How can I enroll in a course?</h4>
          <p className="text-gray-700 mt-1">
            You can visit our institute, call us, or fill out the enquiry form on this page. Our counselors will guide you through the enrollment process.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-academy-red">Do you offer online classes?</h4>
          <p className="text-gray-700 mt-1">
            Yes, we offer online classes for students who cannot attend in-person sessions. These include live lectures, recorded sessions, and online assessments.
          </p>
        </div>
        
        <div className="bg-academy-light p-4 rounded-lg mt-6">
          <h4 className="font-semibold text-academy-primary">Have more questions?</h4>
          <p className="text-gray-700 mt-1">
            Feel free to reach out to us using the contact information provided or submit your enquiry using the form. Our team is always happy to help!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Faq;
