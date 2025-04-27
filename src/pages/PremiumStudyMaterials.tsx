import { Product, ProductGrid } from '@/components/ProductPurchase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PremiumStudyMaterials = () => {
  const products = [
    {
      id: "1",
      name: "Daily टेस्ट पेपर",
      description: "Daily test papers for one year subscription",
      price: 99,
      imageSrc: "https://via.placeholder.com/350x200/1e3a8a/ffffff?text=Daily+Test+Papers"
    },
    {
      id: "2",
      name: "IMP G.S 5000",
      description: "Important General Studies 5000 Questions",
      price: 49,
      imageSrc: "https://via.placeholder.com/350x200/3b82f6/ffffff?text=GS+5000"
    },
    {
      id: "3",
      name: "IMP G.K ONELINER",
      description: "Important General Knowledge One-liners",
      price: 39,
      imageSrc: "https://via.placeholder.com/350x200/0284c7/ffffff?text=GK+Oneliner"
    },
    {
      id: "4",
      name: "IMP मराठी व्याकरण",
      description: "Important Marathi Grammar guide",
      price: 29,
      imageSrc: "https://via.placeholder.com/350x200/1e3a8a/ffffff?text=Marathi+Grammar"
    },
    {
      id: "5",
      name: "IMP अंकगणित आणि बुद्धिमत्ता",
      description: "Important Mathematics and Aptitude guide",
      price: 29,
      imageSrc: "https://via.placeholder.com/350x200/60a5fa/ffffff?text=Math+Aptitude"
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
        <h1 className="text-2xl font-bold text-academy-primary">Premium Study Materials</h1>
      </div>
      <ProductGrid products={products} />
    </div>
  );
};

export default PremiumStudyMaterials;
