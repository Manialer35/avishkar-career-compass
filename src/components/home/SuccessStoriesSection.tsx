
import { useState, useEffect } from 'react';
import ImageCarousel from '../ImageCarousel';
import { supabase } from '@/integrations/supabase/client';

interface SuccessStoriesSectionProps {
  successfulCandidatesImages?: string[];
}

const SuccessStoriesSection = ({ successfulCandidatesImages: propImages }: SuccessStoriesSectionProps = {}) => {
  const [successfulCandidatesImages, setSuccessfulCandidatesImages] = useState<string[]>(propImages || []);
  const [loading, setLoading] = useState(!propImages || propImages.length === 0);

  useEffect(() => {
    // If images were provided as props, use them and skip fetching
    if (propImages && propImages.length > 0) {
      setSuccessfulCandidatesImages(propImages);
      setLoading(false);
      return;
    }

    const fetchSuccessImages = async () => {
      try {
        // Check if images bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets || !buckets.some(bucket => bucket.name === 'images')) {
          // Use placeholder images if bucket doesn't exist
          setSuccessfulCandidatesImages([
            'https://via.placeholder.com/350x230/4ade80/000000?text=Success+Story+1',
            'https://via.placeholder.com/350x230/34d399/000000?text=Success+Story+2',
            'https://via.placeholder.com/350x230/2dd4bf/000000?text=Success+Story+3'
          ]);
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

        // Filter for success story images
        const successImages = files?.filter(file => 
          file.name.toLowerCase().includes('success') || 
          file.name.toLowerCase().includes('candidate') ||
          file.name.toLowerCase().includes('achievement')
        );

        if (successImages && successImages.length > 0) {
          const imageUrls = successImages.map(img => 
            supabase.storage.from('images').getPublicUrl(img.name).data.publicUrl
          );
          setSuccessfulCandidatesImages(imageUrls);
        } else {
          // Fallback to placeholders if no images found
          setSuccessfulCandidatesImages([
            'https://via.placeholder.com/350x230/4ade80/000000?text=Success+Story+1',
            'https://via.placeholder.com/350x230/34d399/000000?text=Success+Story+2',
            'https://via.placeholder.com/350x230/2dd4bf/000000?text=Success+Story+3'
          ]);
        }
      } catch (err) {
        console.error('Error in fetchSuccessImages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessImages();
  }, [propImages]);

  return (
    <div className="mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-academy-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ImageCarousel 
            images={successfulCandidatesImages} 
            direction="right" 
            title="Our Successful Candidates"
            useCarouselUI={true}
          />
        )}
      </div>
    </div>
  );
};

export default SuccessStoriesSection;
