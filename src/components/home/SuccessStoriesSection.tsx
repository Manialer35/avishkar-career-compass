
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ImageCarousel from '@/components/ImageCarousel';

interface SuccessStoriesSectionProps {
  successfulCandidatesImages?: string[];
}

const SuccessStoriesSection = ({ 
  successfulCandidatesImages: propImages
}: SuccessStoriesSectionProps) => {
  const [images, setImages] = useState<string[]>(propImages || []);
  const [loading, setLoading] = useState(!propImages || propImages.length === 0);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-academy-primary">Our Success Stories</h2>
        {images.length > 0 && (
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {images.length} {images.length === 1 ? 'Story' : 'Stories'}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="bg-gray-200 animate-pulse w-full h-64 rounded-lg"></div>
        </div>
      ) : (
        <>
          <ImageCarousel 
            images={images} 
            useCarouselUI={true}
            title=""
          />
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-700">
              Our students consistently achieve remarkable results. 
              Join us and become part of our success stories!
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SuccessStoriesSection;
