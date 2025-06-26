
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClassData } from './types';

interface DeleteClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClass: ClassData | null;
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteClassDialog: React.FC<DeleteClassDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedClass,
  onDelete,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" onClick={onDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteClassDialog;
