
import { z } from "zod";

// Define a schema for class data validation
export const classSchema = z.object({
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
export type ClassFormValues = z.infer<typeof classSchema>;

// Define a type for the class data
export interface ClassData {
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
