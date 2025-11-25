import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import BackButton from '@/components/BackButton';

interface EventType {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  time: string;
}

const Event = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching events data...");
      
      const { data, error } = await supabase
        .from('classes')
        .select('id, class_title, class_description, class_date, class_location, class_time')
        .eq('is_active', true)
        .order('class_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      if (data) {
        console.log("Events data fetched:", data.length);
        const formattedEvents = data.map(item => ({
          id: item.id,
          title: item.class_title,
          description: item.class_description || '',
          date: new Date(item.class_date).toLocaleDateString(),
          location: item.class_location,
          time: item.class_time
        }));
        
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEventCard = (event: EventType) => {
    return (
      <div 
        key={event.id} 
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
      >
        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 text-academy-primary">{event.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{event.date}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>{event.time}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              className="w-full"
              variant="default"
              onClick={() => console.log(`Register for event: ${event.id}`)}
            >
              Register Now
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h1 className="text-2xl font-bold text-center mb-8 text-academy-primary">
        Upcoming Events & Seminars
      </h1>
      
      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All Events</TabsTrigger>
            <TabsTrigger value="webinars" className="flex-1">Webinars</TabsTrigger>
            <TabsTrigger value="workshops" className="flex-1">Workshops</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No upcoming events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => renderEventCard(event))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="webinars" className="mt-6">
          <div className="text-center py-12">
            <p className="text-gray-500">No upcoming webinars found.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="workshops" className="mt-6">
          <div className="text-center py-12">
            <p className="text-gray-500">No upcoming workshops found.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Event;
