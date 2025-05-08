
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
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
import { useState } from "react";

// App content without swipeable behavior
const AppContent = () => {
  const location = useLocation();
  const { session } = useAuth();
  
  const mainRoutes = ['/', '/about', '/event', '/enquiry', '/profile', '/events'];
  const isMainRoute = mainRoutes.includes(location.pathname);
  const showBottomNav = isMainRoute || location.pathname === '/home' 
    || location.pathname === '/study-materials' || location.pathname === '/premium-materials'
    || location.pathname === '/admin';
  
  return (
    <>
      <div className="flex-1 bg-gray-50 pb-16">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/event" element={<Event />} />
          <Route path="/events" element={<OnlineClasses />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/study-materials" element={<StudyMaterials />} />
          <Route path="/free-materials" element={<Navigate to="/study-materials" replace />} />
          <Route path="/premium-materials" element={<PremiumStudyMaterials />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersManagement /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {showBottomNav && <BottomNavigation />}
    </>
  );
};

// Move ProtectedRoute outside of App component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Admin route that checks for admin role
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, userRole, loading } = useAuth();
  
  console.log("AdminRoute check:", { session, userRole, loading });
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!session || userRole?.role !== 'admin') {
    console.log("Access denied to admin route");
    return <Navigate to="/" replace />;
  }

  console.log("Access granted to admin route");
  return <>{children}</>;
};

const App = () => {
  // Create queryClient inside the component
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-academy-primary/5">
              <Navbar />
              <AppContent />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
