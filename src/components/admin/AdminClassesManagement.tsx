
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/Icons";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import refactored components
import ClassesTable from './classes/ClassesTable';
import DeleteClassDialog from './classes/DeleteClassDialog';
import ClassFormDrawer from './classes/ClassFormDrawer';
import Pagination from './classes/Pagination';
import { useClassesManagement } from './classes/useClassesManagement';

interface AdminClassesManagementProps {
  // Add any props that the component might receive
}

const AdminClassesManagement: React.FC<AdminClassesManagementProps> = () => {
  const {
    loading,
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
    handleSearch,
    paginate,
    getDefaultFormValues
  } = useClassesManagement();

  return (
    <ScrollArea className="h-full">
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
            <ClassesTable
              loading={loading}
              currentClasses={currentClasses}
              openDrawerForEdit={openDrawerForEdit}
              openDialog={openDialog}
            />

            {/* Pagination */}
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={paginate} 
            />
          </CardContent>
        </Card>

        {/* Dialog to Confirm Deletion */}
        <DeleteClassDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedClass={selectedClass}
          onDelete={() => {
            if (selectedClass) {
              deleteClass(selectedClass.id);
              closeDialog();
            }
          }}
          onCancel={closeDialog}
        />

        {/* Drawer to Create or Edit Class */}
        <ClassFormDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          isEditMode={isEditMode}
          defaultValues={getDefaultFormValues()}
          loading={loading}
          onSubmit={onSubmit}
        />
      </div>
    </ScrollArea>
  );
};

export default AdminClassesManagement;
