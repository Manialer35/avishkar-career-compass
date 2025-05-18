import { Routes, Route, BrowserRouter } from 'react-router-dom';
import PremiumStudyMaterials from '@/pages/PremiumStudyMaterials';
import SecureMaterialViewer from '@/pages/SecureMaterialViewer';
import MyMaterialsPage from '@/pages/MyMaterialsPage';
import { createBrowserRouter } from 'react-router-dom';
import PremiumStudyMaterials from './pages/PremiumStudyMaterials';
import ProductCheckout from './pages/ProductCheckout';
import MaterialAccess from './pages/MaterialAccess';
import SuccessPage from './pages/SuccessPage';
// Import other components/pages as needed

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Premium materials routes */}
        <Route path="/materials/premium" element={<PremiumStudyMaterials />} />
        <Route path="/materials/view/:materialId" element={<SecureMaterialViewer />} />
        <Route path="/materials/my" element={<MyMaterialsPage />} />
        {
          path: '/checkout/:productId',
          element: <ProductCheckout />,
        },
        {
          path: '/material/:productId/access',
          element: <MaterialAccess />,
        },
        {
          path: '/payment-success/:productId',
          element: <SuccessPage />,
        },
        
        {/* Other routes */}
        {/* ... */}
      </Routes>
    </BrowserRouter>
  );
};

// Placeholder components for illustration
const HomePage = () => <div>Home Page</div>;
const LoginPage = () => <div>Login Page</div>;

export default AppRoutes;
