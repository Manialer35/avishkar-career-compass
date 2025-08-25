import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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
import MaterialAccess from "@/pages/MaterialAccess";
import SecureMaterialViewer from "@/components/SecureMaterialViewer";
import MaterialAccessGuard from "@/components/MaterialAccessGuard";
import PaymentSuccessHandler from "@/components/PaymentSuccessHandler";
import AdminDashboard from "@/pages/AdminDashboard";

// Navigation hook that needs to be inside Router context
const useAuthNavigation = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    const isLoggedIn = Boolean(user);
    if (!isLoggedIn && window.location.pathname !== "/auth") {
      navigate("/auth");
    }
    if (isLoggedIn && window.location.pathname === "/auth") {
      navigate("/");
    }
  }, [user, navigate, loading]);

  return null;
};

// Main Layout now uses the AuthNavigation hook
const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const mainRoutes = ['/', '/about', '/event', '/enquiry', '/profile', '/events', '/online-classes'];
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
          <Route path="/online-classes" element={<OnlineClasses />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/study-materials" element={<StudyMaterials />} />
          <Route path="/free-materials" element={<Navigate to="/study-materials" replace />} />
          <Route path="/premium-materials" element={<PremiumStudyMaterials />} />
          <Route path="/purchase/:productId" element={<PurchaseProduct />} />
          <Route path="/material/:materialId/access" element={
            <MaterialAccessGuard>
              <MaterialAccess />
            </MaterialAccessGuard>
          } />
          <Route path="/secure-material/:materialId" element={
            <MaterialAccessGuard>
              <SecureMaterialViewer />
            </MaterialAccessGuard>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/payment-success" element={<PaymentSuccessHandler />} />
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

// Error boundary for better performance debugging
window.addEventListener("error", (e) => {
  if (process.env.NODE_ENV === 'development') {
    console.error("Global Error:", e.error);
  }
});
window.addEventListener("unhandledrejection", (e) => {
  if (process.env.NODE_ENV === 'development') {
    console.error("Unhandled Promise Rejection:", e.reason);
  }
});

export default App;
