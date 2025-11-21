
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, BookOpen, Shield } from 'lucide-react';

interface FolderCardProps {
  folder: {
    id: string;
    name: string;
    description?: string;
    is_premium: boolean;
    materialCount?: number;
  };
  onClick: () => void;
}

const FolderCard = ({ folder, onClick }: FolderCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        folder.is_premium ? 'border-l-4 border-l-academy-red' : 'border-l-4 border-l-academy-primary'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`p-2 rounded-lg ${
            folder.is_premium ? 'bg-academy-red/10' : 'bg-academy-primary/10'
          }`}>
            <Folder 
              size={24} 
              className={folder.is_premium ? 'text-academy-red' : 'text-academy-primary'} 
            />
          </div>
          <span className="line-clamp-1">{folder.name}</span>
          {folder.is_premium && (
            <Shield size={16} className="text-academy-red" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {folder.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{folder.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <BookOpen size={14} />
            <span>{folder.materialCount || 0} materials</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className={`text-xs ${
              folder.is_premium 
                ? 'text-academy-red hover:text-academy-red hover:bg-red-50' 
                : 'text-academy-primary hover:text-academy-primary hover:bg-blue-50'
            }`}
          >
            Browse →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FolderCard;
