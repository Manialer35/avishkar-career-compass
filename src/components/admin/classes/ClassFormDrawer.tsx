
import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import ClassForm from './ClassForm';
import { ClassFormValues } from './types';

interface ClassFormDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  defaultValues: ClassFormValues;
  loading: boolean;
  onSubmit: (values: ClassFormValues) => Promise<void>;
}

const ClassFormDrawer: React.FC<ClassFormDrawerProps> = ({
  isOpen,
  onOpenChange,
  isEditMode,
  defaultValues,
  loading,
  onSubmit,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEditMode ? "Edit Class" : "Create New Class"}</DrawerTitle>
          <DrawerDescription>
            {isEditMode ? "Edit the details of the selected class." : "Create a new class by entering the details below."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-4">
          <ClassForm
            defaultValues={defaultValues}
            isEditMode={isEditMode}
            loading={loading}
            onSubmit={onSubmit}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ClassFormDrawer;
