
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

const DeleteUserDialog = ({ isOpen, onOpenChange, onDelete }: DeleteUserDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="text-sm text-gray-500">
          This action cannot be undone. This will permanently delete the user account
          and remove their data from our servers.
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
