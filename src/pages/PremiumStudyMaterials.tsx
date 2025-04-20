
import Product, { ProductGrid } from '@/components/ProductPurchase';

const PremiumStudyMaterials = () => {
  const products = [
    {
      id: "1",
      name: "Complete Police Bharti Package",
      description: "Comprehensive study material with mock tests",
      price: 1499,
      imageSrc: "https://via.placeholder.com/350x200/1e3a8a/ffffff?text=Police+Bharti+Package"
    },
    {
      id: "2",
      name: "Advanced Test Series",
      description: "Full-length mock tests with detailed solutions",
      price: 999,
      imageSrc: "https://via.placeholder.com/350x200/3b82f6/ffffff?text=Advanced+Tests"
    },
    {
      id: "3",
      name: "Interview Preparation Kit",
      description: "Guide for interview preparation with mock sessions",
      price: 1299,
      imageSrc: "https://via.placeholder.com/350x200/0284c7/ffffff?text=Interview+Kit"
    },
    {
      id: "4",
      name: "Subject Wise Study Package",
      description: "Detailed subject wise study materials and practice tests",
      price: 1899,
      imageSrc: "https://via.placeholder.com/350x200/1e3a8a/ffffff?text=Subject+Package"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-academy-primary mb-6">Premium Study Materials</h1>
      <ProductGrid products={products} />
    </div>
  );
};

export default PremiumStudyMaterials;
