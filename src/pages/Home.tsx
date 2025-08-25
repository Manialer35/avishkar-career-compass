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
        console.log('🖼️ [Home] Starting to fetch images from Supabase...');
        
        // Add a small delay to ensure Supabase client is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Optimized query with only essential fields
        const { data: allImages, error } = await supabase
          .from('academy_images')
          .select('title, url, category')
          .order('created_at', { ascending: false })
          .limit(50); // Limit to prevent excessive data loading
        
        console.log('🖼️ [Home] Supabase response:', { 
          imageCount: allImages?.length || 0, 
          error: error?.message || 'none',
          hasImages: !!allImages
        });
        
        if (error) {
          console.error('❌ [Home] Error fetching images:', error);
          if (isMounted) {
            setImageData(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        if (!isMounted) {
          console.log('🚫 [Home] Component unmounted, skipping image processing');
          return;
        }

        if (!allImages || allImages.length === 0) {
          console.log('📭 [Home] No images found in database');
          setImageData(prev => ({ ...prev, loading: false }));
          return;
        }

        console.log(`✅ [Home] Found ${allImages.length} images, processing by category...`);

        // Batch process images for better performance
        const imagesByCategory = allImages.reduce((acc, img) => {
          if (!acc[img.category]) acc[img.category] = [];
          acc[img.category].push(img);
          return acc;
        }, {} as Record<string, any[]>);

        console.log('📂 [Home] Images by category:', Object.keys(imagesByCategory).map(cat => 
          `${cat}: ${imagesByCategory[cat].length}`
        ).join(', '));

        // Update profile images
        const newProfileImages = { ...imageData.profileImages };
        const profiles = imagesByCategory['Profiles'] || [];
        const logos = imagesByCategory['Logos'] || [];

        console.log('👥 [Home] Processing profiles:', profiles.map(p => p.title));
        console.log('🏢 [Home] Processing logos:', logos.map(l => l.title));

        profiles.forEach(img => {
          console.log(`🔍 [Home] Checking profile: "${img.title}"`);
          if (img.title?.toLowerCase().includes('mahesh')) {
            newProfileImages.maheshKhot = img.url;
            console.log('✅ [Home] Set Mahesh image:', img.url);
          } else if (img.title?.toLowerCase().includes('atul')) {
            newProfileImages.atulMadkar = img.url;
            console.log('✅ [Home] Set Atul image:', img.url);
          }
        });

        if (logos.length > 0) {
          newProfileImages.academyLogo = logos[0].url;
          console.log('✅ [Home] Set academy logo:', logos[0].url);
        }

        // Get success stories (limit to first 6 for performance)
        const successStories = (imagesByCategory['Successful Candidates'] || []).slice(0, 6);
        const successUrls = successStories.map(img => img.url);

        console.log('🏆 [Home] Success stories found:', successUrls.length);

        if (isMounted) {
          console.log('🎯 [Home] Setting final image data:', {
            profileImages: newProfileImages,
            successCount: successUrls.length,
            allImagesLoaded: true
          });
          
          setImageData({
            profileImages: newProfileImages,
            successfulCandidatesImages: successUrls,
            loading: false
          });
          
          console.log('✅ [Home] Image data successfully updated!');
        }
        
      } catch (error) {
        console.error('💥 [Home] Unexpected error loading images:', error);
        if (isMounted) {
          setImageData(prev => ({ ...prev, loading: false }));
        }
      }
    };
    
    // Start fetching immediately
    fetchImages();
    
    return () => {
      isMounted = false;
      console.log('🧹 [Home] Cleanup: Component unmounting');
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