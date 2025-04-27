import ImageCarousel from '../components/ImageCarousel';
import { Button } from '@/components/ui/button';
import { Book, Download, ExternalLink, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  // Sample image URLs - replace with actual image URLs when available
  const firstCarouselImages = [
    "https://via.placeholder.com/350x230/3b82f6/ffffff?text=Competitive+Exams",
    "https://via.placeholder.com/350x230/1e3a8a/ffffff?text=Top+Faculty",
    "https://via.placeholder.com/350x230/0284c7/ffffff?text=Study+Material",
    "https://via.placeholder.com/350x230/93c5fd/000000?text=Success+Stories",
    "https://via.placeholder.com/350x230/3b82f6/ffffff?text=Coaching+Classes",
  ];

  const secondCarouselImages = [
    "https://via.placeholder.com/350x230/1e3a8a/ffffff?text=Classroom",
    "https://via.placeholder.com/350x230/3b82f6/ffffff?text=Library",
    "https://via.placeholder.com/60a5fa/000000?text=Computer+Lab",
    "https://via.placeholder.com/93c5fd/000000?text=Group+Discussion",
    "https://via.placeholder.com/0284c7/ffffff?text=Workshops",
  ];

  const freeMaterials = [
    { title: "Basic Police Bharti Guide", description: "Introduction to police examination pattern and syllabus", link: "#" },
    { title: "Current Affairs Monthly", description: "Latest current affairs relevant to competitive exams", link: "#" },
    { title: "Basic Aptitude Test Series", description: "Practice questions for quantitative aptitude", link: "#" },
  ];

  const paidMaterials = [
    { title: "Complete Police Bharti Package", description: "Comprehensive study material with mock tests", price: "₹1,499", link: "#" },
    { title: "Advanced Test Series", description: "Full-length mock tests with detailed solutions", price: "₹999", link: "#" },
    { title: "Interview Preparation Kit", description: "Guide for interview preparation with mock sessions", price: "₹1,299", link: "#" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-academy-primary mb-4">Welcome to Avishkar Career Academy</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img
              src="https://via.placeholder.com/200x200/1e3a8a/ffffff?text=MK"
              alt="Mahesh Khot"
              className="w-40 h-40 mx-auto rounded-full mb-4"
            />
            <h3 className="text-xl font-semibold text-academy-primary">Mahesh Khot</h3>
            <p className="text-gray-600">Founder</p>
            <a href="tel:+919049137731" className="text-academy-primary hover:text-academy-secondary">
              +91 9049137731
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img
              src="https://via.placeholder.com/200x200/1e3a8a/ffffff?text=AM"
              alt="Atul Madkar"
              className="w-40 h-40 mx-auto rounded-full mb-4"
            />
            <h3 className="text-xl font-semibold text-academy-primary">Atul Madkar</h3>
            <p className="text-gray-600">Founder</p>
            <a href="tel:+919890555432" className="text-academy-primary hover:text-academy-secondary">
              +91 9890555432
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">
            Avishkar Career Academy is a premier coaching institute dedicated to preparing students for competitive examinations.
            With our experienced faculty, comprehensive study materials, and focused approach, we have helped thousands of students
            achieve their career goals.
          </p>
          
          <p className="mb-4">
            Our specialized programs are designed to provide in-depth knowledge, strategic exam preparation, and continuous assessment
            to ensure that our students excel in their chosen competitive exams.
          </p>
          
          <div className="bg-academy-light p-4 border-l-4 border-academy-primary rounded">
            <h3 className="font-bold text-academy-primary">Our Specialties:</h3>
            <ul className="list-disc ml-5 mt-2">
              <li>Expert faculty with years of teaching experience</li>
              <li>Comprehensive study materials and test series</li>
              <li>Regular practice sessions and mock exams</li>
              <li>Special focus on Police Bharti examination</li>
              <li>Personalized attention to each student</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-xl font-semibold text-academy-primary mb-4">Our Facilities</h3>
        <ImageCarousel images={firstCarouselImages} direction="left" />
        
        <h3 className="text-xl font-semibold text-academy-primary mb-4 mt-8">Campus Gallery</h3>
        <ImageCarousel images={secondCarouselImages} direction="right" />
      </section>

      <section className="mb-10">
        <h3 className="text-xl font-semibold text-academy-primary mb-6">Study Materials</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Materials */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-academy-primary">
            <div className="flex items-center mb-4">
              <Book className="h-6 w-6 text-academy-primary mr-2" />
              <h4 className="text-lg font-semibold">Free Study Materials</h4>
            </div>
            
            <div className="space-y-4">
              {freeMaterials.map((material, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md">
                  <h5 className="font-semibold">{material.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 text-academy-primary hover:text-academy-red hover:bg-gray-100"
                    asChild
                  >
                    <a href={material.link} className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Download Now
                    </a>
                  </Button>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4 border-academy-primary text-academy-primary hover:bg-academy-light"
              asChild
            >
              <Link to="/free-materials">
                <ExternalLink className="h-4 w-4 mr-1" /> Browse All Free Materials
              </Link>
            </Button>
          </div>
          
          {/* Paid Materials */}
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-academy-red">
            <div className="flex items-center mb-4">
              <Book className="h-6 w-6 text-academy-red mr-2" />
              <h4 className="text-lg font-semibold">Premium Study Materials</h4>
            </div>
            
            <div className="space-y-4">
              {paidMaterials.map((material, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between">
                    <h5 className="font-semibold">{material.title}</h5>
                    <span className="font-semibold text-academy-red">{material.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="mt-2 bg-academy-red hover:bg-academy-red/90 text-white"
                    asChild
                  >
                    <a href={material.link}>Purchase Now</a>
                  </Button>
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full mt-4 bg-academy-red hover:bg-academy-red/90 text-white"
              asChild
            >
              <Link to="/premium-materials">
                <ExternalLink className="h-4 w-4 mr-1" /> View All Premium Materials
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-xl font-semibold text-academy-primary mb-4">Quick Enquiry</h3>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">Have a question or interested in our courses? Fill out this form and our team will get back to you soon.</p>
          <Button 
            className="bg-academy-red hover:bg-academy-red/90 text-white w-full sm:w-auto"
            asChild
          >
            <Link to="/enquiry">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
