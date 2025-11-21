import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

// Define the interface for a product
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all hover:shadow-md">
      <div className="h-48 overflow-hidden">
        <img 
          src={product.imageSrc} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-academy-primary mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">${product.price.toFixed(2)}</span>
          <Button 
            size="sm" 
            asChild
          >
            <Link to={`/checkout/${product.id}`}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
