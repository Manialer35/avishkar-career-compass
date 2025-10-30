
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash, File, Image, Eye, Shield } from 'lucide-react';

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
      <CardHeader className="flex flex-row items-center justify-between py-2 px-2 sm:px-3">
        <CardTitle className="text-sm line-clamp-1">{material.title}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(material)}>
            <Pencil size={12} />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => onDelete(material.id)}>
            <Trash size={12} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-2 sm:px-3">
        {material.thumbnailUrl && (
          <div className="mb-2">
            <img 
              src={material.thumbnailUrl} 
              alt={`${material.title} thumbnail`} 
              className="w-full h-16 sm:h-20 object-cover rounded-md"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Failed to load material thumbnail:', material.thumbnailUrl);
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
        )}
        <p className="text-gray-600 mb-2 text-xs line-clamp-2">{material.description}</p>
        <div className="flex flex-wrap justify-between items-center gap-1 text-xs">
          {material.isPremium ? (
            <div className="flex items-center gap-1">
              <p className="font-semibold text-academy-primary">₹{material.price}</p>
              <Shield size={10} className="text-orange-500" />
            </div>
          ) : (
            <div></div>
          )}
          <div className="flex items-center gap-2">
            {!material.thumbnailUrl && (
              <span className="text-[10px] text-gray-500 flex items-center">
                <Image size={10} className="mr-0.5" /> 
                No thumbnail
              </span>
            )}
            {material.isPremium ? (
              <span className="text-[10px] text-orange-600 flex items-center">
                <Eye size={10} className="mr-0.5" /> 
                View Only
              </span>
            ) : (
              <a href={material.downloadUrl} className="text-academy-primary hover:underline text-[10px] sm:text-xs flex items-center">
                <File size={10} className="mr-0.5" /> 
                Download
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaterialCard;
