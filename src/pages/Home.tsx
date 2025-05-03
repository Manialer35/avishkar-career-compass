import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProfileSection from '../components/home/ProfileSection';
import SyllabusSection from '../components/home/SyllabusSection';
import IntroductionSection from '../components/home/IntroductionSection';
import SuccessStoriesSection from '../components/home/SuccessStoriesSection';
import StudyMaterialsSection from '../components/home/StudyMaterialsSection';
import ClassesSection from '../components/home/ClassesSection';
import EnquirySection from '../components/home/EnquirySection';

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

  // Study materials data
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

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileSection profileImages={profileImages} />
      <SyllabusSection />
      <IntroductionSection />
      <SuccessStoriesSection successfulCandidatesImages={successfulCandidatesImages} />
      <StudyMaterialsSection freeMaterials={freeMaterials} paidMaterials={paidMaterials} />
      <ClassesSection />
      <EnquirySection />
    </div>
  );
};

export default Home;
