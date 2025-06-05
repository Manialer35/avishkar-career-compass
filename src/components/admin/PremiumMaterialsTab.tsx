
import { Button } from '@/components/ui/button';
import { Plus, Folder } from 'lucide-react';
import MaterialCard from './MaterialCard';
import FolderManagement from './FolderManagement';
import { Skeleton } from '@/components/ui/skeleton';
import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFolders } from '@/hooks/useFolders';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
  folder_id?: string;
  isUpcoming?: boolean;
}

interface PremiumMaterialsTabProps {
  materials: StudyMaterial[];
  loading: boolean;
  onAddNew: () => void;
  onEdit: (material: StudyMaterial) => void;
  onDelete: (id: string) => void;
}

const PremiumMaterialsTab = ({ materials, loading, onAddNew, onDelete, onEdit }: PremiumMaterialsTabProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [materialType, setMaterialType] = useState<string>('available');
  const { folders, refetchFolders } = useFolders();
  
  const premiumMaterials = materials.filter(material => material.isPremium);
  const premiumFolders = folders.filter(folder => folder.is_premium);
  
  const getFilteredMaterials = () => {
    let filtered = premiumMaterials;
    
    // Filter by type (available/upcoming)
    if (materialType === 'available') {
      filtered = filtered.filter(material => !material.isUpcoming);
    } else if (materialType === 'upcoming') {
      filtered = filtered.filter(material => material.isUpcoming);
    }
    
    // Filter by folder
    if (selectedFolder === 'all') {
      return filtered;
    } else if (selectedFolder === 'no-folder') {
      return filtered.filter(material => !material.folder_id);
    } else {
      return filtered.filter(material => material.folder_id === selectedFolder);
    }
  };
  
  const filteredMaterials = getFilteredMaterials();
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.classList.add('touch-scrolling');
    }
  }, []);
  
  return (
    <div className="overflow-hidden" ref={containerRef}>
      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="folders">Manage Folders</TabsTrigger>
        </TabsList>

        <TabsContent value="folders">
          <FolderManagement 
            isPremium={true} 
            folders={folders}
            onFoldersChange={refetchFolders}
          />
        </TabsContent>

        <TabsContent value="materials">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-semibold">Premium Study Materials</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage premium study materials for purchase (Secure viewing only)
              </p>
            </div>
            <Button onClick={onAddNew} size="sm" className="whitespace-nowrap h-8">
              <Plus size={14} className="mr-1" />
              Add New
            </Button>
          </div>

          {/* Material Type Filter */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={materialType === 'available' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMaterialType('available')}
            >
              Available
            </Button>
            <Button
              variant={materialType === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMaterialType('upcoming')}
            >
              Coming Soon
            </Button>
            <Button
              variant={materialType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMaterialType('all')}
            >
              All
            </Button>
          </div>

          {/* Folder Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedFolder === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFolder('all')}
            >
              All Materials
            </Button>
            <Button
              variant={selectedFolder === 'no-folder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFolder('no-folder')}
            >
              No Folder
            </Button>
            {premiumFolders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFolder(folder.id)}
                className="flex items-center gap-1"
              >
                <Folder size={12} />
                {folder.name}
              </Button>
            ))}
          </div>
          
          <ScrollArea className="h-[60vh] w-full pb-4 -mx-3 px-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-2 sm:p-3">
                    <Skeleton className="h-3 w-3/4 mb-2" />
                    <Skeleton className="h-16 w-full mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-500">
                  {materialType === 'all' 
                    ? "No premium study materials found. Click \"Add New\" to create one."
                    : `No ${materialType} materials found in this ${selectedFolder === 'no-folder' ? 'section' : 'folder'}.`
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 mt-3">
                {filteredMaterials.map(material => (
                  <MaterialCard 
                    key={material.id}
                    material={material}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumMaterialsTab;
