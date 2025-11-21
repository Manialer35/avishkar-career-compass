
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ClassEvent {
  id: string;
  class_title: string;
  class_description: string;
  class_date: string;
  class_time: string;
  class_price: number;
}

const ClassesSection = () => {
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchEvents() {
      try {
        // Get current date in ISO format
        const today = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('classes')
          .select('id, class_title, class_description, class_date, class_time, class_price')
          .gte('class_date', today)
          .eq('is_active', true)
          .order('class_date', { ascending: true })
          .limit(3); // Limit for performance
          
        if (error) {
          console.error('Error fetching events:', error);
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          setEvents(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
        if (isMounted) setLoading(false);
      }
    }
    
    fetchEvents();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold text-academy-primary mb-4">Online Classes & Events</h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="mb-4">
                Discover our upcoming online classes and events. Enhance your preparation with live sessions from expert instructors.
              </p>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{event.class_title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1">{event.class_description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-academy-primary">
                          {event.class_price > 0 ? `₹${event.class_price}` : 'Free'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(event.class_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{event.class_time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
          </>
        ) : (
          <>
            <p className="mb-4 text-center">
              No upcoming classes or events scheduled at the moment. Check back later for new offerings.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
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
          </>
        )}
      </div>
    </section>
  );
};

export default ClassesSection;
