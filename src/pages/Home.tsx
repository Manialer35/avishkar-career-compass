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
    maheshKhot: '/placeholder-profile.png',
    atulMadkar: '/placeholder-profile.png',
    academyLogo: '/placeholder-logo.png'
  });

  // Successful candidates images
  const [successfulCandidatesImages, setSuccessfulCandidatesImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load images from Supabase
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        
        // Fetch all images in one query for better performance
        const { data: allImages, error } = await supabase
          .from('academy_images')
          .select('*');
        
        if (error) {
          console.error('Error fetching images:', error);
          return;
        }

        if (!allImages || allImages.length === 0) {
          console.log('No images found in the database');
          return;
        }

        console.log(`Fetched ${allImages.length} images from database`);
        
        // Process profile images
        const profiles = allImages.filter(img => img.category === 'Profiles');
        const logos = allImages.filter(img => img.category === 'Logos');
        const successStories = allImages.filter(img => img.category === 'Successful Candidates');
        
        // Extract profile images
        const newProfileImages = { ...profileImages };
        
        // Find Mahesh's profile
        const maheshImage = profiles.find(img => 
          img.title?.toLowerCase().includes('mahesh') || 
          img.title?.toLowerCase().includes('khot')
        );
        if (maheshImage) {
          newProfileImages.maheshKhot = maheshImage.url;
        }
        
        // Find Atul's profile
        const atulImage = profiles.find(img => 
          img.title?.toLowerCase().includes('atul') || 
          img.title?.toLowerCase().includes('madkar')
        );
        if (atulImage) {
          newProfileImages.atulMadkar = atulImage.url;
        }
        
        // Find Academy logo
        const logoImage = logos.find(img => 
          img.title?.toLowerCase().includes('academy') || 
          img.title?.toLowerCase().includes('logo')
        );
        if (logoImage) {
          newProfileImages.academyLogo = logoImage.url;
        }
        
        // Update states
        setProfileImages(newProfileImages);
        
        // Extract success stories
        if (successStories && successStories.length > 0) {
          const successUrls = successStories.map(img => img.url);
          setSuccessfulCandidatesImages(successUrls);
        }
        
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchImages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileSection profileImages={profileImages} />
      <SyllabusSection />
      <IntroductionSection />
      {!loading && successfulCandidatesImages.length > 0 ? (
        <SuccessStoriesSection successfulCandidatesImages={successfulCandidatesImages} />
      ) : (
        <div className="my-8 text-center">
          {loading ? (
            <p>Loading success stories...</p>
          ) : (
            <p>No success stories available at the moment.</p>
          )}
        </div>
      )}
      <ClassesSection />
      <EnquirySection />
    </div>
  );
};

export default Home;
