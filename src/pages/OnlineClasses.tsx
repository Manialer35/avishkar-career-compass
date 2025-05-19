
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Users } from 'lucide-react';
import EnrollmentDialog from './EnrollmentDialog';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ClassItem {
  id: string;
  class_title: string;
  class_description: string;
  class_date: string;
  class_time: string;
  class_duration: string;
  class_price: number;
  class_capacity: number;
  class_category: string;
  class_level: string;
  class_language: string;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
}

function getDateFromNow(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    console.error('Error calculating relative date:', e);
    return '';
  }
}

function ClassesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-24 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function EmptyClassesMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-gray-900">No Classes Available</h3>
      <p className="mt-2 text-gray-500 max-w-md">
        There are currently no upcoming classes scheduled. Please check back later for new class offerings.
      </p>
    </div>
  );
}

export default function OnlineClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        
        // Get current date in ISO format
        const today = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .gte('class_date', today)
          .eq('is_active', true)
          .order('class_date', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setClasses(data || []);
      } catch (err: any) {
        console.error('Error fetching classes:', err);
        setError(err.message || 'Failed to load classes');
        toast({
          title: "Error loading classes",
          description: "There was a problem fetching the classes. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchClasses();
  }, [toast]);

  const handleEnrollClick = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setEnrollmentOpen(true);
  };

  const handleCloseEnrollment = () => {
    setEnrollmentOpen(false);
  };

  const filterBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'maths':
      case 'mathematics':
        return 'bg-blue-100 text-blue-800';
      case 'science':
        return 'bg-green-100 text-green-800';
      case 'english':
        return 'bg-purple-100 text-purple-800';
      case 'hindi':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Online Classes</h1>
        <p className="text-gray-600">Join our live interactive classes with experienced instructors</p>
      </div>
      
      {loading ? (
        <ClassesSkeleton />
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : classes.length === 0 ? (
        <EmptyClassesMessage />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{classItem.class_title}</CardTitle>
                    <CardDescription className="mt-1">{getDateFromNow(classItem.class_date)}</CardDescription>
                  </div>
                  <Badge className={`${filterBadgeColor(classItem.class_category)}`}>
                    {classItem.class_category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">{classItem.class_description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDate(classItem.class_date)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{classItem.class_time} ({classItem.class_duration})</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Capacity: {classItem.class_capacity} students</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t bg-gray-50 px-6 py-3">
                <div className="font-medium">
                  {classItem.class_price > 0 ? (
                    <span>₹{classItem.class_price}</span>
                  ) : (
                    <span className="text-green-600">Free</span>
                  )}
                </div>
                <Button onClick={() => handleEnrollClick(classItem)}>
                  Enroll Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {selectedClass && enrollmentOpen && (
        <EnrollmentDialog
          open={enrollmentOpen}
          onClose={handleCloseEnrollment}
          classTitle={selectedClass.class_title}
          classDate={formatDate(selectedClass.class_date)}
          classId={selectedClass.id}
          price={selectedClass.class_price}
        />
      )}
    </div>
  );
}
