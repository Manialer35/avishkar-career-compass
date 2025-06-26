
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudyMaterialFolder {
  id: string;
  name: string;
  description?: string;
  is_premium: boolean;
  created_at: string;
  materialCount?: number;
}

export const useFolders = () => {
  const [folders, setFolders] = useState<StudyMaterialFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);

      // Get folders with material counts
      const { data: foldersData, error: foldersError } = await supabase
        .from('study_material_folders')
        .select('*')
        .order('name', { ascending: true });

      if (foldersError) throw foldersError;

      // Get material counts for each folder
      const { data: materialCounts, error: countsError } = await supabase
        .from('study_materials')
        .select('folder_id')
        .not('folder_id', 'is', null);

      if (countsError) throw countsError;

      // Count materials per folder
      const countMap = materialCounts.reduce((acc: Record<string, number>, material) => {
        if (material.folder_id) {
          acc[material.folder_id] = (acc[material.folder_id] || 0) + 1;
        }
        return acc;
      }, {});

      // Combine folders with counts
      const foldersWithCounts = foldersData.map(folder => ({
        ...folder,
        materialCount: countMap[folder.id] || 0
      }));

      setFolders(foldersWithCounts);
    } catch (error: any) {
      console.error('Error fetching folders:', error);
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return {
    folders,
    loading,
    refetchFolders: fetchFolders
  };
};
