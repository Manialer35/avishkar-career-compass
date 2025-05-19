
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

interface Purchase {
  id: string;
  material_id: string;
  user_id: string;
  purchased_at: string;
  expires_at: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  content_url: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  duration_months?: number;
  duration_type?: string;
}

const SecureMaterialViewer = () => {
  const { materialId } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentUrl, setContentUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Please log in to access this material');
          return;
        }

        // Get the material details
        const { data: materialData, error: materialError } = await supabase
          .from('study_materials')
          .select('*')
          .eq('id', materialId)
          .single();

        if (materialError) {
          throw materialError;
        }

        if (!materialData) {
          setError('Study material not found');
          return;
        }

        // Map database fields to our interface
        const formattedMaterial: StudyMaterial = {
          id: materialData.id,
          title: materialData.title,
          description: materialData.description || '',
          content_url: materialData.downloadurl || '',
          thumbnailUrl: materialData.thumbnailurl,
          isPremium: materialData.ispremium,
          duration_months: materialData.duration_months,
          duration_type: materialData.duration_type
        };

        setMaterial(formattedMaterial);

        // Check if user has purchased this material
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('user_purchases')
          .select('*')
          .eq('material_id', materialId)
          .eq('user_id', user.id)
          .order('purchased_at', { ascending: false })
          .limit(1)
          .single();

        if (purchaseError && purchaseError.code !== 'PGRST116') {
          throw purchaseError;
        }

        if (!purchaseData) {
          setError('You have not purchased this material');
          return;
        }

        setPurchase(purchaseData);

        // Check if purchase has expired
        if (purchaseData.expires_at) {
          const expiryDate = new Date(purchaseData.expires_at);
          const now = new Date();
          
          if (now > expiryDate) {
            setError('Your access to this material has expired');
            return;
          }
        }

        // If all checks pass, get the secure URL
        if (formattedMaterial.content_url) {
          const { data: urlData, error: urlError } = await supabase
            .storage
            .from('study_materials')
            .createSignedUrl(formattedMaterial.content_url, 3600); // URL valid for 1 hour

          if (urlError) {
            throw urlError;
          }

          setContentUrl(urlData.signedUrl);
        } else {
          setError('This material has no content available');
        }
      } catch (error) {
        console.error('Error checking material access:', error);
        setError('An error occurred while loading the material');
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      checkAccess();
    }
  }, [materialId]);

  // Add event listeners to prevent download
  useEffect(() => {
    if (contentUrl) {
      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      
      const preventKeyboardShortcuts = (e: KeyboardEvent) => {
        // Prevent Ctrl+S, Ctrl+P, etc.
        if (e.ctrlKey && ['s', 'p', 'a'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          return false;
        }
      };
      
      document.addEventListener('contextmenu', preventContextMenu);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      
      return () => {
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
      };
    }
  }, [contentUrl]);

  const renderContent = () => {
    if (!contentUrl) return null;
    
    // Determine file type from URL
    const fileExtension = contentUrl.split('.').pop()?.toLowerCase();
    
    switch(fileExtension) {
      case 'pdf':
        return (
          <div className="w-full h-screen max-h-[80vh]">
            <iframe 
              src={`${contentUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-full border-0" 
              title={material?.title} 
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        );
      case 'mp4':
      case 'webm':
      case 'mov':
        return (
          <div className="w-full max-w-3xl mx-auto">
            <video 
              src={contentUrl} 
              controls 
              controlsList="nodownload" 
              className="w-full" 
              onContextMenu={(e) => e.preventDefault()}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'mp3':
      case 'wav':
        return (
          <div className="w-full max-w-3xl mx-auto">
            <audio 
              src={contentUrl} 
              controls 
              controlsList="nodownload" 
              className="w-full" 
              onContextMenu={(e) => e.preventDefault()}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="w-full max-w-3xl mx-auto">
            <img 
              src={contentUrl} 
              alt={material?.title} 
              className="w-full" 
              onContextMenu={(e) => e.preventDefault()}
              style={{ pointerEvents: 'none' }}
            />
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p>This file type cannot be previewed securely.</p>
          </div>
        );
    }
  };

  const calculateTimeRemaining = () => {
    if (!purchase || !purchase.expires_at) return null;
    
    // Check if lifetime access
    if (new Date(purchase.expires_at).getFullYear() > 9000) {
      return "Lifetime access";
    }
    
    const expiryDate = new Date(purchase.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} remaining`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-4" 
          asChild
        >
          <Link to="/materials">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-academy-primary flex-grow">
          {material?.title || 'Study Material'}
        </h1>
        {purchase && (
          <div className="text-sm text-orange-600 font-medium">
            {calculateTimeRemaining()}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading material...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={() => navigate('/materials')}>
            Return to Materials
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-medium">{material?.description}</h2>
          </div>
          <div className="p-4">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureMaterialViewer;
