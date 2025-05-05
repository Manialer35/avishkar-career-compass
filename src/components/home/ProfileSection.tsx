
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
        // Check if images bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets || !buckets.some(bucket => bucket.name === 'images')) {
          console.log('Images bucket not found');
          setLoading(false);
          return;
        }

        // List all files in images bucket
        const { data: files, error } = await supabase
          .storage
          .from('images')
          .list();

        if (error) {
          console.error('Error fetching images:', error);
          setLoading(false);
          return;
        }

        // Look for profile images
        let maheshImage = files?.find(file => 
          file.name.toLowerCase().includes('mahesh') || 
          file.name.toLowerCase().includes('khot')
        );
        
        let atulImage = files?.find(file => 
          file.name.toLowerCase().includes('atul') || 
          file.name.toLowerCase().includes('madkar')
        );
        
        let logoImage = files?.find(file => 
          file.name.toLowerCase().includes('logo') || 
          file.name.toLowerCase().includes('academy')
        );

        // Get public URLs
        const images = {
          maheshKhot: maheshImage 
            ? supabase.storage.from('images').getPublicUrl(maheshImage.name).data.publicUrl 
            : 'https://via.placeholder.com/200x200/1e3a8a/ffffff?text=MK',
          
          atulMadkar: atulImage 
            ? supabase.storage.from('images').getPublicUrl(atulImage.name).data.publicUrl 
            : 'https://via.placeholder.com/200x200/1e3a8a/ffffff?text=AM',
          
          academyLogo: logoImage 
            ? supabase.storage.from('images').getPublicUrl(logoImage.name).data.publicUrl 
            : 'https://via.placeholder.com/200x200/0284c7/ffffff?text=ACADEMY'
        };

        setProfileImages(images);
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
                  alt="Mahesh Khot"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h3 className="text-sm font-semibold text-academy-primary">Mahesh Khot</h3>
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
                  alt="Atul Madkar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h3 className="text-sm font-semibold text-academy-primary">Atul Madkar</h3>
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
