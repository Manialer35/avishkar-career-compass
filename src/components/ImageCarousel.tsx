
import { useEffect, useRef } from 'react';

interface ImageCarouselProps {
  images: string[];
  direction: 'left' | 'right';
}

const ImageCarousel = ({ images, direction }: ImageCarouselProps) => {
  const animationClass = direction === 'left' ? 'animate-slide-left' : 'animate-slide-right';
  
  return (
    <div className="carousel-container my-8">
      <div className={`flex space-x-4 ${animationClass}`}>
        {/* Duplicate images to create a seamless loop */}
        {images.map((src, index) => (
          <div key={`${index}-original`} className="carousel-slide flex-shrink-0">
            <img 
              src={src} 
              alt={`Carousel image ${index + 1}`} 
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
          </div>
        ))}
        {/* Duplicate set of images for continuous scrolling */}
        {images.map((src, index) => (
          <div key={`${index}-duplicate`} className="carousel-slide flex-shrink-0">
            <img 
              src={src} 
              alt={`Carousel image ${index + 1}`} 
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
