
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Edit, Trash, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  time: string;
  price: number;
}

const EventsTab = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 'police-bharti-2025',
      title: 'Police Bharti Special Training 2025',
      description: 'Comprehensive coaching and preparation for Police Recruitment Examinations',
      date: 'Starting from June 15, 2025',
      location: 'Avishkar Career Academy, Main Campus, City Center',
      time: 'Morning Batch: 7:00 AM - 11:00 AM | Evening Batch: 4:00 PM - 8:00 PM',
      price: 4999
    },
    {
      id: 'mpsc-2025',
      title: 'MPSC Exam Preparation 2025',
      description: 'Complete syllabus coverage with expert coaching for MPSC aspirants',
      date: 'Starting from July 10, 2025',
      location: 'Avishkar Career Academy, Online and Offline options',
      time: 'Weekday Batch: 2:00 PM - 6:00 PM | Weekend Batch: 9:00 AM - 5:00 PM',
      price: 8999
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editFormData, setEditFormData] = useState<Event>({
    id: '',
    title: '',
    description: '',
    date: '',
    location: '',
    time: '',
    price: 0
  });
  const { toast } = useToast();

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setEditFormData({...event});
    setIsEditDialogOpen(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      // In a real implementation, you would delete from Supabase here
      // await supabase.from('events').delete().eq('id', selectedEvent.id);
      
      // For now, just remove from local state
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      
      toast({
        title: "Event deleted successfully",
        description: `${selectedEvent.title} has been removed`,
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        variant: "destructive",
        title: "Error deleting event",
        description: "There was a problem deleting the event. Please try again.",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, you would update Supabase here
      // if (selectedEvent) {
      //   await supabase.from('events').update(editFormData).eq('id', selectedEvent.id);
      // } else {
      //   await supabase.from('events').insert([editFormData]);
      // }
      
      // For now, just update local state
      if (selectedEvent) {
        setEvents(events.map(e => e.id === selectedEvent.id ? editFormData : e));
        toast({
          title: "Event updated successfully",
          description: `${editFormData.title} has been updated`,
        });
      } else {
        const newEvent = {
          ...editFormData,
          id: `event-${Date.now()}`
        };
        setEvents([...events, newEvent]);
        toast({
          title: "Event created successfully",
          description: `${editFormData.title} has been created`,
        });
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        variant: "destructive",
        title: "Error saving event",
        description: "There was a problem saving the event. Please try again.",
      });
    } finally {
      setLoading(false);
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      setEditFormData({
        id: '',
        title: '',
        description: '',
        date: '',
        location: '',
        time: '',
        price: 0
      });
    }
  };

  const addNewEvent = () => {
    setSelectedEvent(null);
    setEditFormData({
      id: '',
      title: '',
      description: '',
      date: '',
      location: '',
      time: '',
      price: 0
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Events Management</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage upcoming events and special training programs
          </p>
        </div>
        <Button onClick={addNewEvent} size="sm" className="whitespace-nowrap">
          <Plus size={16} className="mr-1" />
          Add New Event
        </Button>
      </div>

      {loading && !isDeleteDialogOpen && !isEditDialogOpen ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            No events found. Click "Add New Event" to create one.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-3 px-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <div className="flex gap-1 ml-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-red-500"
                      onClick={() => handleDelete(event)}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm text-gray-600">{event.description}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  <span>{event.date}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-semibold">₹{event.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">{event.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title</label>
              <input
                name="title"
                value={editFormData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  name="date"
                  value={editFormData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  name="time"
                  value={editFormData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                name="location"
                value={editFormData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={editFormData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (selectedEvent ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsTab;
