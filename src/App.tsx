import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import PurchaseProduct from '@/components/payment/PurchaseProduct';
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

// Create the MainLayout component that was missing
const MainLayout = () => {
  const location = useLocation();
  const { session } = useAuth();
  
  const mainRoutes = ['/', '/about', '/event', '/enquiry', '/profile', '/events'];
  const isMainRoute = mainRoutes.includes(location.pathname);
  const showBottomNav = isMainRoute || location.pathname === '/home' 
    || location.pathname === '/study-materials' || location.pathname === '/premium-materials'
    || location.pathname === '/admin';
    
  return (
    <div className="flex flex-col min-h-screen bg-academy-primary/5">
      <Navbar />
      <div className="flex-1 bg-gray-50 pb-16">
        <Outlet />
      </div>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
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
const AdminRoute = ({ children }) => {
  const { session, userRole, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!session || userRole?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <ProtectedRoute><Index /></ProtectedRoute>
      },
      {
        path: '/home',
        element: <ProtectedRoute><Home /></ProtectedRoute>
      },
      {
        path: '/profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: '/about',
        element: <About />
      },
      {
        path: '/event',
        element: <Event />
      },
      {
        path: '/events',
        element: <OnlineClasses />
      },
      {
        path: '/enquiry',
        element: <Enquiry />
      },
      {
        path: '/study-materials',
        element: <StudyMaterials />
      },
      {
        path: '/free-materials',
        element: <Navigate to="/study-materials" replace />
      },
      {
        path: '/premium-materials',
        element: <PremiumStudyMaterials />
      },
      {
        path: '/purchase/:productId',
        element: <PurchaseProduct />
      },
      {
        path: '/admin',
        element: <AdminRoute><AdminPanel /></AdminRoute>
      },
      {
        path: '/admin/users',
        element: <AdminRoute><UsersManagement /></AdminRoute>
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  },
  {
    path: '/auth',
    element: <Auth />
  }
]);

function App() {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
