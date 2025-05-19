
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { isMobile } from '@/hooks/use-mobile';
import MobileClassesSection from '@/components/mobile/MobileClassesSection';

interface ClassItem {
  id: string;
  class_title: string;
  class_description: string;
  class_date: string;
  class_time: string;
  class_duration: string;
  class_location: string;
  class_instructor: string;
  class_price: number;
  class_capacity: number;
  is_active: boolean;
  class_category: string;
  class_level: string;
}

const OnlineClasses = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const mobile = isMobile();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);

      // Get current date in ISO format to filter only upcoming classes
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

      console.log('Fetched classes:', data);
      setClasses(data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast({
        title: "Error",
        description: "Failed to load classes. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleEnrollClick = (classItem: ClassItem) => {
    navigate(`/class-registration/${classItem.id}`, { 
      state: { classData: classItem } 
    });
  };

  // If mobile, render the mobile-specific component
  if (mobile) {
    return <MobileClassesSection />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-4" asChild>
          <Link to="/">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-academy-primary">Online Classes</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Classes Scheduled</h3>
          <p className="text-gray-500">There are no upcoming classes at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-academy-primary/5">
                <CardTitle className="text-xl">{classItem.class_title}</CardTitle>
                <CardDescription className="flex items-center">
                  <span className="bg-academy-primary text-white text-xs px-2 py-0.5 rounded">
                    {classItem.class_category}
                  </span>
                  <span className="ml-2 text-gray-600 text-xs px-2 py-0.5 bg-gray-100 rounded">
                    {classItem.class_level} Level
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {classItem.class_description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(classItem.class_date)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {classItem.class_time} ({classItem.class_duration})
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {classItem.class_location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {classItem.class_instructor}
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="font-semibold text-lg">
                    {classItem.class_price > 0 ? `₹${classItem.class_price}` : 'Free'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  className="w-full"
                  onClick={() => handleEnrollClick(classItem)}
                >
                  Enroll Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnlineClasses;
