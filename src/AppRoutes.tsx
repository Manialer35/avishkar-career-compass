import { Routes, Route, BrowserRouter } from 'react-router-dom';
import PremiumStudyMaterials from '@/pages/PremiumStudyMaterials';
import SecureMaterialViewer from '@/pages/SecureMaterialViewer';
import MyMaterialsPage from '@/pages/MyMaterialsPage';
import ProductCheckout from '@/pages/ProductCheckout';
import MaterialAccess from '@/pages/MaterialAccess';
import SuccessPage from '@/components/SuccessPage';
import Event from './pages/Event';
import OnlineClasses from './pages/OnlineClasses';
import Auth from './pages/Auth';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PurchaseProduct from './components/payment/PurchaseProduct';

// ScrollToTop component to ensure page scrolls to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Auth />} />
        
        {/* Premium materials routes */}
        <Route path="/materials/premium" element={<PremiumStudyMaterials />} />
        <Route path="/materials/view/:materialId" element={<SecureMaterialViewer />} />
        <Route path="/materials/my" element={<MyMaterialsPage />} />
        <Route path="/checkout/:productId" element={<ProductCheckout />} />
        <Route path="/purchase/:productId" element={<PurchaseProduct />} />
        <Route path="/material/:productId/access" element={<MaterialAccess />} />
        <Route path="/payment-success/:productId" element={<SuccessPage />} />
        <Route path="/events" element={<Event />} />
        <Route path="/online-classes" element={<OnlineClasses />} />
        
        {/* 404 catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Placeholder components for illustration
const HomePage = () => <div>Home Page</div>;
const LoginPage = () => <div>Login Page</div>;

export default AppRoutes;
