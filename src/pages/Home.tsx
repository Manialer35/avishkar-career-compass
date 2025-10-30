import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProfileSection from '../components/home/ProfileSection';
import SyllabusSection from '../components/home/SyllabusSection';
import StudyMaterialsSection from '../components/home/StudyMaterialsSection';
import IntroductionSection from '../components/home/IntroductionSection';
import SuccessStoriesSection from '../components/home/SuccessStoriesSection';
import ClassesSection from '../components/home/ClassesSection';
import EnquirySection from '../components/home/EnquirySection';
import maheshKhotProfile from '@/assets/mahesh-khot-profile.jpg';
import atulMadkarProfile from '@/assets/atul-madkar-profile.jpg';
import academyLogo from '@/assets/academy-logo.jpg';

const Home = () => {
  // Optimized image state for better performance
  const [imageData, setImageData] = useState({
    profileImages: {
      maheshKhot: maheshKhotProfile,
      atulMadkar: atulMadkarProfile,
      academyLogo: '/lovable-uploads/c735577b-85a5-4e24-a5fc-de37dc760f8b.png'
    },
    successfulCandidatesImages: [],
    loading: true
  });

  // Memoized profile images to prevent unnecessary re-renders
  const profileImages = useMemo(() => imageData.profileImages, [imageData.profileImages]);
  const successfulCandidatesImages = useMemo(() => imageData.successfulCandidatesImages, [imageData.successfulCandidatesImages]);

  // Single optimized database call with proper error handling
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const fetchImages = async () => {
      try {
        // Set a timeout to prevent hanging
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log('⏰ [Home] Image fetch timeout, using fallback images');
            setImageData(prev => ({ ...prev, loading: false }));
          }
        }, 5000); // 5 second timeout
        
        // Optimized query - fetch only what we need
        const { data: allImages, error } = await supabase
          .from('academy_images')
          .select('title, url, category')
          .in('category', ['Profiles', 'Logos', 'Successful Candidates'])
          .order('created_at', { ascending: false })
          .limit(20); // Reduced limit for faster loading
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('❌ [Home] Error fetching images:', error);
          if (isMounted) {
            setImageData(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        if (!isMounted) return;

        if (!allImages || allImages.length === 0) {
          console.log('📭 [Home] No images found in database');
          setImageData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Process images efficiently
        const newProfileImages = { ...imageData.profileImages };
        const successStories: string[] = [];
        
        allImages.forEach(img => {
          const title = img.title?.toLowerCase() || '';
          
          // Profile image matching
          if (img.category === 'Profiles') {
            if (title.includes('mahesh') || title.includes('khot')) {
              newProfileImages.maheshKhot = img.url;
            } else if (title.includes('atul') || title.includes('madkar')) {
              newProfileImages.atulMadkar = img.url;
            }
          } else if (img.category === 'Logos') {
            newProfileImages.academyLogo = img.url;
          } else if (img.category === 'Successful Candidates' && successStories.length < 6) {
            successStories.push(img.url);
          }
        });

        if (isMounted) {
          setImageData({
            profileImages: newProfileImages,
            successfulCandidatesImages: successStories,
            loading: false
          });
        }
        
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('💥 [Home] Error loading images:', error);
        if (isMounted) {
          setImageData(prev => ({ ...prev, loading: false }));
        }
      }
    };
    
    fetchImages();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array for single load

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileSection profileImages={profileImages} loading={imageData.loading} />
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