import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileClassesSection from '@/components/mobile/MobileClassesSection';

interface EventType {
  id: string;
  class_title: string;
  class_description: string;
  class_date: string;
  class_time: string;
  class_duration: string;
  class_price: number;
  class_instructor: string;
  class_location: string;
  class_category: string;
}

const Event = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const mobile = useIsMobile();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
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
      
      console.log('Fetched events:', data);
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again later.",
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
  
  const getTimeRemaining = (dateString: string) => {
    try {
      const eventDate = new Date(dateString);
      return formatDistanceToNow(eventDate, { addSuffix: true });
    } catch (e) {
      return '';
    }
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
        <h1 className="text-2xl font-bold text-academy-primary">Upcoming Events</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
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
      ) : events.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Events Scheduled</h3>
          <p className="text-gray-500">There are no upcoming events at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="shadow-lg border-0">
              <CardHeader className="bg-academy-primary/5 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-academy-secondary text-white rounded-full mb-2">
                      {event.class_category}
                    </span>
                    <CardTitle className="text-xl">{event.class_title}</CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-academy-primary font-medium">
                      {event.class_price > 0 ? `₹${event.class_price}` : 'Free'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getTimeRemaining(event.class_date)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600 mb-4">
                  {event.class_description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formatDate(event.class_date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{event.class_time} ({event.class_duration})</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{event.class_location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{event.class_instructor}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link to={`/class-registration/${event.id}`} state={{ classData: event }}>
                    Register Now
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Event;
