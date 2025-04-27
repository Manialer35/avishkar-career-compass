import React from 'react';
import { Button } from '@/components/ui/button';
import GooglePayButton from './GooglePayButton';

interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
}

interface ProductGridProps {
  products: ProductType[];
}

const Product = ({ product }: { product: ProductType }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img 
        src={product.imageSrc} 
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <p className="text-xl font-bold text-academy-primary mb-4">₹{product.price}</p>
      <GooglePayButton amount={product.price} productName={product.name} />
    </div>
  );
};

const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Product;
export { ProductGrid };
