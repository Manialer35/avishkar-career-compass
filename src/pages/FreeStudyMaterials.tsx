
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FreeStudyMaterials = () => {
  const materials = [
    {
      title: "चालू घडामोडी",
      description: "Latest current affairs and news updates in Marathi",
      downloadUrl: "#",
    },
    {
      title: "weekly टेस्ट पेपर",
      description: "Weekly test papers to practice your knowledge",
      downloadUrl: "#",
    },
    {
      title: "मागील वर्षाचे पेपर",
      description: "Previous years' question papers for practice",
      downloadUrl: "#",
    },
    {
      title: "maths. Formule",
      description: "Essential mathematics formulas for competitive exams",
      downloadUrl: "#",
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-4" 
          asChild
        >
          <Link to="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-academy-primary">Free Study Materials</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-academy-primary hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">{material.title}</h3>
            <p className="text-gray-600 mb-4">{material.description}</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-academy-primary hover:text-academy-red hover:bg-gray-100"
              asChild
            >
              <a href={material.downloadUrl}>
                <Download className="h-4 w-4 mr-2" />
                Download Now
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreeStudyMaterials;
