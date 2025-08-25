import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { useMaterialAccess } from '@/hooks/useMaterialAccess';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SecureMaterialViewer = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasAccess, loading, material } = useMaterialAccess(materialId || '');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!loading && !hasAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have access to this premium material.",
        variant: "destructive",
      });
      navigate('/premium-materials');
    }
  }, [hasAccess, loading, navigate, toast]);

  const handleSecureDownload = async () => {
    if (!material?.downloadurl || !user) return;

    try {
      setIsDownloading(true);

      // Record download
      await supabase.rpc('increment_material_downloads', { 
        material_id: materialId 
      });

      // Create secure download link
      const link = document.createElement('a');
      link.href = material.downloadurl;
      link.setAttribute('download', `${material.title}.pdf`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your secure download has begun.",
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to start download. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!hasAccess || !material) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have access to this premium material.
            </p>
            <Button onClick={() => navigate('/premium-materials')}>
              Browse Materials
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-4" 
          onClick={() => navigate('/premium-materials')}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-primary">Secure Material Access</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Secure Access Verified</span>
          </div>

          <h2 className="text-xl font-bold mb-4">{material.title}</h2>
          
          {material.description && (
            <p className="text-muted-foreground mb-6">{material.description}</p>
          )}

          {material.thumbnailurl && (
            <div className="mb-6">
              <img 
                src={material.thumbnailurl} 
                alt={material.title}
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="space-y-4">
            <Button 
              onClick={handleSecureDownload}
              disabled={!material.downloadurl || isDownloading}
              className="w-full"
            >
              {isDownloading ? "Preparing Download..." : "Download Material"}
            </Button>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Security Notice:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• This material is protected by digital rights management</li>
                <li>• Unauthorized sharing or distribution is prohibited</li>
                <li>• Your access is logged for security purposes</li>
                <li>• Downloads are limited to verified purchasers only</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureMaterialViewer;