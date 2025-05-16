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

      // Get user's purchases with material info using a join
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          material_id,
          purchase_date,
          expires_at,
          study_materials (
            id,
            title,
            description,
            thumbnailurl
          )
        `)
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Process and transform the data
        const now = new Date();
        const materialsWithAccess: MaterialWithAccess[] = data.map(item => {
          const expiryDate = new Date(item.expires_at);
          const diffTime = expiryDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            id: item.study_materials.id,
            title: item.study_materials.title,
            description: item.study_materials.description,
            thumbnailUrl: item.study_materials.thumbnailurl || "https://via.placeholder.com/350x200/1e3a8a/ffffff?text=" + encodeURIComponent(item.study_materials.title),
            purchaseDate: new Date(item.purchase_date).toLocaleDateString(),
            expiresAt: new Date(item.expires_at).toLocaleDateString(),
            daysRemaining: diffDays
          };
        });

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
