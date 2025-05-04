
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash, File, Image } from 'lucide-react';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
}

interface MaterialCardProps {
  material: StudyMaterial;
  onEdit: (material: StudyMaterial) => void;
  onDelete: (id: string) => void;
}

const MaterialCard = ({ material, onEdit, onDelete }: MaterialCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{material.title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(material)}>
            <Pencil size={16} />
          </Button>
          <Button variant="outline" size="icon" className="text-red-500" onClick={() => onDelete(material.id)}>
            <Trash size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {material.thumbnailUrl && (
          <div className="mb-3">
            <img 
              src={material.thumbnailUrl} 
              alt={`${material.title} thumbnail`} 
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}
        <p className="text-gray-600 mb-2">{material.description}</p>
        <div className="flex flex-wrap justify-between items-center gap-2">
          {material.isPremium ? (
            <p className="font-semibold text-academy-primary">₹{material.price}</p>
          ) : (
            <div></div>
          )}
          <div className="flex items-center gap-2">
            {!material.thumbnailUrl && (
              <span className="text-sm text-gray-500 flex items-center">
                <Image size={14} className="mr-1" /> 
                No thumbnail
              </span>
            )}
            <a href={material.downloadUrl} className="text-academy-primary hover:underline text-sm flex items-center">
              <File size={14} className="mr-1" /> 
              Download Link
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialCard;
