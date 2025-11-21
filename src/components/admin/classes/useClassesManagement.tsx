
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ClassData, ClassFormValues } from './types';

export const useClassesManagement = () => {
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

  // Function to handle form submission - updated for the new classes table
  const onSubmit = async (values: ClassFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure all required fields are present and properly typed
      const classData = {
        class_title: values.class_title,
        class_description: values.class_description,
        class_date: values.class_date.toISOString(),
        class_time: values.class_time,
        class_duration: values.class_duration,
        class_price: values.class_price,
        class_capacity: values.class_capacity,
        class_category: values.class_category,
        class_level: values.class_level,
        class_language: values.class_language,
        class_instructor: values.class_instructor,
        class_location: values.class_location,
        class_materials: values.class_materials,
        is_active: values.is_active,
        created_by: user?.uid
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
        // Create new class - Pass the object directly, not in an array
        const { data, error } = await supabase
          .from('classes')
          .insert(classData)
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
  };

  // Function to open the drawer for creating a new class
  const openDrawerForCreate = () => {
    setSelectedClass(null);
    setIsEditMode(false);
    setIsDrawerOpen(true);
  };

  // Function to close the drawer
  const closeDrawer = () => {
    setSelectedClass(null);
    setIsEditMode(false);
    setIsDrawerOpen(false);
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
    (cls.class_description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
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

  // Get default form values for creating or editing classes
  const getDefaultFormValues = (): ClassFormValues => {
    if (isEditMode && selectedClass) {
      return {
        ...selectedClass,
        class_date: new Date(selectedClass.class_date), // Convert string to Date
        class_price: Number(selectedClass.class_price), // Ensure number type
        class_capacity: Number(selectedClass.class_capacity) // Ensure number type
      };
    }
    
    return {
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
    };
  };

  // Use useEffect to fetch classes when the component mounts
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    loading,
    error,
    selectedClass,
    isDialogOpen,
    setIsDialogOpen,
    isDrawerOpen,
    setIsDrawerOpen,
    isEditMode,
    searchQuery,
    currentPage,
    currentClasses,
    totalPages,
    onSubmit,
    deleteClass,
    openDialog,
    closeDialog,
    openDrawerForEdit,
    openDrawerForCreate,
    closeDrawer,
    handleSearch,
    paginate,
    getDefaultFormValues
  };
};
