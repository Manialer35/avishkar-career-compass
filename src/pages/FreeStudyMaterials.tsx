
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const FreeStudyMaterials = () => {
  const materials = [
    {
      title: "Basic Police Bharti Guide",
      description: "Introduction to police examination pattern and syllabus",
      downloadUrl: "#",
    },
    {
      title: "Current Affairs Monthly",
      description: "Latest current affairs relevant to competitive exams",
      downloadUrl: "#",
    },
    {
      title: "Basic Aptitude Test Series",
      description: "Practice questions for quantitative aptitude",
      downloadUrl: "#",
    },
    {
      title: "General Knowledge Compilation",
      description: "Comprehensive GK notes for competitive exams",
      downloadUrl: "#",
    },
    {
      title: "Previous Year Papers",
      description: "Last 5 years solved question papers",
      downloadUrl: "#",
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-academy-primary mb-6">Free Study Materials</h1>
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
