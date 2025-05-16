import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Tag, Edit, Trash2, Plus, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

const AdminClassesManagement = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    instructor: '',
    date: '',
    time: '',
    duration: '',
    price: 0,
    tags: [],
    isActive: true
  });

  // Sample data - replace with API calls in production
  useEffect(() => {
    // Simulating API fetch
    const mockClasses = [
      {
        id: "class1",
        title: "Police Bharti Preparation Masterclass",
        description: "Comprehensive overview of the Police Bharti exam pattern and preparation strategy.",
        instructor: "Mahesh Khot",
        date: "2025-05-15",
        time: "18:30",
        duration: "90",
        price: 0,
        tags: ["Free", "Beginner"],
        isActive: true,
        registrations: 45
      },
      {
        id: "class2",
        title: "Advanced Reasoning & Aptitude Workshop",
        description: "In-depth practice session for reasoning puzzles and mathematical aptitude problems.",
        instructor: "Atul Madkar",
        date: "2025-05-20",
        time: "17:00",
        duration: "120",
        price: 299,
        tags: ["Premium", "Advanced"],
        isActive: true,
        registrations: 28
      },
      {
        id: "class3",
        title: "Current Affairs Discussion (Apr-May 2025)",
        description: "Analysis of recent events and their importance for competitive exams.",
        instructor: "Dr. Rajesh Sharma",
        date: "2025-05-25",
        time: "19:00",
        duration: "60",
        price: 199,
        tags: ["Premium", "All Levels"],
        isActive: true,
        registrations: 32
      },
      {
        id: "past1",
        title: "Mock Test Analysis Session",
        description: "Detailed solution discussion for the recent mock test series.",
        instructor: "Atul Madkar",
        date: "2025-04-20",
        time: "17:00",
        duration: "120",
        price: 0,
        tags: ["Free", "All Levels"],
        isActive: false,
        registrations: 78
      },
      {
        id: "past2",
        title: "Interview Preparation Workshop",
        description: "Tips and techniques for cracking the interview round of police recruitment.",
        instructor: "Mahesh Khot",
        date: "2025-04-15",
        time: "18:30",
        duration: "90",
        price: 299,
        tags: ["Premium", "Advanced"],
        isActive: false,
        registrations: 56
      }
    ];
    
    setClasses(mockClasses);
    setFilteredClasses(mockClasses);
  }, []);

  // Filter classes based on search query and active tab
  useEffect(() => {
    let filtered = classes;

    // Filter by tab (all, active, past)
    if (activeTab === 'active') {
      filtered = filtered.filter(c => c.isActive === true);
    } else if (activeTab === 'past') {
      filtered = filtered.filter(c => c.isActive === false);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.instructor.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    setFilteredClasses(filtered);
  }, [classes, searchQuery, activeTab]);

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle adding a new class
  const handleAddClass = () => {
    setIsAdding(true);
    setFormData({
      id: `class${Date.now()}`, // Generate a temporary ID
      title: '',
      description: '',
      instructor: '',
      date: '',
      time: '',
      duration: '',
      price: 0,
      tags: [],
      isActive: true
    });
  };

  // Handle viewing a class
  const handleViewClass = (classItem) => {
    setSelectedClass(classItem);
    setIsViewing(true);
  };

  // Handle editing a class
  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      ...classItem,
      tags: classItem.tags.join(', ')
    });
    setIsEditing(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle switch toggle for isActive
  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      isActive: checked
    });
  };

  // Handle tags input (comma separated)
  const handleTagsChange = (e) => {
    setFormData({
      ...formData,
      tags: e.target.value
    });
  };

  // Save class (both add and edit)
  const handleSaveClass = () => {
    // Process tags from comma-separated string to array
    const processedTags = typeof formData.tags === 'string' 
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : formData.tags;

    const classData = {
      ...formData,
      tags: processedTags,
      registrations: selectedClass?.registrations || 0
    };

    if (isAdding) {
      // Add new class to the array
      setClasses([...classes, classData]);
      toast({
        title: "Class added",
        description: `${classData.title} has been successfully added`
      });
    } else if (isEditing) {
      // Update existing class
      setClasses(classes.map(c => c.id === classData.id ? classData : c));
      toast({
        title: "Class updated",
        description: `${classData.title} has been successfully updated`
      });
    }

    // Close dialogs
    setIsAdding(false);
    setIsEditing(false);
  };

  // Handle confirming class deletion
  const handleConfirmDelete = () => {
    if (selectedClass) {
      setClasses(classes.filter(c => c.id !== selectedClass.id));
      setIsDeleting(false);
      toast({
        title: "Class deleted",
        description: `${selectedClass.title} has been removed`
      });
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClass = (classItem) => {
    setSelectedClass(classItem);
    setIsDeleting(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-academy-primary">Class Management</h1>
        <Button 
          onClick={handleAddClass}
          className="bg-academy-primary hover:bg-academy-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Class
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search classes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="all">All Classes</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">{classItem.title}</TableCell>
                      <TableCell>{classItem.instructor}</TableCell>
                      <TableCell>{formatDate(classItem.date)}</TableCell>
                      <TableCell>
                        {classItem.price === 0 ? (
                          <Badge className="bg-green-500">Free</Badge>
                        ) : (
                          <Badge className="bg-academy-red">₹{classItem.price}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{classItem.registrations}</TableCell>
                      <TableCell>
                        {classItem.isActive ? (
                          <Badge className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="outline">Completed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewClass(classItem)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditClass(classItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClass(classItem)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      No classes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Class Dialog */}
      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-academy-primary">
              {selectedClass?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedClass && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500 block mb-1">Instructor</Label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-academy-primary" />
                    <span>{selectedClass.instructor}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-500 block mb-1">Price</Label>
                  <Badge className={selectedClass.price === 0 ? "bg-green-500" : "bg-academy-red"}>
                    {selectedClass.price === 0 ? "Free" : `₹${selectedClass.price}`}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-gray-500 block mb-1">Date</Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-academy-primary" />
                    <span>{formatDate(selectedClass.date)}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-500 block mb-1">Time</Label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-academy-primary" />
                    <span>{selectedClass.time} ({selectedClass.duration} mins)</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-500 block mb-1">Status</Label>
                  <div className="flex items-center">
                    {selectedClass.isActive ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    <span>{selectedClass.isActive ? "Active" : "Completed"}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-500 block mb-1">Registrations</Label>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-academy-primary" />
                    <span>{selectedClass.registrations}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-500 block mb-1">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedClass.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-gray-500 block mb-1">Description</Label>
                <p className="text-gray-700">{selectedClass.description}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewing(false)}>
              Close
            </Button>
            <Button 
              className="bg-academy-primary hover:bg-academy-primary/90"
              onClick={() => {
                setIsViewing(false);
                handleEditClass(selectedClass);
              }}
            >
              Edit Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Class Dialog */}
      <Dialog 
        open={isAdding || isEditing} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAdding(false);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isAdding ? "Add New Class" : "Edit Class"}
            </DialogTitle>
            <DialogDescription>
              {isAdding 
                ? "Create a new online class or event" 
                : "Update details for this class or event"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    name="title"
                    value={formData.title} 
                    onChange={handleInputChange}
                    placeholder="Enter class title"
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            </div>
            
            <FormItem>
              <FormLabel>Instructor</FormLabel>
              <FormControl>
                <Input 
                  name="instructor"
                  value={formData.instructor} 
                  onChange={handleInputChange}
                  placeholder="Instructor name"
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Price (₹)</FormLabel>
              <FormControl>
                <Input 
                  name="price"
                  type="number"
                  value={formData.price} 
                  onChange={handleInputChange}
                  placeholder="0 for free classes"
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input 
                  name="date"
                  type="date"
                  value={formData.date} 
                  onChange={handleInputChange}
                />
              </FormControl>
            </FormItem>
            
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input 
                    name="time"
                    type="time"
                    value={formData.time} 
                    onChange={handleInputChange}
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel>Duration (mins)</FormLabel>
                <FormControl>
                  <Input 
                    name="duration"
                    type="number"
                    value={formData.duration} 
                    onChange={handleInputChange}
                    placeholder="In minutes"
                  />
                </FormControl>
              </FormItem>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <FormItem>
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input 
                    name="tags"
                    value={formData.tags} 
                    onChange={handleTagsChange}
                    placeholder="e.g. Free, Beginner, Premium"
                  />
                </FormControl>
                <p className="text-sm text-gray-500 mt-1">
                  Separate tags with commas (e.g. Free, Beginner, Advanced)
                </p>
              </FormItem>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter class description"
                    rows={4}
                  />
                </FormControl>
              </FormItem>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Class Status</FormLabel>
                  <FormDescription>
                    {formData.isActive 
                      ? "Class is currently active and visible to users" 
                      : "Class is marked as completed and not visible in upcoming classes"
                    }
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={handleSwitchChange}
                  />
                </FormControl>
              </FormItem>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAdding(false);
              setIsEditing(false);
            }}>
              Cancel
            </Button>
            <Button 
              className="bg-academy-primary hover:bg-academy-primary/90"
              onClick={handleSaveClass}
            >
              {isAdding ? "Add Class" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the class "{selectedClass?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminClassesManagement;
