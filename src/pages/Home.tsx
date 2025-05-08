
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProfileSection from '../components/home/ProfileSection';
import SyllabusSection from '../components/home/SyllabusSection';
import IntroductionSection from '../components/home/IntroductionSection';
import SuccessStoriesSection from '../components/home/SuccessStoriesSection';
import ClassesSection from '../components/home/ClassesSection';
import EnquirySection from '../components/home/EnquirySection';

const Home = () => {
  // Store profile images
  const [profileImages, setProfileImages] = useState({
    maheshKhot: "https://via.placeholder.com/200x200/1e3a8a/ffffff?text=MK",
    atulMadkar: "https://via.placeholder.com/200x200/1e3a8a/ffffff?text=AM",
    academyLogo: "https://via.placeholder.com/200x200/0284c7/ffffff?text=ACADEMY+APP"
  });

  // Successful candidates images - to be loaded from database
  const [successfulCandidatesImages, setSuccessfulCandidatesImages] = useState([
    "https://via.placeholder.com/350x230/4ade80/000000?text=Success+Story+1",
    "https://via.placeholder.com/350x230/34d399/000000?text=Success+Story+2",
    "https://via.placeholder.com/350x230/2dd4bf/000000?text=Success+Story+3",
    "https://via.placeholder.com/350x230/22d3ee/000000?text=Success+Story+4",
    "https://via.placeholder.com/350x230/38bdf8/000000?text=Success+Story+5",
  ]);

  // Load images from Supabase
  useEffect(() => {
    const fetchImagesFromCategory = async (category: string) => {
      try {
        console.log(`Fetching images for category: ${category}`);
        const { data, error } = await supabase
          .from('academy_images')
          .select('*')
          .eq('category', category);
        
        if (error) {
          console.error(`Error fetching ${category} images:`, error);
          return null;
        }
        
        console.log(`Found ${data?.length || 0} images for ${category}:`, data);
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
          console.log("Setting successful candidates images:", urls);
          setSuccessfulCandidatesImages(urls);
        }
        
        // Fetching profile images
        const profiles = await fetchImagesFromCategory('Profiles');
        if (profiles && profiles.length > 0) {
          const profileMap: Record<string, string> = {};
          
          profiles.forEach((profile: any) => {
            console.log("Processing profile:", profile);
            if (profile.title && profile.title.toLowerCase().includes('mahesh')) {
              profileMap.maheshKhot = profile.url;
            } else if (profile.title && profile.title.toLowerCase().includes('atul')) {
              profileMap.atulMadkar = profile.url;
            }
          });
          
          // Update only if we found images
          if (Object.keys(profileMap).length > 0) {
            console.log("Setting profile images:", profileMap);
            setProfileImages(prev => ({
              ...prev,
              ...profileMap
            }));
          }
        }
        
        // Fetching logo
        const logos = await fetchImagesFromCategory('Logos');
        if (logos && logos.length > 0) {
          const academyLogo = logos.find((logo: any) => 
            logo.title && logo.title.toLowerCase().includes('academy'));
          if (academyLogo) {
            console.log("Setting academy logo:", academyLogo.url);
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
      <ClassesSection />
      <EnquirySection />
    </div>
  );
};

export default Home;
