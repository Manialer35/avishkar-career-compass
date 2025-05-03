
import ImageCarousel from '../ImageCarousel';

interface SuccessStoriesSectionProps {
  successfulCandidatesImages: string[];
}

const SuccessStoriesSection = ({ successfulCandidatesImages }: SuccessStoriesSectionProps) => {
  return (
    <div className="mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ImageCarousel 
          images={successfulCandidatesImages} 
          direction="right" 
          title="Our Successful Candidates"
          useCarouselUI={true}
        />
      </div>
    </div>
  );
};

export default SuccessStoriesSection;
