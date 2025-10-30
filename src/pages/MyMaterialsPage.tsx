
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Define the interface for a material with purchase info
interface MaterialWithAccess {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  purchaseDate: string;
  expiresAt: string;
  daysRemaining: number;
}

const MyMaterialsPage = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<MaterialWithAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserMaterials();
  }, []);

  const fetchUserMaterials = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Get user's purchases with material info
      const { data, error } = await supabase
        .from('user_purchases')
        .select(`
          id,
          purchased_at,
          expires_at,
          material_id,
          amount
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (error) {
        throw error;
      }

      // If we got purchase data, fetch the corresponding study materials
      if (data && data.length > 0) {
        const materialsWithAccess: MaterialWithAccess[] = [];
        const now = new Date();
        
        // Process each purchase
        for (const purchase of data) {
          // Get the study material details for this purchase
          const { data: materialData, error: materialError } = await supabase
            .from('study_materials')
            .select('id, title, description, thumbnailurl')
            .eq('id', purchase.material_id)
            .single();
            
          if (materialError || !materialData) {
            console.error(`Error fetching material ${purchase.material_id}:`, materialError);
            continue;
          }
          
          // Calculate days remaining
          const expiryDate = new Date(purchase.expires_at);
          const diffTime = expiryDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          materialsWithAccess.push({
            id: materialData.id,
            title: materialData.title,
            description: materialData.description || "",
            thumbnailUrl: materialData.thumbnailurl || `https://via.placeholder.com/350x200/1e3a8a/ffffff?text=${encodeURIComponent(materialData.title)}`,
            purchaseDate: new Date(purchase.purchased_at).toLocaleDateString(),
            expiresAt: new Date(purchase.expires_at).toLocaleDateString(),
            daysRemaining: diffDays
          });
        }
        
        setMaterials(materialsWithAccess);
      }
    } catch (error) {
      console.error('Error fetching user materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMaterial = (materialId: string) => {
    navigate(`/materials/view/${materialId}`);
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
          <Link to="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-academy-primary">My Study Materials</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading your materials...</div>
      ) : materials.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't purchased any study materials yet.</p>
          <Button onClick={() => navigate('/materials/premium')}>
            Browse Premium Materials
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div key={material.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
              <div className="aspect-video w-full relative overflow-hidden bg-gray-100">
                <img 
                  src={material.thumbnailUrl}
                  alt={material.title}
                  className="object-cover w-full h-full"
                />
                {material.daysRemaining <= 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-bold">Access Expired</p>
                    </div>
                  </div>
                )}
                {material.daysRemaining > 0 && material.daysRemaining <= 7 && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-sm font-medium">
                    Expires Soon
                  </div>
                )}
              </div>
              <div className="p-4 flex-grow">
                <h3 className="font-semibold text-lg mb-1">{material.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.description}</p>
                <div className="text-xs text-gray-500 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span>Purchased:</span>
                    <span>{material.purchaseDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span>{material.expiresAt}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleViewMaterial(material.id)}
                  disabled={material.daysRemaining <= 0}
                  variant={material.daysRemaining <= 0 ? "outline" : "default"}
                >
                  {material.daysRemaining <= 0 ? 'Purchase Again' : 'View Material'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMaterialsPage;
