import React, { useEffect, lazy, Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import useBackButtonHandler from "./hooks/useBackButtonHandler";
import Navbar from "./components/Navbar";
import BottomNavigation from "./components/BottomNavigation";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load heavy components for faster initial load
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Event = lazy(() => import("./pages/Event"));
const OnlineClasses = lazy(() => import("./pages/OnlineClasses"));
const Enquiry = lazy(() => import("./pages/Enquiry"));
const Profile = lazy(() => import("./pages/Profile"));
const StudyMaterials = lazy(() => import("./pages/StudyMaterials"));
const PremiumStudyMaterials = lazy(() => import("./pages/PremiumStudyMaterials"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UsersManagement = lazy(() => import("./pages/UsersManagement"));
const SystemSettings = lazy(() => import("./components/admin/SystemSettings"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const MaterialAccessGuard = lazy(() => import("./components/MaterialAccessGuard"));
const PurchaseProduct = lazy(() => import("@/components/payment/PurchaseProduct"));
const MaterialAccess = lazy(() => import("@/pages/MaterialAccess"));
const SecureMaterialViewer = lazy(() => import("@/components/SecureMaterialViewer"));
const PaymentSuccessHandler = lazy(() => import("@/components/PaymentSuccessHandler"));

// Immediately load critical components
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";

// Auth redirect is handled in Auth.tsx - removed from here to avoid duplicate logic

// Main Layout now uses the AuthNavigation hook
const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  useBackButtonHandler();
  
  const mainRoutes = ['/', '/about', '/event', '/enquiry', '/profile', '/events', '/online-classes'];
  const policyRoutes = ['/terms-conditions', '/privacy-policy', '/refund-policy', '/shipping-policy'];
  const isMainRoute = mainRoutes.includes(location.pathname) || policyRoutes.includes(location.pathname);
  const showBottomNav = isMainRoute || location.pathname === '/home' 
    || location.pathname === '/study-materials' || location.pathname === '/premium-materials'
    || location.pathname === '/admin';
    
  return (
    <div className="flex flex-col min-h-screen bg-academy-primary/5">
      <Navbar />
      <div className="flex-1 bg-gray-50 pb-16">
        <Suspense fallback={<LoadingSpinner />}>
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
            <Route path="/admin/users" element={
              <AdminRoute>
                <UsersManagement />
              </AdminRoute>
            } />
            <Route path="/admin/system-settings" element={
              <AdminRoute>
                <SystemSettings />
              </AdminRoute>
            } />
            <Route path="/payment-success" element={<PaymentSuccessHandler />} />
            {/* Policy Pages */}
            <Route path="/terms-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    },
  }));
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/*" element={<MainLayout />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
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
