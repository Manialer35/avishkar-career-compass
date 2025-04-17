
import { Calendar, MapPin, Clock, Users, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Event = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-academy-primary to-academy-secondary text-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-2">Police Bharti Special Event</h2>
        <p className="text-lg">Comprehensive coaching and preparation for Police Recruitment Examinations</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5 flex items-start">
          <Calendar className="h-6 w-6 text-academy-primary mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Date</h3>
            <p>Starting from June 15, 2025</p>
            <p className="text-sm text-gray-500">3-month intensive program</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-start">
          <MapPin className="h-6 w-6 text-academy-primary mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Location</h3>
            <p>Avishkar Career Academy</p>
            <p className="text-sm text-gray-500">Main Campus, City Center</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-start">
          <Clock className="h-6 w-6 text-academy-primary mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Timing</h3>
            <p>Morning Batch: 7:00 AM - 11:00 AM</p>
            <p>Evening Batch: 4:00 PM - 8:00 PM</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-academy-primary mb-4">About the Program</h3>
        <p className="mb-4">
          Our Police Bharti Special Event is designed to provide comprehensive coaching and preparation for candidates 
          aspiring to join the police force. The program covers all aspects of the selection process, including written 
          examination, physical fitness test, and interview preparation.
        </p>
        <p>
          The coaching is provided by experienced faculty members who have in-depth knowledge of the examination pattern 
          and selection criteria. Our tailored approach ensures that candidates are well-prepared for all challenges they 
          may face during the recruitment process.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-academy-primary mb-4">Program Highlights</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <Users className="h-5 w-5 text-academy-secondary mr-2 mt-0.5 flex-shrink-0" />
              <span>Expert faculty with experience in police recruitment training</span>
            </li>
            <li className="flex items-start">
              <FileText className="h-5 w-5 text-academy-secondary mr-2 mt-0.5 flex-shrink-0" />
              <span>Comprehensive study materials covering all subjects</span>
            </li>
            <li className="flex items-start">
              <Award className="h-5 w-5 text-academy-secondary mr-2 mt-0.5 flex-shrink-0" />
              <span>Special physical training sessions by fitness experts</span>
            </li>
            <li className="flex items-start">
              <Clock className="h-5 w-5 text-academy-secondary mr-2 mt-0.5 flex-shrink-0" />
              <span>Regular mock tests and performance assessment</span>
            </li>
            <li className="flex items-start">
              <Calendar className="h-5 w-5 text-academy-secondary mr-2 mt-0.5 flex-shrink-0" />
              <span>Interview preparation and personality development</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-academy-primary mb-4">What You Will Learn</h3>
          <ul className="space-y-2">
            <li className="border-l-2 border-academy-secondary pl-3 py-1">General Knowledge & Current Affairs</li>
            <li className="border-l-2 border-academy-secondary pl-3 py-1">Reasoning & Logical Ability</li>
            <li className="border-l-2 border-academy-secondary pl-3 py-1">Quantitative Aptitude & Mathematics</li>
            <li className="border-l-2 border-academy-secondary pl-3 py-1">Language Proficiency</li>
            <li className="border-l-2 border-academy-secondary pl-3 py-1">Computer Knowledge</li>
            <li className="border-l-2 border-academy-secondary pl-3 py-1">Physical Fitness Training</li>
            <li className="border-l-2 border-academy-secondary pl-3 py-1">Interview Skills & Communication</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-academy-light p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-academy-primary mb-3">Success Stories</h3>
        <p className="mb-4">
          Our Police Bharti Special Program has helped hundreds of candidates successfully join the police force. In the 
          last recruitment drive, over 75% of our students were selected, many securing top ranks in their respective categories.
        </p>
        <div className="border-t pt-4 mt-4">
          <p className="italic text-gray-700">
            "The coaching and guidance provided by Avishkar Career Academy was instrumental in my selection. The faculty's 
            support and the comprehensive preparation helped me excel in all stages of the recruitment process."
          </p>
          <p className="text-right mt-2 font-semibold">- Rajesh Sharma, Selected as Sub-Inspector</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-xl font-semibold text-academy-primary mb-4">Join Our Police Bharti Special Program</h3>
        <p className="mb-6">Limited seats available. Register now to secure your spot and take the first step towards a successful career in the police force.</p>
        <Button className="bg-academy-primary hover:bg-academy-secondary text-white px-6 py-2">
          Register Now
        </Button>
      </div>
    </div>
  );
};

export default Event;
