import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProfileSection from '../components/home/ProfileSection';
import SyllabusSection from '../components/home/SyllabusSection';
import StudyMaterialsSection from '../components/home/StudyMaterialsSection';
import IntroductionSection from '../components/home/IntroductionSection';
import SuccessStoriesSection from '../components/home/SuccessStoriesSection';
import ClassesSection from '../components/home/ClassesSection';
import EnquirySection from '../components/home/EnquirySection';

const Home = () => {
  // Consolidated image state for better performance
  const [imageData, setImageData] = useState({
    profileImages: {
      maheshKhot: '/placeholder-profile.png',
      atulMadkar: '/placeholder-profile.png',
      academyLogo: '/placeholder-logo.png'
    },
    successfulCandidatesImages: [],
    loading: true
  });

  // Memoized profile images to prevent unnecessary re-renders
  const profileImages = useMemo(() => imageData.profileImages, [imageData.profileImages]);
  const successfulCandidatesImages = useMemo(() => imageData.successfulCandidatesImages, [imageData.successfulCandidatesImages]);

  // Single optimized database call with image lazy loading
  useEffect(() => {
    let isMounted = true;
    
    const fetchImages = async () => {
      try {
        console.log('Starting to fetch images...');
        
        // Optimized query with only essential fields
        const { data: allImages, error } = await supabase
          .from('academy_images')
          .select('title, url, category')
          .order('created_at', { ascending: false })
          .limit(50); // Limit to prevent excessive data loading
        
        console.log('Image fetch result:', { allImages, error });
        
        if (error) {
          console.error('Error fetching images:', error);
          if (isMounted) {
            setImageData(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        if (!isMounted) return;

        if (!allImages || allImages.length === 0) {
          console.log('No images found in database');
          setImageData(prev => ({ ...prev, loading: false }));
          return;
        }

        console.log(`Found ${allImages.length} images, processing...`);

        // Batch process images for better performance
        const imagesByCategory = allImages.reduce((acc, img) => {
          if (!acc[img.category]) acc[img.category] = [];
          acc[img.category].push(img);
          return acc;
        }, {});

        // Update profile images
        const newProfileImages = { ...imageData.profileImages };
        const profiles = imagesByCategory['Profiles'] || [];
        const logos = imagesByCategory['Logos'] || [];

        profiles.forEach(img => {
          if (img.title?.toLowerCase().includes('mahesh')) {
            newProfileImages.maheshKhot = img.url;
          } else if (img.title?.toLowerCase().includes('atul')) {
            newProfileImages.atulMadkar = img.url;
          }
        });

        if (logos.length > 0) {
          newProfileImages.academyLogo = logos[0].url;
        }

        // Get success stories (limit to first 6 for performance)
        const successStories = (imagesByCategory['Successful Candidates'] || []).slice(0, 6);
        const successUrls = successStories.map(img => img.url);

        if (isMounted) {
          console.log('Setting final image data:', {
            profileImages: newProfileImages,
            successfulCandidatesImages: successUrls,
            imageCount: successUrls.length
          });
          
          setImageData({
            profileImages: newProfileImages,
            successfulCandidatesImages: successUrls,
            loading: false
          });
        }
        
      } catch (error) {
        console.error('Error loading images:', error);
        if (isMounted) {
          setImageData(prev => ({ ...prev, loading: false }));
        }
      }
    };
    
    fetchImages();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array for single load

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileSection profileImages={profileImages} />
      <SyllabusSection />
      <StudyMaterialsSection />
      <IntroductionSection />
      {!imageData.loading && successfulCandidatesImages.length > 0 ? (
        <SuccessStoriesSection successfulCandidatesImages={successfulCandidatesImages} />
      ) : (
        <div className="my-8 text-center">
          {imageData.loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          ) : (
            <p className="text-muted-foreground">No success stories available at the moment.</p>
          )}
        </div>
      )}
      <ClassesSection />
      <EnquirySection />
    </div>
  );
};

export default Home;