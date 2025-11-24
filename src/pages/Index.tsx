import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Home from './Home';
import LoadingSpinner from '@/components/LoadingSpinner';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect happens in useEffect, show loading briefly
  if (!user) {
    return <LoadingSpinner />;
  }

  return <Home />;
};

export default Index;
