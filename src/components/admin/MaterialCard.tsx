
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash, File } from 'lucide-react';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
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
        <p className="text-gray-600 mb-2">{material.description}</p>
        {material.isPremium ? (
          <div className="flex justify-between items-center">
            <p className="font-semibold text-academy-primary">₹{material.price}</p>
            <a href={material.downloadUrl} className="text-academy-primary hover:underline text-sm flex items-center">
              <File size={14} className="mr-1" /> 
              Download Link
            </a>
          </div>
        ) : (
          <p className="text-sm flex items-center">
            <File size={14} className="mr-1" /> 
            <a href={material.downloadUrl} className="text-academy-primary hover:underline">Download Link</a>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialCard;
