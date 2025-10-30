import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalClasses: number;
  totalMaterials: number;
  totalRegistrations: number;
  loading: boolean;
}

const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalClasses: 0,
    totalMaterials: 0,
    totalRegistrations: 0,
    loading: true
  });

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Fetch all stats in parallel
      const [usersResult, classesResult, materialsResult, registrationsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('study_materials').select('id', { count: 'exact', head: true }),
        supabase.from('class_registrations').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalClasses: classesResult.count || 0,
        totalMaterials: materialsResult.count || 0,
        totalRegistrations: registrationsResult.count || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up realtime subscriptions for live data
    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_registrations' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
};

export default useAdminStats;