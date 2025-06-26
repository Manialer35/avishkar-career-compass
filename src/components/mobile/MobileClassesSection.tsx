
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock } from 'lucide-react';

interface ClassEvent {
  id: string;
  class_title: string;
  class_description: string;
  class_date: string;
  class_time: string;
  class_price: number;
}

const MobileClassesSection = () => {
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select('id, class_title, class_description, class_date, class_time, class_price')
        .gte('class_date', today)
        .eq('is_active', true)
        .order('class_date', { ascending: true })
        .limit(5);
        
      if (error) {
        console.error('Error fetching events:', error);
        return;
      }
      
      console.log('Fetched events for mobile:', data);
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Upcoming Classes</h3>
        <div className="bg-white p-4 rounded-md shadow-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Upcoming Classes</h3>
        <div className="bg-white p-4 rounded-md shadow-sm text-center text-gray-500">
          No upcoming classes or events.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Upcoming Classes</h3>
      <div className="bg-white rounded-md shadow-sm">
        {events.map((event) => (
          <div key={event.id} className="p-3 border-b last:border-b-0">
            <h4 className="font-medium text-base">{event.class_title}</h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.class_description}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar size={12} className="mr-1" />
                <span>{formatDate(event.class_date)}</span>
              </div>
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                <span>{event.class_time}</span>
              </div>
              <div className="ml-auto font-medium text-academy-primary">
                {event.class_price > 0 ? `₹${event.class_price}` : 'Free'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileClassesSection;
