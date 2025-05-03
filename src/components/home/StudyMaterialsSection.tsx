
import { Book, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface StudyMaterial {
  title: string;
  description: string;
  link: string;
  price?: string;
}

interface StudyMaterialsSectionProps {
  freeMaterials: StudyMaterial[];
  paidMaterials: StudyMaterial[];
}

const StudyMaterialsSection = ({ freeMaterials, paidMaterials }: StudyMaterialsSectionProps) => {
  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold text-academy-primary mb-6">Study Materials</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-academy-primary">
          <div className="flex items-center mb-4">
            <Book className="h-6 w-6 text-academy-primary mr-2" />
            <h4 className="text-lg font-semibold">Free Study Materials</h4>
          </div>
          
          <div className="space-y-4">
            {freeMaterials.map((material, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md">
                <h5 className="font-semibold">{material.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-academy-primary hover:text-academy-red hover:bg-gray-100"
                  asChild
                >
                  <a href={material.link} className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    Download Now
                  </a>
                </Button>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4 border-academy-primary text-academy-primary hover:bg-academy-light"
            asChild
          >
            <Link to="/free-materials">
              <ExternalLink className="h-4 w-4 mr-1" /> Browse All Free Materials
            </Link>
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-academy-red">
          <div className="flex items-center mb-4">
            <Book className="h-6 w-6 text-academy-red mr-2" />
            <h4 className="text-lg font-semibold">Premium Study Materials</h4>
          </div>
          
          <div className="space-y-4">
            {paidMaterials.map((material, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between">
                  <h5 className="font-semibold">{material.title}</h5>
                  <span className="font-semibold text-academy-red">{material.price}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mt-2 bg-academy-red hover:bg-academy-red/90 text-white"
                  asChild
                >
                  <a href={material.link}>Purchase Now</a>
                </Button>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mt-4 bg-academy-red hover:bg-academy-red/90 text-white"
            asChild
          >
            <Link to="/premium-materials">
              <ExternalLink className="h-4 w-4 mr-1" /> View All Premium Materials
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StudyMaterialsSection;
