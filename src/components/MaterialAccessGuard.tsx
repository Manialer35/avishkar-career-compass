import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ShoppingCart } from 'lucide-react';
import { useMaterialAccess } from '@/hooks/useMaterialAccess';
import { useAuth } from '@/context/AuthContext';

interface MaterialAccessGuardProps {
  children: React.ReactNode;
}

const MaterialAccessGuard: React.FC<MaterialAccessGuardProps> = ({ children }) => {
  const { materialId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading, material } = useMaterialAccess(materialId || '');

  // Show loading while checking auth and access
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show access denied if user doesn't have access
  if (!hasAccess && material?.ispremium) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This is a premium material. You need to purchase it to access the content.
            </p>
            
            {material && (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{material.title}</h3>
                <p className="text-2xl font-bold text-primary">₹{material.price}</p>
              </div>
            )}
            
            <Button 
              asChild 
              className="w-full"
            >
              <a href={`/purchase/${materialId}`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Purchase Now
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="w-full"
            >
              <a href="/premium-materials">
                View All Materials
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render children if user has access
  return <>{children}</>;
};

export default MaterialAccessGuard;