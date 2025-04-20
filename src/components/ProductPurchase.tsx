
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayment } from '@/hooks/usePayment';
import PaymentModal from '@/components/PaymentModal';
import { ShoppingCart } from 'lucide-react';

interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
}

const Product: React.FC<ProductProps> = ({ id, name, description, price, imageSrc }) => {
  const { initiatePayment, isPaymentModalOpen, currentPayment, closePaymentModal, handlePaymentComplete } = usePayment();
  
  const handlePurchase = () => {
    initiatePayment({
      productName: name,
      amount: price
    });
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-video w-full overflow-hidden">
          <img src={imageSrc} alt={name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        </div>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">₹{price}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handlePurchase} className="w-full">
            <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
          </Button>
        </CardFooter>
      </Card>

      {currentPayment && (
        <PaymentModal
          open={isPaymentModalOpen}
          onClose={closePaymentModal}
          amount={currentPayment.amount}
          productName={currentPayment.productName}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};

// ProductGrid component to display multiple products
export const ProductGrid: React.FC<{ products: ProductProps[] }> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Product key={product.id} {...product} />
      ))}
    </div>
  );
};

export default Product;
