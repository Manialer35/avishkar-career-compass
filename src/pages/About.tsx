import { BookOpen, Users, Trophy, CheckCircle, GraduationCap, Video, Phone, Youtube } from 'lucide-react';
import BackButton from '@/components/BackButton';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h2 className="text-2xl font-bold text-academy-primary mb-6">About Aavishkar Career Academy</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Our Journey</h3>
        <p className="mb-4">
          Aavishkar Career Academy was established with a vision to provide quality education and coaching to students
          preparing for competitive examinations. Over the years, we have grown into one of the most trusted coaching
          institutes in the region, known for our dedication to student success.
        </p>
        <p>
          Our journey began with a small batch of students, and today we take pride in guiding thousands of students
          toward their dream careers. Our success is measured by the success of our students who have secured positions
          in various government departments and organizations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-academy-secondary mr-3" />
            <h3 className="text-lg font-semibold">Our Mission</h3>
          </div>
          <p>
            To provide high-quality coaching that empowers students to excel in competitive examinations and build
            successful careers by focusing on fundamental concepts, analytical skills, and examination techniques.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Trophy className="h-8 w-8 text-academy-secondary mr-3" />
            <h3 className="text-lg font-semibold">Our Vision</h3>
          </div>
          <p>
            To become the leading career coaching institute that transforms aspiring candidates into successful professionals
            through personalized guidance, innovative teaching methodologies, and comprehensive exam preparation.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Why Choose Us?</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
            <span>Experienced faculty with in-depth knowledge of examination patterns and trends</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
            <span>Comprehensive study materials designed by experts</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
            <span>Regular mock tests and performance analysis</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
            <span>Special coaching for Police Bharti and other competitive exams</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
            <span>Personalized attention to every student</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
            <span>Modern infrastructure and conducive learning environment</span>
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <GraduationCap className="h-8 w-8 text-academy-secondary mr-3" />
          <h3 className="text-lg font-semibold">Guest Lecturers</h3>
        </div>
        <div className="space-y-6">
          <div className="border-l-4 border-academy-secondary pl-4">
            <h4 className="font-semibold text-lg text-gray-800">श्री. विजय खेडकर सर</h4>
            <p className="text-gray-600">सहायक संचालक वित्त व लेखा विभाग उल्हासनगर म. न. पा</p>
          </div>
          
          <div className="border-l-4 border-academy-secondary pl-4">
            <h4 className="font-semibold text-lg text-gray-800">श्रीमती कांचन वाघमारे</h4>
            <p className="text-gray-600">वरिष्ठ समाज कल्याण निरीक्षक,</p>
            <p className="text-gray-600">प्रादेशिक उपयुक्त कार्यालय, समाज कल्याण, मुंबई विभाग</p>
          </div>
          
          <div className="border-l-4 border-academy-secondary pl-4">
            <h4 className="font-semibold text-lg text-gray-800">श्री. राजेश भराटे सर</h4>
            <p className="text-gray-600">G. K वनलायनर या प्रसिद्ध पुस्तकाचे लेखक</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <Video className="h-8 w-8 text-academy-secondary mr-3" />
          <h3 className="text-lg font-semibold">Academy Videos</h3>
        </div>
        <div className="space-y-6">
          <div className="aspect-video w-full max-w-2xl mx-auto">
            <iframe
              src="https://www.youtube.com/embed/SCouRj8tZn4"
              title="Aavishkar Career Academy Video"
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="aspect-video w-full max-w-2xl mx-auto">
            <iframe
              src="https://www.youtube.com/embed/WRVlonjIpos"
              title="Aavishkar Career Academy Video 2"
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-4">
          <Phone className="h-8 w-8 text-academy-secondary mr-3" />
          <h3 className="text-lg font-semibold">Physical Trainers</h3>
        </div>
        <div className="space-y-6">
          <div className="border-l-4 border-academy-primary pl-4">
            <h4 className="font-semibold text-lg text-gray-800">मार्गदर्शक :- Shri Ankush Ghuge Sir</h4>
            <p className="text-gray-600 mb-2">आगाशे ग्राउंड, स्वारगेट</p>
            <a 
              href="tel:+919730972893" 
              className="text-academy-primary hover:text-academy-red transition-colors flex items-center gap-2"
            >
              <Phone size={16} />
              कॉन्टॅक्ट:- +91 97309 72893
            </a>
          </div>
          
          <div className="border-l-4 border-academy-primary pl-4">
            <h4 className="font-semibold text-lg text-gray-800">मार्गदर्शक :- Shri Mangesh Bhalerao Sir ( Coach )</h4>
            <p className="text-gray-600 mb-2">वेताळ टेकडी कोथरूड पुणे.</p>
            <a 
              href="tel:+918308782102" 
              className="text-academy-primary hover:text-academy-red transition-colors flex items-center gap-2"
            >
              <Phone size={16} />
              कॉन्टॅक्ट :- +91 83087 82102
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Users className="h-8 w-8 text-academy-secondary mr-3" />
          <h3 className="text-lg font-semibold">Our Team</h3>
        </div>
        <p className="mb-4">
          Our team consists of highly qualified and experienced educators who are experts in their respective fields.
          They bring their knowledge, experience, and passion to create an engaging learning experience for all our students.
        </p>
        <p>
          Each faculty member is committed to providing personalized guidance and support to help students overcome
          challenges and achieve their goals. Our administrative staff ensures smooth operations and provides timely
          assistance to students.
        </p>
      </div>
    </div>
  );
};

export default About;
