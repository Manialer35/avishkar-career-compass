import ImageCarousel from '../components/ImageCarousel';
import { Button } from '@/components/ui/button';
import { Book, Download, ExternalLink, Mail, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SyllabusModal from '../components/SyllabusModal';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  // Sample image URLs for first carousel - to be replaced with actual images
  const [firstCarouselImages, setFirstCarouselImages] = useState([
    "https://via.placeholder.com/350x230/3b82f6/ffffff?text=Competitive+Exams",
    "https://via.placeholder.com/350x230/1e3a8a/ffffff?text=Top+Faculty",
    "https://via.placeholder.com/350x230/0284c7/ffffff?text=Study+Material",
    "https://via.placeholder.com/350x230/93c5fd/000000?text=Success+Stories",
    "https://via.placeholder.com/350x230/3b82f6/ffffff?text=Coaching+Classes",
  ]);

  // Successful candidates images - to be loaded from database
  const [successfulCandidatesImages, setSuccessfulCandidatesImages] = useState([
    "https://via.placeholder.com/350x230/4ade80/000000?text=Success+Story+1",
    "https://via.placeholder.com/350x230/34d399/000000?text=Success+Story+2",
    "https://via.placeholder.com/350x230/2dd4bf/000000?text=Success+Story+3",
    "https://via.placeholder.com/350x230/22d3ee/000000?text=Success+Story+4",
    "https://via.placeholder.com/350x230/38bdf8/000000?text=Success+Story+5",
  ]);

  // Store profile images
  const [profileImages, setProfileImages] = useState({
    maheshKhot: "https://via.placeholder.com/200x200/1e3a8a/ffffff?text=MK",
    atulMadkar: "https://via.placeholder.com/200x200/1e3a8a/ffffff?text=AM",
    academyLogo: "https://via.placeholder.com/200x200/0284c7/ffffff?text=ACADEMY+APP"
  });

  // Load images from Supabase
  useEffect(() => {
    const fetchImagesFromCategory = async (category: string) => {
      try {
        const { data, error } = await supabase
          .from('academy_images')
          .select('*')
          .eq('category', category);
        
        if (error) {
          console.error(`Error fetching ${category} images:`, error);
          return null;
        }
        
        return data;
      } catch (error) {
        console.error(`Error in fetchImagesFromCategory for ${category}:`, error);
        return null;
      }
    };
    
    const loadImages = async () => {
      try {
        // Fetching successful candidates images
        const successfulCandidates = await fetchImagesFromCategory('Successful Candidates');
        if (successfulCandidates && successfulCandidates.length > 0) {
          const urls = successfulCandidates.map((img: any) => img.url);
          setSuccessfulCandidatesImages(urls);
        }
        
        // Fetching profile images
        const profiles = await fetchImagesFromCategory('Profiles');
        if (profiles && profiles.length > 0) {
          const profileMap: Record<string, string> = {};
          
          profiles.forEach((profile: any) => {
            if (profile.title.includes('Mahesh Khot')) {
              profileMap.maheshKhot = profile.url;
            } else if (profile.title.includes('Atul Madkar')) {
              profileMap.atulMadkar = profile.url;
            }
          });
          
          // Update only if we found images
          if (Object.keys(profileMap).length > 0) {
            setProfileImages(prev => ({
              ...prev,
              ...profileMap
            }));
          }
        }
        
        // Fetching logo
        const logos = await fetchImagesFromCategory('Logos');
        if (logos && logos.length > 0) {
          const academyLogo = logos.find((logo: any) => logo.title.includes('Academy App'));
          if (academyLogo) {
            setProfileImages(prev => ({
              ...prev,
              academyLogo: academyLogo.url
            }));
          }
        }
        
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };
    
    loadImages();
  }, []);

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

  // State for managing syllabus modals
  const [isBhartiModalOpen, setBhartiModalOpen] = useState(false);
  const [isCombinedModalOpen, setCombinedModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-academy-primary mb-4">Welcome to Avishkar Career Academy</h2>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          {/* Profile cards in a row */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
            {/* Left - Mahesh Khot */}
            <div className="bg-white p-4 rounded-lg shadow-md text-center w-full md:w-1/3">
              <div className="w-32 h-32 mx-auto overflow-hidden rounded-full mb-3">
                <img
                  src={profileImages.maheshKhot}
                  alt="Mahesh Khot"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-academy-primary">Mahesh Khot</h3>
              <a href="tel:+919049137731" className="text-sm text-academy-primary hover:text-academy-secondary">
                +91 9049137731
              </a>
            </div>
            
            {/* Center - Text only */}
            <div className="text-center max-w-md w-full md:w-1/3">
              <h3 className="text-xl font-bold text-academy-primary">Empowering Dreams, Ensuring Success</h3>
              <p className="text-sm text-gray-600 mt-2">Download our app and start your success journey today</p>
            </div>
            
            {/* Right - Atul Madkar */}
            <div className="bg-white p-4 rounded-lg shadow-md text-center w-full md:w-1/3">
              <div className="w-32 h-32 mx-auto overflow-hidden rounded-full mb-3">
                <img
                  src={profileImages.atulMadkar}
                  alt="Atul Madkar"
                  className="w-32 h-32 object-cover rounded-full"
                />
              </div>
              <h3 className="text-lg font-semibold text-academy-primary">Atul Madkar</h3>
              <a href="tel:+919890555432" className="text-sm text-academy-primary hover:text-academy-secondary">
                +91 9890555432
              </a>
            </div>
          </div>
        </div>

        {/* Syllabus buttons moved outside boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button 
            variant="outline" 
            className="text-academy-primary border-academy-primary hover:bg-academy-light"
            onClick={() => setBhartiModalOpen(true)}
          >
            <FileText className="h-4 w-4 mr-1" />
            Police Bharti Syllabus
          </Button>
            
          <Button 
            variant="outline"
            className="text-academy-primary border-academy-primary hover:bg-academy-light"
            onClick={() => setCombinedModalOpen(true)}
          >
            <FileText className="h-4 w-4 mr-1" />
            Combined Syllabus
          </Button>
        </div>

        {/* Introduction Video */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold text-academy-primary mb-4">Academy Introduction</h3>
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg">
            <iframe 
              className="w-full h-96 rounded-lg"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Academy Introduction"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Successful Candidates Carousel */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <ImageCarousel 
            images={successfulCandidatesImages} 
            direction="right" 
            title="Our Successful Candidates"
            useCarouselUI={true}
          />
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
        <h3 className="text-xl font-semibold text-academy-primary mb-6">Study Materials</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <h3 className="text-xl font-semibold text-academy-primary mb-4">Online Classes & Events</h3>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">
            Discover our upcoming online classes and events. Enhance your preparation with live sessions from expert instructors.
          </p>
          <Button 
            className="bg-academy-primary hover:bg-academy-primary/90 text-white"
            asChild
          >
            <Link to="/events">
              View Upcoming Classes & Events
            </Link>
          </Button>
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
      
      {/* Syllabus Modals */}
      <SyllabusModal 
        isOpen={isBhartiModalOpen} 
        onClose={() => setBhartiModalOpen(false)}
        title="Police Bharti Syllabus"
        syllabusType="police"
      />
      
      <SyllabusModal 
        isOpen={isCombinedModalOpen} 
        onClose={() => setCombinedModalOpen(false)}
        title="Combined Examination Syllabus"
        syllabusType="combined"
      />
    </div>
  );
};

export default Home;
