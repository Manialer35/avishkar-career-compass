
import { BookOpen, Users, Trophy, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-academy-primary mb-6">About Avishkar Career Academy</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Our Journey</h3>
        <p className="mb-4">
          Avishkar Career Academy was established with a vision to provide quality education and coaching to students
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
