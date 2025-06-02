
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileSectionProps {
  profileImages?: {
    maheshKhot: string;
    atulMadkar: string;
    academyLogo: string;
  };
}

const ProfileSection = ({ profileImages: propImages }: ProfileSectionProps = {}) => {
  const [profileImages, setProfileImages] = useState({
    maheshKhot: propImages?.maheshKhot || '',
    atulMadkar: propImages?.atulMadkar || '',
    academyLogo: propImages?.academyLogo || ''
  });
  const [loading, setLoading] = useState(!propImages);

  useEffect(() => {
    // If profile images were provided as props, use them and skip fetching
    if (propImages) {
      setProfileImages(propImages);
      setLoading(false);
      return;
    }

    const fetchProfileImages = async () => {
      try {
        // Fetch profile images directly from the database table
        const { data: profileData, error: profileError } = await supabase
          .from('academy_images')
          .select('*')
          .in('category', ['Profiles', 'Logos']);

        if (profileError) {
          console.error('Error fetching profile images:', profileError);
          setLoading(false);
          return;
        }

        if (profileData && profileData.length > 0) {
          // Find images based on title matching
          const maheshImage = profileData.find(img => 
            img.title?.toLowerCase().includes('mahesh') || 
            img.title?.toLowerCase().includes('khot')
          );
          
          const atulImage = profileData.find(img => 
            img.title?.toLowerCase().includes('atul') || 
            img.title?.toLowerCase().includes('madkar')
          );
          
          const logoImage = profileData.find(img => 
            img.title?.toLowerCase().includes('logo') || 
            img.title?.toLowerCase().includes('academy')
          );

          const images = {
            maheshKhot: maheshImage?.url || '/placeholder-profile.png',
            atulMadkar: atulImage?.url || '/placeholder-profile.png',
            academyLogo: logoImage?.url || '/placeholder-logo.png'
          };

          setProfileImages(images);
        }
      } catch (err) {
        console.error('Error in fetchProfileImages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileImages();
  }, [propImages]);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-academy-primary mb-4">Welcome to Avishkar Career Academy</h2>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        {/* Profile cards in a row - updated for better mobile layout */}
        <div className="w-full flex flex-row justify-between items-center gap-4">
          {/* Left - Mahesh Khot */}
          <div className="bg-white p-3 rounded-lg shadow-md text-center w-1/2">
            <div className="w-24 h-24 mx-auto overflow-hidden rounded-full mb-2">
              {loading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              ) : (
                <img
                  src={profileImages.maheshKhot}
                  alt="श्री. महेश ज्ञानदेव खोत"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = '/placeholder-profile.png';
                  }}
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
                <img
                  src={profileImages.atulMadkar}
                  alt="श्री. अतुल हिरालाल मडकर"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = '/placeholder-profile.png';
                  }}
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
        <h3 className="text-xl font-bold text-academy-primary">Empowering Dreams, Ensuring Success</h3>
        <p className="text-sm text-gray-600 mt-2">Download our app and start your success journey today</p>
      </div>
    </div>
  );
};

export default ProfileSection;
