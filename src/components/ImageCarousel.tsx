
import { useState } from 'react';
import ImageModal from './ImageModal';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ImageCarouselProps {
  images: string[];
  direction?: 'left' | 'right';
  title?: string;
  useCarouselUI?: boolean;
}

const ImageCarousel = ({ images, direction = 'left', title, useCarouselUI = false }: ImageCarouselProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const animationClass = direction === 'left' ? 'animate-slide-left' : 'animate-slide-right';
  
  // If using Carousel UI component
  if (useCarouselUI) {
    return (
      <>
        <div className="w-full my-6">
          {title && (
            <h3 className="text-xl font-semibold text-academy-primary mb-4">{title}</h3>
          )}
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((src, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div 
                    className="cursor-pointer h-full"
                    onClick={() => setSelectedImage(src)}
                  >
                    <img 
                      src={src} 
                      alt={`Carousel image ${index + 1}`} 
                      className="w-full h-[250px] object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage || ''}
          altText="Selected carousel image"
        />
      </>
    );
  }

  // Original animated carousel
  return (
    <>
      <div className="carousel-container my-8 overflow-hidden">
        {title && (
          <h3 className="text-xl font-semibold text-academy-primary mb-4">{title}</h3>
        )}
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
