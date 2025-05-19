
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Class {
  id: string;
  class_title: string;
  class_date: string;
  class_time: string;
  class_price: number;
}

const ClassesSection = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        
        // Get current date in ISO format
        const today = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('classes')
          .select('id, class_title, class_date, class_time, class_price')
          .gte('class_date', today)
          .eq('is_active', true)
          .order('class_date', { ascending: true })
          .limit(3); // Only fetch 3 upcoming classes for the homepage
          
        if (error) {
          throw error;
        }
        
        setClasses(data || []);
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold text-academy-primary mb-4">Online Classes & Events</h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {loading ? (
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : classes.length > 0 ? (
          <div className="space-y-4">
            <p className="mb-4">
              Discover our upcoming online classes and events. Enhance your preparation with live sessions from expert instructors.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {classes.map((classItem) => (
                <Card key={classItem.id} className="overflow-hidden border border-gray-200">
                  <CardHeader className="p-4 bg-gray-50">
                    <CardTitle className="text-base truncate">{classItem.class_title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatDate(classItem.class_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{classItem.class_time}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {classItem.class_price > 0 ? (
                        <span>₹{classItem.class_price.toLocaleString()}</span>
                      ) : (
                        <span className="text-green-600">Free</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                className="bg-academy-primary hover:bg-academy-primary/90 text-white"
                asChild
              >
                <Link to="/online-classes">
                  View Online Classes
                </Link>
              </Button>
              <Button 
                variant="outline"
                className="border-academy-primary text-academy-primary hover:bg-academy-primary/10"
                asChild
              >
                <Link to="/events">
                  Browse Events
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4">
              Discover our upcoming online classes and events. Enhance your preparation with live sessions from expert instructors.
            </p>
            <p className="text-gray-600 italic mb-4">No upcoming classes currently scheduled.</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                className="bg-academy-primary hover:bg-academy-primary/90 text-white"
                asChild
              >
                <Link to="/online-classes">
                  View Online Classes
                </Link>
              </Button>
              <Button 
                variant="outline"
                className="border-academy-primary text-academy-primary hover:bg-academy-primary/10"
                asChild
              >
                <Link to="/events">
                  Browse Events
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClassesSection;
