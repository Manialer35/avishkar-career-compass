
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
    <Card className="shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
        <CardTitle className="text-sm sm:text-base line-clamp-1">{material.title}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(material)}>
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => onDelete(material.id)}>
            <Trash size={14} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-3">
        {material.thumbnailUrl && (
          <div className="mb-2">
            <img 
              src={material.thumbnailUrl} 
              alt={`${material.title} thumbnail`} 
              className="w-full h-24 object-cover rounded-md"
            />
          </div>
        )}
        <p className="text-gray-600 mb-2 text-xs sm:text-sm line-clamp-2">{material.description}</p>
        <div className="flex flex-wrap justify-between items-center gap-2">
          {material.isPremium ? (
            <p className="font-semibold text-academy-primary text-sm">₹{material.price}</p>
          ) : (
            <div></div>
          )}
          <div className="flex items-center gap-2">
            {!material.thumbnailUrl && (
              <span className="text-xs text-gray-500 flex items-center">
                <Image size={12} className="mr-1" /> 
                No thumbnail
              </span>
            )}
            <a href={material.downloadUrl} className="text-academy-primary hover:underline text-xs flex items-center">
              <File size={12} className="mr-1" /> 
              Download
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialCard;
