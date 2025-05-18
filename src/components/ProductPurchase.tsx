import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Phone, 
  ArrowRight, 
  ShoppingCart, 
  Check, 
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Product interface shared across components
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
}

// ProductGrid Component - Displays a grid of products with purchase buttons
export const ProductGrid = ({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

// ProductCard Component - Individual product card with purchase button
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-100 overflow-hidden">
        <img 
          src={product.imageSrc} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-academy-primary">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">₹{product.price.toFixed(2)}</span>
          <Link to={`/checkout/${product.id}`}>
            <Button size="sm">
              Purchase <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Product Detail Page Component
export const ProductDetail = ({ product }: { product: Product }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img 
            src={product.imageSrc} 
            alt={product.name} 
            className="w-full rounded-lg shadow-md"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-700 mb-6">{product.description}</p>
          <div className="text-2xl font-bold mb-6">₹{product.price.toFixed(2)}</div>
          <Link to={`/checkout/${product.id}`}>
            <Button size="lg" className="w-full md:w-auto">
              <ShoppingCart className="mr-2 h-5 w-5" /> Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Payment options enum
enum PaymentMethod {
  RAZORPAY = 'razorpay',
  PHONEPE = 'phonepe'
}

// Checkout Component
export const Checkout = ({ product }: { product: Product }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.RAZORPAY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const initiatePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          amount: product.price,
          paymentMethod,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment initialization failed');
      }
      
      // Handle different payment methods
      if (paymentMethod === PaymentMethod.RAZORPAY) {
        openRazorpayCheckout(data.orderId, data.amount, data.currency, data.key);
      } else if (paymentMethod === PaymentMethod.PHONEPE) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment processing error');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to open Razorpay checkout
  const openRazorpayCheckout = (orderId: string, amount: number, currency: string, key: string) => {
    const options = {
      key,
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      name: 'Academy',
      description: `Purchase of ${product.name}`,
      order_id: orderId,
      handler: function(response: any) {
        verifyPayment(response, PaymentMethod.RAZORPAY);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#1e3a8a'
      }
    };
    
    // @ts-ignore - Razorpay would be loaded via script
    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };
  
  // Function to verify payment completion
  const verifyPayment = async (paymentResponse: any, method: PaymentMethod) => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: method,
          paymentResponse,
          productId: product.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }
      
      // Redirect to success page with order details
      window.location.href = `/payment-success?orderId=${data.orderId}`;
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err instanceof Error ? err.message : 'Payment verification error');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="border rounded-lg p-6 mb-6 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="flex items-center mb-4">
          <img 
            src={product.imageSrc} 
            alt={product.name} 
            className="w-16 h-16 object-cover rounded mr-4"
          />
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-gray-500 text-sm">{product.description.substring(0, 60)}...</p>
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>₹{product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total</span>
            <span>₹{product.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
        
        <div className="space-y-3 mb-6">
          <div 
            className={`border rounded-lg p-4 cursor-pointer flex items-center ${
              paymentMethod === PaymentMethod.RAZORPAY ? 'border-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setPaymentMethod(PaymentMethod.RAZORPAY)}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
              paymentMethod === PaymentMethod.RAZORPAY ? 'border-blue-500' : 'border-gray-300'
            }`}>
              {paymentMethod === PaymentMethod.RAZORPAY && (
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              )}
            </div>
            <CreditCard className="mr-3 h-5 w-5 text-gray-600" />
            <span>Razorpay (Credit/Debit Card, UPI, Netbanking)</span>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer flex items-center ${
              paymentMethod === PaymentMethod.PHONEPE ? 'border-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setPaymentMethod(PaymentMethod.PHONEPE)}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
              paymentMethod === PaymentMethod.PHONEPE ? 'border-blue-500' : 'border-gray-300'
            }`}>
              {paymentMethod === PaymentMethod.PHONEPE && (
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              )}
            </div>
            <Phone className="mr-3 h-5 w-5 text-gray-600" />
            <span>PhonePe</span>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <Button 
          className="w-full"
          disabled={loading}
          onClick={initiatePayment}
        >
          {loading ? 'Processing...' : `Pay ₹${product.price.toFixed(2)}`}
          <Lock className="ml-2 h-4 w-4" />
        </Button>
        
        <p className="text-sm text-gray-500 mt-4 text-center">
          Your payment information is processed securely
        </p>
      </div>
    </div>
  );
};

// Payment Success Component
export const PaymentSuccess = ({ orderId }: { orderId: string }) => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">
        Your order #{orderId} has been confirmed and your study material is now available.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/dashboard/materials">
          <Button>
            View My Materials
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
