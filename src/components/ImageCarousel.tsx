
import { useState } from 'react';
import ImageModal from './ImageModal';

interface ImageCarouselProps {
  images: string[];
  direction: 'left' | 'right';
}

const ImageCarousel = ({ images, direction }: ImageCarouselProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const animationClass = direction === 'left' ? 'animate-slide-left' : 'animate-slide-right';
  
  return (
    <>
      <div className="carousel-container my-8 overflow-hidden">
        <div className={`flex space-x-6 ${animationClass}`} style={{ width: 'fit-content' }}>
          {images.map((src, index) => (
            <div 
              key={`${index}-original`} 
              className="carousel-slide flex-shrink-0 cursor-pointer"
              onClick={() => setSelectedImage(src)}
            >
              <img 
                src={src} 
                alt={`Carousel image ${index + 1}`} 
                className="w-[380px] h-[250px] object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
          {images.map((src, index) => (
            <div 
              key={`${index}-duplicate`} 
              className="carousel-slide flex-shrink-0 cursor-pointer"
              onClick={() => setSelectedImage(src)}
            >
              <img 
                src={src} 
                alt={`Carousel image ${index + 1}`} 
                className="w-[380px] h-[250px] object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
        altText="Selected carousel image"
      />
    </>
  );
};

export default ImageCarousel;
