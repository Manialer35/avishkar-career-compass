
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassRegistrationDialog from '@/components/classes/ClassRegistrationDialog';

const OnlineClasses = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Sample class/event data - replace with actual data from backend
  const upcomingClasses = [
    {
      id: "class1",
      title: "Police Bharti Preparation Masterclass",
      description: "Comprehensive overview of the Police Bharti exam pattern and preparation strategy.",
      instructor: "Mahesh Khot",
      date: "2025-05-15T18:30:00",
      duration: "90",
      price: 0,
      tags: ["Free", "Beginner"]
    },
    {
      id: "class2",
      title: "Advanced Reasoning & Aptitude Workshop",
      description: "In-depth practice session for reasoning puzzles and mathematical aptitude problems.",
      instructor: "Atul Madkar",
      date: "2025-05-20T17:00:00",
      duration: "120",
      price: 299,
      tags: ["Premium", "Advanced"]
    },
    {
      id: "class3",
      title: "Current Affairs Discussion (Apr-May 2025)",
      description: "Analysis of recent events and their importance for competitive exams.",
      instructor: "Dr. Rajesh Sharma",
      date: "2025-05-25T19:00:00",
      duration: "60",
      price: 199,
      tags: ["Premium", "All Levels"]
    }
  ];
  
  const pastClasses = [
    {
      id: "past1",
      title: "Mock Test Analysis Session",
      description: "Detailed solution discussion for the recent mock test series.",
      instructor: "Atul Madkar",
      date: "2025-04-20T17:00:00",
      duration: "120",
      price: 0,
      tags: ["Free", "All Levels"]
    },
    {
      id: "past2",
      title: "Interview Preparation Workshop",
      description: "Tips and techniques for cracking the interview round of police recruitment.",
      instructor: "Mahesh Khot",
      date: "2025-04-15T18:30:00",
      duration: "90",
      price: 299,
      tags: ["Premium", "Advanced"]
    }
  ];
  
  const handleRegister = (classItem: any) => {
    setSelectedClass(classItem);
    setIsRegistering(true);
  };
  
  const handleEnroll = (classItem: any) => {
    setSelectedClass(classItem);
    // We'll handle this with a payment flow
  };
  
  // Helper function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Helper function to format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const renderUpcomingClassCard = (classItem: any) => (
    <div key={classItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-academy-primary">{classItem.title}</h3>
          {classItem.price === 0 ? (
            <Badge className="bg-green-500">Free</Badge>
          ) : (
            <Badge className="bg-academy-red">₹{classItem.price}</Badge>
          )}
        </div>
        
        <p className="text-gray-600 mb-4">{classItem.description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-academy-primary mr-2" />
            <span className="text-sm">{formatDate(classItem.date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-academy-primary mr-2" />
            <span className="text-sm">{formatTime(classItem.date)} ({classItem.duration} mins)</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-academy-primary mr-2" />
            <span className="text-sm">{classItem.instructor}</span>
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-academy-primary mr-2" />
            <div className="flex gap-1">
              {classItem.tags.map((tag: string, i: number) => (
                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <Button 
          className={classItem.price === 0 
            ? "w-full bg-academy-primary hover:bg-academy-primary/90" 
            : "w-full bg-academy-red hover:bg-academy-red/90"
          }
          onClick={() => classItem.price === 0 ? handleRegister(classItem) : handleEnroll(classItem)}
        >
          {classItem.price === 0 ? "Register Now" : "Enroll Now"}
        </Button>
      </div>
    </div>
  );
  
  const renderPastClassCard = (classItem: any) => (
    <div key={classItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-academy-primary">{classItem.title}</h3>
          {classItem.price === 0 ? (
            <Badge className="bg-green-500">Free</Badge>
          ) : (
            <Badge className="bg-academy-red">₹{classItem.price}</Badge>
          )}
        </div>
        
        <p className="text-gray-600 mb-4">{classItem.description}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-academy-primary mr-2" />
            <span className="text-sm">{formatDate(classItem.date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-academy-primary mr-2" />
            <span className="text-sm">{formatTime(classItem.date)} ({classItem.duration} mins)</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-academy-primary mr-2" />
            <span className="text-sm">{classItem.instructor}</span>
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-academy-primary mr-2" />
            <div className="flex gap-1">
              {classItem.tags.map((tag: string, i: number) => (
                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* No register/enroll button for past classes */}
        <p className="text-center text-sm text-gray-500 italic mt-2">
          This class has already taken place
        </p>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-academy-primary mb-6">Online Classes & Events</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <p className="mb-4">
          Join our online classes and events to enhance your preparation with live instruction from 
          experienced faculty. Whether you're looking for comprehensive subject coverage, targeted practice, 
          or doubt-solving sessions, we've got you covered.
        </p>
        <p>
          Free sessions are available to all registered users, while premium sessions offer in-depth 
          content, personal attention, and specialized preparation techniques.
        </p>
      </div>
      
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
            <TabsTrigger value="past">Past Classes</TabsTrigger>
          </TabsList>
          
          {activeTab === "past" && (
            <Link to="/events/archive">
              <Button variant="link" className="text-academy-primary p-0">
                View Full Archive
              </Button>
            </Link>
          )}
        </div>
        
        <TabsContent value="upcoming" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingClasses.map(renderUpcomingClassCard)}
          </div>
          
          {upcomingClasses.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No upcoming classes scheduled right now.</p>
              <p className="text-gray-500">Check back soon for new classes.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastClasses.map(renderPastClassCard)}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Registration dialog */}
      <ClassRegistrationDialog
        isOpen={isRegistering}
        onClose={() => setIsRegistering(false)}
        classItem={selectedClass}
      />
    </div>
  );
};

export default OnlineClasses;
