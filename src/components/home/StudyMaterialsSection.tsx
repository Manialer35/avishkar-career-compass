import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Download, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudyMaterialsSection = () => {
  const navigate = useNavigate();

  const studyMaterialsCategories = [
    {
      title: "Free Study Materials",
      description: "Access our comprehensive collection of free study materials",
      icon: BookOpen,
      buttonText: "Browse Free Materials",
      route: "/study-materials",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      features: ["PDF Downloads", "Practice Papers", "Quick References"]
    },
    {
      title: "Premium Materials", 
      description: "Unlock advanced study materials with detailed solutions",
      icon: Lock,
      buttonText: "View Premium",
      route: "/premium-materials",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      features: ["Detailed Solutions", "Video Explanations", "Expert Tips"]
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Study Materials
        </h2>
        <p className="text-muted-foreground">
          Comprehensive study resources for your exam preparation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {studyMaterialsCategories.map((category, index) => (
          <Card 
            key={index}
            className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 overflow-hidden"
          >
            <CardContent className="p-0">
              <div className={`${category.gradient} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <category.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                  </div>
                  
                  <p className="text-white/90 text-sm mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {category.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Download className="h-3 w-3 text-white/70" />
                        <span className="text-white/90">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <Button 
                  onClick={() => navigate(category.route)}
                  className="w-full bg-background text-foreground border border-border hover:bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  variant="outline"
                >
                  {category.buttonText}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudyMaterialsSection;