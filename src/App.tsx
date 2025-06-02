
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import BottomNavigation from "./components/BottomNavigation";
import Home from "./pages/Home";
import About from "./pages/About";
import Event from "./pages/Event";
import OnlineClasses from "./pages/OnlineClasses";
import Enquiry from "./pages/Enquiry";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import StudyMaterials from "./pages/StudyMaterials";
import PremiumStudyMaterials from "./pages/PremiumStudyMaterials";
import AdminPanel from "./pages/AdminPanel";
import UsersManagement from "./pages/UsersManagement";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import { useState } from "react";
import PurchaseProduct from "@/components/payment/PurchaseProduct";

// Navigation hook that needs to be inside Router context
const useAuthNavigation = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (!session && window.location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [session, navigate]);

  return null;
};

// Main Layout now uses the AuthNavigation hook
const MainLayout = () => {
  const location = useLocation();
  const { session } = useAuth();
  
  const mainRoutes = ['/', '/about', '/event', '/enquiry', '/profile', '/events'];
  const policyRoutes = ['/terms-conditions', '/privacy-policy', '/refund-policy', '/shipping-policy'];
  const isMainRoute = mainRoutes.includes(location.pathname) || policyRoutes.includes(location.pathname);
  const showBottomNav = isMainRoute || location.pathname === '/home' 
    || location.pathname === '/study-materials' || location.pathname === '/premium-materials'
    || location.pathname === '/admin';
    
  // Use the auth navigation hook
  useAuthNavigation();
    
  return (
    <div className="flex flex-col min-h-screen bg-academy-primary/5">
      <Navbar />
      <div className="flex-1 bg-gray-50 pb-16">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/event" element={<Event />} />
          <Route path="/events" element={<OnlineClasses />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/study-materials" element={<StudyMaterials />} />
          <Route path="/free-materials" element={<Navigate to="/study-materials" replace />} />
          <Route path="/premium-materials" element={<PremiumStudyMaterials />} />
          <Route path="/purchase/:productId" element={<PurchaseProduct />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          {/* Policy Pages */}
          <Route path="/terms-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

function App() {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/*" element={<MainLayout />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
