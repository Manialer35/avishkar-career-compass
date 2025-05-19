import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardHeader,
  HoverCardTitle,
} from "@/components/ui/hover-card"
import {
  CardHeader as ShadCardHeader,
  CardTitle as ShadCardTitle,
  CardDescription as ShadCardDescription,
  CardContent as ShadCardContent,
  CardFooter as ShadCardFooter,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Icons } from "@/components/Icons"
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Define a schema for class data validation
const classSchema = z.object({
  class_title: z.string().min(2, {
    message: "Class title must be at least 2 characters.",
  }),
  class_description: z.string().min(10, {
    message: "Class description must be at least 10 characters.",
  }),
  class_date: z.date(),
  class_time: z.string().min(5, {
    message: "Please select a valid time.",
  }),
  class_duration: z.string().min(1, {
    message: "Class duration must be specified.",
  }),
  class_price: z.number().min(0, {
    message: "Price must be a non-negative number.",
  }),
  class_capacity: z.number().min(1, {
    message: "Capacity must be at least 1.",
  }),
  class_category: z.string().min(2, {
    message: "Class category must be at least 2 characters.",
  }),
  class_level: z.string().min(2, {
    message: "Class level must be at least 2 characters.",
  }),
  class_language: z.string().min(2, {
    message: "Class language must be at least 2 characters.",
  }),
  class_instructor: z.string().min(2, {
    message: "Class instructor must be at least 2 characters.",
  }),
  class_location: z.string().min(2, {
    message: "Class location must be at least 2 characters.",
  }),
  class_materials: z.string().optional(),
  is_active: z.boolean().default(true),
});

// Define a type for the form values based on the schema
type ClassFormValues = z.infer<typeof classSchema>;

// Define a type for the class data
interface ClassData {
  id: string;
  class_title: string;
  class_description: string | null;
  class_date: string;
  class_time: string;
  class_duration: string;
  class_price: number;
  class_capacity: number;
  class_category: string;
  class_level: string;
  class_language: string;
  class_instructor: string;
  class_location: string;
  class_materials: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

// Define a type for the props of the component
interface AdminClassesManagementProps {
  // Add any props that the component might receive
}

// Define the component
const AdminClassesManagement: React.FC<AdminClassesManagementProps> = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage] = useState(5);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize the form with useForm hook
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      class_title: "",
      class_description: "",
      class_date: new Date(),
      class_time: "09:00",
      class_duration: "1 hour",
      class_price: 0,
      class_capacity: 10,
      class_category: "Mathematics",
      class_level: "Beginner",
      class_language: "English",
      class_instructor: "John Doe",
      class_location: "Online",
      class_materials: "",
      is_active: true,
    },
  });

  // Function to handle form submission - updated for the new classes table
  const onSubmit = async (values: ClassFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const classData = {
        ...values,
        class_date: values.class_date.toISOString(),
        created_by: user?.id
      };

      if (isEditMode && selectedClass) {
        // Update existing class
        const { data, error } = await supabase
          .from('classes')
          .update(classData)
          .eq('id', selectedClass.id)
          .select();

        if (error) {
          throw new Error(error.message);
        }

        // Update the classes state with the updated class
        setClasses(classes.map(cls => cls.id === selectedClass.id ? { ...cls, ...classData } as ClassData : cls));
        toast({
          title: "Class updated successfully!",
        });
      } else {
        // Create new class
        const { data, error } = await supabase
          .from('classes')
          .insert([classData])
          .select();

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          // Add the new class to the classes state
          setClasses([...classes, data[0] as ClassData]);
        }
        
        toast({
          title: "Class created successfully!",
        });
      }

      // Close the drawer and reset the form
      setIsDrawerOpen(false);
      form.reset();
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch classes from Supabase
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setClasses(data as ClassData[] || []);
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Function to delete a class
  const deleteClass = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Remove the deleted class from the classes state
      setClasses(classes.filter(cls => cls.id !== id));
      toast({
        title: "Class deleted successfully!",
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error!",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to open the dialog and set the selected class
  const openDialog = (cls: ClassData) => {
    setSelectedClass(cls);
    setIsDialogOpen(true);
  };

  // Function to close the dialog
  const closeDialog = () => {
    setSelectedClass(null);
    setIsDialogOpen(false);
  };

  // Function to open the drawer and set the selected class for editing
  const openDrawerForEdit = (cls: ClassData) => {
    setSelectedClass(cls);
    setIsEditMode(true);
    setIsDrawerOpen(true);
    form.reset(cls);
  };

  // Function to open the drawer for creating a new class
  const openDrawerForCreate = () => {
    setSelectedClass(null);
    setIsEditMode(false);
    setIsDrawerOpen(true);
    form.reset();
  };

  // Function to close the drawer
  const closeDrawer = () => {
    setSelectedClass(null);
    setIsEditMode(false);
    setIsDrawerOpen(false);
    form.reset();
  };

  // Use useEffect to fetch classes when the component mounts
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Function to format the class date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page when searching
  };

  // Function to handle pagination
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Filter classes based on search query
  const filteredClasses = classes.filter(cls =>
    cls.class_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.class_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.class_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.class_level.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.class_language.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.class_instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.class_location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current classes for pagination
  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = filteredClasses.slice(indexOfFirstClass, indexOfLastClass);

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);

  // Render the component
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Manage Classes</CardTitle>
          <CardDescription>
            Here you can manage all the classes that are offered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="mb-4">
            <Label htmlFor="search">Search Classes</Label>
            <Input
              type="text"
              id="search"
              placeholder="Search by title, description, category, etc."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {/* Button to Create New Class */}
          <Button variant="outline" onClick={openDrawerForCreate} className="mb-4">
            <Icons.add className="mr-2 h-4 w-4" />
            Create New Class
          </Button>

          {/* Table of Classes */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      <div className="flex items-center justify-center">
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Loading classes...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loading && currentClasses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No classes found.
                    </TableCell>
                  </TableRow>
                )}
                {!loading && currentClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.class_title}</TableCell>
                    <TableCell>{cls.class_category}</TableCell>
                    <TableCell>{cls.class_level}</TableCell>
                    <TableCell>{cls.class_language}</TableCell>
                    <TableCell>{cls.class_instructor}</TableCell>
                    <TableCell>{cls.class_location}</TableCell>
                    <TableCell>{formatDate(cls.class_date)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Icons.dotsHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDrawerForEdit(cls)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog(cls)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredClasses.length > classesPerPage && (
            <div className="flex justify-center mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <Button
                  key={number}
                  variant={currentPage === number ? "default" : "outline"}
                  onClick={() => paginate(number)}
                  className="mx-1"
                >
                  {number}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog to Confirm Deletion */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this class?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Class Title
              </Label>
              <Input
                type="text"
                id="name"
                value={selectedClass?.class_title || ''}
                className="col-span-3"
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => {
                if (selectedClass) {
                  deleteClass(selectedClass.id);
                  closeDialog();
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drawer to Create or Edit Class */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEditMode ? "Edit Class" : "Create New Class"}</DrawerTitle>
            <DrawerDescription>
              {isEditMode ? "Edit the details of the selected class." : "Create a new class by entering the details below."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-6 pb-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="class_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the title for this class" {...field} />
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        Enter the title for this class.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the description for this class"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe this class for the students.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Class Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="text-sm text-muted-foreground">
                        When will this class take place?
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>
                        What time will this class take place?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the duration for this class" {...field} />
                      </FormControl>
                      <FormDescription>
                        How long will this class take?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter the price for this class" {...field} />
                      </FormControl>
                      <FormDescription>
                        How much will this class cost?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter the capacity for this class" {...field} />
                      </FormControl>
                      <FormDescription>
                        How many students can attend this class?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the category for this class" {...field} />
                      </FormControl>
                      <FormDescription>
                        What category does this class belong to?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Level</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the level for this class" {...field} />
                      </FormControl>
                      <FormDescription>
                        What level is this class for?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Language</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the language for this class" {...field} />
                      </FormControl>
                      <FormDescription>
                        What language will this class be taught in?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_instructor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Instructor</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the instructor for this class" {...field} />
                      </FormControl>
                      <FormDescription>
                        Who is the instructor for this class?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the location for this class" {...field} />
                      </FormControl>
                      <FormDescription>
                        Where will this class take place?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class_materials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Materials</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the materials for this class" {...field} />
                      </FormControl>
                      <FormDescription>
                        What materials will be used in this class?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Set class as active or inactive.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DrawerFooter>
                  <Button type="submit" disabled={loading}>
                    {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Update Class" : "Create Class"}
                  </Button>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AdminClassesManagement;
