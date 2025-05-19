
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ImageModal from '@/components/ImageModal';

interface SuccessStoriesSectionProps {
  successfulCandidatesImages?: string[];
}

const SuccessStoriesSection = ({ 
  successfulCandidatesImages: propImages
}: SuccessStoriesSectionProps) => {
  const [images, setImages] = useState<string[]>(propImages || []);
  const [loading, setLoading] = useState(!propImages || propImages.length === 0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    // If images were provided as props, use them and skip fetching
    if (propImages && propImages.length > 0) {
      setImages(propImages);
      setLoading(false);
      return;
    }

    const fetchSuccessStories = async () => {
      try {
        setLoading(true);

        // Fetch success stories from database
        const { data, error } = await supabase
          .from('academy_images')
          .select('url')
          .eq('category', 'Successful Candidates')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching success stories:', error);
          return;
        }

        if (data && data.length > 0) {
          const imageUrls = data.map(item => item.url);
          setImages(imageUrls);
        }
      } catch (err) {
        console.error('Error in fetchSuccessStories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessStories();
  }, [propImages]);

  // If no images and not loading, don't render the component
  if (!loading && images.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-academy-primary mb-4">Our Success Stories</h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="bg-gray-200 animate-pulse w-full h-64"></div>
        </div>
      ) : (
        <div className="relative">
          {/* Image carousel */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 w-max">
              {images.map((imageUrl, index) => (
                <div 
                  key={index} 
                  className="w-64 h-48 flex-shrink-0 rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedImage(imageUrl)}
                >
                  <img 
                    src={imageUrl} 
                    alt={`Success Story ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src = '/placeholder-success.png';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Text overlay */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-700">
              Our students consistently achieve remarkable results. 
              Join us and become part of our success stories!
            </p>
          </div>
        </div>
      )}

      {/* Image modal for enlarging clicked images */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage}
          altText="Success story image"
        />
      )}
    </div>
  );
};

export default SuccessStoriesSection;
