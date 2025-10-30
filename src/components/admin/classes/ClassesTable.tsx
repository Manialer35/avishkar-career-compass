
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/Icons";
import { ClassData } from './types';

interface ClassesTableProps {
  loading: boolean;
  currentClasses: ClassData[];
  openDrawerForEdit: (cls: ClassData) => void;
  openDialog: (cls: ClassData) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const ClassesTable: React.FC<ClassesTableProps> = ({
  loading,
  currentClasses,
  openDrawerForEdit,
  openDialog,
}) => {
  return (
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
  );
};

export default ClassesTable;
