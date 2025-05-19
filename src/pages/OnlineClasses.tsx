
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Target, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import EnrollmentDialog from '@/components/classes/EnrollmentDialog';

interface ClassType {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  instructor: string;
  level: string;
  price: number;
  category: string;
  capacity?: number;
}

const OnlineClasses = () => {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      console.log('Fetching classes data...');
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('class_date', { ascending: true });

      if (error) {
        console.error('Error fetching classes:', error);
        throw error;
      }

      if (data) {
        console.log('Classes data fetched:', data.length);
        const formattedClasses = data.map(item => ({
          id: item.id,
          title: item.class_title,
          description: item.class_description || '',
          date: new Date(item.class_date).toLocaleDateString(),
          time: item.class_time,
          duration: item.class_duration,
          instructor: item.class_instructor,
          level: item.class_level,
          category: item.class_category,
          price: Number(item.class_price) || 0,
          capacity: item.class_capacity
        }));
        
        setClasses(formattedClasses);
      }
    } catch (error) {
      console.error('Error in fetchClasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (classItem: ClassType) => {
    setSelectedClass(classItem);
    setEnrollDialogOpen(true);
  };

  const renderClassCard = (classItem: ClassType) => {
    return (
      <div 
        key={classItem.id} 
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col"
      >
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-lg text-academy-primary">{classItem.title}</h3>
            <Badge variant="outline" className="bg-academy-secondary/10 text-academy-secondary">
              {classItem.category}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{classItem.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{classItem.date}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>{classItem.time} ({classItem.duration})</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-2" />
              <span>{classItem.instructor}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Target className="h-4 w-4 mr-2" />
              <span>{classItem.level} Level</span>
            </div>
          </div>
        </div>
        
        <div className="p-5 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-academy-primary">
                ₹{classItem.price}
              </span>
              {classItem.capacity && (
                <span className="text-xs text-gray-500">
                  ({classItem.capacity} seats available)
                </span>
              )}
            </div>
            <Button 
              className="whitespace-nowrap"
              variant="default"
              size="sm"
              onClick={() => handleEnrollClick(classItem)}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Enroll Now
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-academy-primary">
        Online Classes & Training Programs
      </h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-6 w-1/4 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No online classes currently available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(classItem => renderClassCard(classItem))}
        </div>
      )}
      
      {selectedClass && (
        <EnrollmentDialog
          open={enrollDialogOpen}
          onClose={() => setEnrollDialogOpen(false)}
          classTitle={selectedClass.title}
          classDate={selectedClass.date}
          classId={selectedClass.id}
          classAmount={selectedClass.price}
        />
      )}
    </div>
  );
};

export default OnlineClasses;
