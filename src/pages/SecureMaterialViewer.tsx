
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Shield } from 'lucide-react';
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

        // Check if user has purchased this material - use Firebase user ID consistently
        const userId = (user as any)?.uid || user.id || user.email;
        console.log('[SecureMaterialViewer] Checking purchase for user:', userId, 'material:', materialId);
        
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('user_purchases')
          .select('*')
          .eq('material_id', materialId)
          .eq('user_id', userId)
          .order('purchased_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (purchaseError && purchaseError.code !== 'PGRST116') {
          throw purchaseError;
        }

        if (!purchaseData) {
          console.log('[SecureMaterialViewer] No purchase found for user:', userId);
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

        // If all checks pass, set the content URL directly (external URLs like Google Drive)
        if (formattedMaterial.content_url) {
          // For premium materials, the downloadurl contains external links (Google Drive, etc.)
          // We use these directly instead of creating signed URLs
          console.log('[SecureMaterialViewer] Setting content URL for material');
          setContentUrl(formattedMaterial.content_url);
        } else {
          console.log('[SecureMaterialViewer] No content URL available');
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

  // Enhanced anti-screenshot and anti-piracy protection
  useEffect(() => {
    if (contentUrl) {
      // Disable right-click context menu
      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      
      // Disable keyboard shortcuts for screenshots and saving
      const preventKeyboardShortcuts = (e: KeyboardEvent) => {
        // Prevent common screenshot and save shortcuts
        if (
          (e.ctrlKey && ['s', 'p', 'a', 'c', 'x', 'v'].includes(e.key.toLowerCase())) ||
          (e.key === 'PrintScreen') ||
          (e.key === 'F12') ||
          (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
        ) {
          e.preventDefault();
          return false;
        }
      };

      // Blur page when user switches tabs (potential screenshot attempt)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          document.body.style.filter = 'blur(10px)';
        } else {
          document.body.style.filter = 'none';
        }
      };

      // Add CSS to prevent text selection and copying
      const style = document.createElement('style');
      style.textContent = `
        .secure-content {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
          pointer-events: none;
        }
        .secure-content iframe, .secure-content video, .secure-content audio, .secure-content img {
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
      
      document.addEventListener('contextmenu', preventContextMenu);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.body.style.filter = 'none';
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, [contentUrl]);

  const renderContent = () => {
    if (!contentUrl) return null;

    console.log('[SecureMaterialViewer] Rendering content URL:', contentUrl);

    // Check if it's a Google Drive link
    if (contentUrl.includes('drive.google.com')) {
      console.log('[SecureMaterialViewer] Detected Google Drive URL');
      // Extract file ID from Google Drive URL
      const fileIdMatch = contentUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;
      
      if (fileId) {
        // Use Google Drive viewer embed URL
        const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        return (
          <div className="w-full h-screen max-h-[80vh] secure-content">
            <iframe 
              src={embedUrl}
              className="w-full h-full border-0" 
              title={material?.title}
              allow="autoplay"
            />
          </div>
        );
      } else {
        // Fallback: Open in new tab
        return (
          <div className="text-center py-8">
            <p className="mb-4">This material is hosted on Google Drive.</p>
            <Button 
              onClick={() => window.open(contentUrl, '_blank')}
              className="bg-academy-red hover:bg-academy-red/90"
            >
              Open in New Tab
            </Button>
          </div>
        );
      }
    }
    
    // Determine file type from URL for direct file links
    const fileExtension = contentUrl.split('.').pop()?.toLowerCase();
    
    switch(fileExtension) {
      case 'pdf':
        return (
          <div className="w-full h-screen max-h-[80vh] secure-content">
            <iframe 
              src={`${contentUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
              className="w-full h-full border-0" 
              title={material?.title} 
              sandbox="allow-same-origin allow-scripts"
              style={{ pointerEvents: 'none' }}
            />
          </div>
        );
      case 'mp4':
      case 'webm':
      case 'mov':
        return (
          <div className="w-full max-w-3xl mx-auto secure-content">
            <video 
              src={contentUrl} 
              controls 
              controlsList="nodownload nofullscreen noremoteplayback" 
              disablePictureInPicture
              className="w-full" 
              onContextMenu={(e) => e.preventDefault()}
              style={{ pointerEvents: 'auto' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'mp3':
      case 'wav':
        return (
          <div className="w-full max-w-3xl mx-auto secure-content">
            <audio 
              src={contentUrl} 
              controls 
              controlsList="nodownload" 
              className="w-full" 
              onContextMenu={(e) => e.preventDefault()}
              style={{ pointerEvents: 'auto' }}
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
          <div className="w-full max-w-3xl mx-auto secure-content">
            <img 
              src={contentUrl} 
              alt={material?.title} 
              className="w-full" 
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
              style={{ pointerEvents: 'none' }}
            />
          </div>
        );
      default:
        console.log('[SecureMaterialViewer] Unknown file type:', fileExtension);
        // For unknown types or external links, provide an open option
        return (
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-600">Cannot preview this file type directly in the app.</p>
            <Button 
              onClick={() => window.open(contentUrl, '_blank')}
              className="bg-academy-red hover:bg-academy-red/90"
            >
              Open Material
            </Button>
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
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <h2 className="font-medium">{material?.description}</h2>
            <div className="flex items-center text-sm text-orange-600">
              <Shield className="h-4 w-4 mr-1" />
              <span>Protected Content</span>
            </div>
          </div>
          <div className="p-4">
            {renderContent()}
          </div>
          <div className="p-4 bg-gray-50 border-t text-center text-xs text-gray-500">
            This content is protected and cannot be downloaded or shared. Screenshots are disabled for security.
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureMaterialViewer;
