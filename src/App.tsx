import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Event from "./pages/Event";
import Enquiry from "./pages/Enquiry";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import FreeStudyMaterials from "./pages/FreeStudyMaterials";
import PremiumStudyMaterials from "./pages/PremiumStudyMaterials";
import AdminPanel from "./pages/AdminPanel";
import React from 'react';

const queryClient = new QueryClient();

// Move ProtectedRoute outside of App component to avoid hooks being called conditionally
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Admin route that checks for admin role
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, user } = useAuth();
  
  // Updated to include the new admin email
  const adminEmails = [
    "admin@example.com", 
    "neerajmadkar35@gmail.com",
    "neerajmadkar3535@gmail.com"
  ];
  
  // Check if the user's email is in the list of admin emails
  if (!session || !user?.email || !adminEmails.includes(user.email)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 bg-gray-50">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/about" element={<About />} />
                <Route path="/event" element={<Event />} />
                <Route path="/enquiry" element={<Enquiry />} />
                <Route path="/free-materials" element={<FreeStudyMaterials />} />
                <Route path="/premium-materials" element={<PremiumStudyMaterials />} />
                <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
