
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import OptimizedImage from '../OptimizedImage';
import maheshKhotProfile from '@/assets/mahesh-khot-profile.jpg';
import atulMadkarProfile from '@/assets/atul-madkar-profile.jpg';
import academyLogo from '@/assets/academy-logo.jpg';

interface ProfileSectionProps {
  profileImages?: {
    maheshKhot: string;
    atulMadkar: string;
    academyLogo: string;
  };
  loading?: boolean;
}

const ProfileSection = ({ profileImages: propImages, loading: propLoading = false }: ProfileSectionProps = {}) => {
  const [profileImages, setProfileImages] = useState({
    maheshKhot: propImages?.maheshKhot || maheshKhotProfile,
    atulMadkar: propImages?.atulMadkar || atulMadkarProfile,
    academyLogo: propImages?.academyLogo || '/lovable-uploads/c735577b-85a5-4e24-a5fc-de37dc760f8b.png'
  });
  const [loading, setLoading] = useState(propLoading);

  useEffect(() => {
    // If profile images were provided as props, use them and skip fetching
    if (propImages) {
      setProfileImages(propImages);
      setLoading(propLoading);
      return;
    }

    // Only fetch if no props provided
    if (!propImages) {
      const fetchProfileImages = async () => {
        try {
          setLoading(true);
          
          // Optimized query - only get what we need
          const { data: profileData, error } = await supabase
            .from('academy_images')
            .select('title, url, category')
            .in('category', ['Profiles', 'Logos'])
            .limit(10); // Limit for performance

          if (error) {
            console.error('Error fetching profile images:', error);
            return;
          }

          console.log('Profile images fetched from database:', profileData);

          if (profileData && profileData.length > 0) {
            const newImages = { ...profileImages };
            
            profileData.forEach(img => {
              const title = img.title?.toLowerCase() || '';
              
              if (img.category === 'Profiles') {
                if (title.includes('mahesh') || title.includes('khot')) {
                  newImages.maheshKhot = img.url;
                } else if (title.includes('atul') || title.includes('madkar')) {
                  newImages.atulMadkar = img.url;
                }
              } else if (img.category === 'Logos') {
                newImages.academyLogo = img.url;
              }
            });

            console.log('Updated profile images:', newImages);
            setProfileImages(newImages);
          }
        } catch (err) {
          console.error('Error in fetchProfileImages:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchProfileImages();
    }
  }, [propImages, propLoading]);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-academy-primary mb-4">Welcome to Aavishkar Career Academy</h2>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        {/* Profile cards in a row - updated for better mobile layout */}
        <div className="w-full flex flex-row justify-between items-center gap-4">
          {/* Left - Mahesh Khot */}
          <div className="bg-white p-3 rounded-lg shadow-md text-center w-1/2">
            <div className="w-24 h-24 mx-auto overflow-hidden rounded-full mb-2">
              {loading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              ) : (
                <OptimizedImage
                  src={profileImages.maheshKhot}
                  alt="श्री. महेश ज्ञानदेव खोत"
                  className="w-full h-full object-cover"
                  fallbackSrc={maheshKhotProfile}
                  loading="lazy"
                />
              )}
            </div>
            <h3 className="text-sm font-semibold text-academy-primary">श्री. महेश ज्ञानदेव खोत</h3>
            <p className="text-xs text-gray-600 mb-1">संस्थापक संचालक</p>
            <a href="tel:+919049137731" className="text-xs text-academy-primary hover:text-academy-secondary">
              +91 9049137731
            </a>
          </div>
          
          {/* Right - Atul Madkar */}
          <div className="bg-white p-3 rounded-lg shadow-md text-center w-1/2">
            <div className="w-24 h-24 mx-auto overflow-hidden rounded-full mb-2">
              {loading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              ) : (
                <OptimizedImage
                  src={profileImages.atulMadkar}
                  alt="श्री. अतुल हिरालाल मडकर"
                  className="w-full h-full object-cover"
                  fallbackSrc={atulMadkarProfile}
                  loading="lazy"
                />
              )}
            </div>
            <h3 className="text-sm font-semibold text-academy-primary">श्री. अतुल हिरालाल मडकर</h3>
            <p className="text-xs text-gray-600 mb-1">संचालक</p>
            <a href="tel:+919890555432" className="text-xs text-academy-primary hover:text-academy-secondary">
              +91 9890555432
            </a>
          </div>
        </div>
      </div>
      
      {/* Text section below the profiles */}
      <div className="text-center max-w-md mx-auto mb-4">
        <h3 className="text-xl font-bold text-academy-primary">Every Dream Needs Mentor</h3>
        <p className="text-sm text-gray-600 mt-2">Download our app and start your success journey today</p>
      </div>
    </div>
  );
};

export default ProfileSection;
