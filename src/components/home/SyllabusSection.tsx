
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import SyllabusModal from '../SyllabusModal';

const SyllabusSection = () => {
  // State for managing syllabus modals
  const [isBhartiModalOpen, setBhartiModalOpen] = useState(false);
  const [isCombinedModalOpen, setCombinedModalOpen] = useState(false);
  
  return (
    <div className="mb-8">
      {/* Syllabus buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="text-academy-primary border-academy-primary hover:bg-academy-light"
          onClick={() => setBhartiModalOpen(true)}
        >
          <FileText className="h-4 w-4 mr-1" />
          Police Bharti Syllabus
        </Button>
          
        <Button 
          variant="outline"
          className="text-academy-primary border-academy-primary hover:bg-academy-light"
          onClick={() => setCombinedModalOpen(true)}
        >
          <FileText className="h-4 w-4 mr-1" />
          Combined Syllabus
        </Button>
      </div>
      
      {/* Syllabus Modals */}
      <SyllabusModal 
        isOpen={isBhartiModalOpen} 
        onClose={() => setBhartiModalOpen(false)}
        title="Police Bharti Syllabus"
        syllabusType="police"
      />
      
      <SyllabusModal 
        isOpen={isCombinedModalOpen} 
        onClose={() => setCombinedModalOpen(false)}
        title="Combined Examination Syllabus"
        syllabusType="combined"
      />
    </div>
  );
};

export default SyllabusSection;
