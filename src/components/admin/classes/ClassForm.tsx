
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icons } from "@/components/Icons";
import { DrawerFooter } from "@/components/ui/drawer";
import { ClassFormValues } from "./types";

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

interface ClassFormProps {
  defaultValues: ClassFormValues;
  isEditMode: boolean;
  loading: boolean;
  onSubmit: (values: ClassFormValues) => Promise<void>;
}

const ClassForm: React.FC<ClassFormProps> = ({
  defaultValues,
  isEditMode,
  loading,
  onSubmit,
}) => {
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues,
  });

  return (
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
                <Input 
                  type="number" 
                  placeholder="Enter the price for this class" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
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
                <Input 
                  type="number" 
                  placeholder="Enter the capacity for this class" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
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
  );
};

export default ClassForm;
