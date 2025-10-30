import React from "react";
import { Navigate } from "react-router-dom";
import { useSecureAdmin } from "@/hooks/useSecureAdmin";
import LoadingSpinner from "@/components/LoadingSpinner";

// Secure admin route component with proper access control
const AdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAdmin, loading } = useSecureAdmin();

  if (loading) return <LoadingSpinner />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
