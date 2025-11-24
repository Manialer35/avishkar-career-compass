export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      academy_images: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          filename: string | null
          id: string
          storage_path: string | null
          title: string | null
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          filename?: string | null
          id?: string
          storage_path?: string | null
          title?: string | null
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          filename?: string | null
          id?: string
          storage_path?: string | null
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          accessed_at: string | null
          action: string
          admin_user_id: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string | null
          action: string
          admin_user_id?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table: string
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string | null
          action?: string
          admin_user_id?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      class_enrollments: {
        Row: {
          amount_paid: number
          class_date: string
          class_id: string
          class_title: string
          created_at: string
          id: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          student_address: string
          student_email: string
          student_name: string
          student_phone: string
        }
        Insert: {
          amount_paid: number
          class_date: string
          class_id: string
          class_title: string
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          student_address: string
          student_email: string
          student_name: string
          student_phone: string
        }
        Update: {
          amount_paid?: number
          class_date?: string
          class_id?: string
          class_title?: string
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          student_address?: string
          student_email?: string
          student_name?: string
          student_phone?: string
        }
        Relationships: []
      }
      class_registrations: {
        Row: {
          class_date: string
          class_id: string
          class_title: string
          created_at: string
          id: string
          student_address: string
          student_email: string
          student_name: string
          student_phone: string
        }
        Insert: {
          class_date: string
          class_id: string
          class_title: string
          created_at?: string
          id?: string
          student_address: string
          student_email: string
          student_name: string
          student_phone: string
        }
        Update: {
          class_date?: string
          class_id?: string
          class_title?: string
          created_at?: string
          id?: string
          student_address?: string
          student_email?: string
          student_name?: string
          student_phone?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          class_capacity: number
          class_category: string
          class_date: string
          class_description: string | null
          class_duration: string
          class_instructor: string
          class_language: string
          class_level: string
          class_location: string
          class_materials: string | null
          class_price: number
          class_time: string
          class_title: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          class_capacity?: number
          class_category: string
          class_date: string
          class_description?: string | null
          class_duration: string
          class_instructor: string
          class_language: string
          class_level: string
          class_location: string
          class_materials?: string | null
          class_price?: number
          class_time: string
          class_title: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          class_capacity?: number
          class_category?: string
          class_date?: string
          class_description?: string | null
          class_duration?: string
          class_instructor?: string
          class_language?: string
          class_level?: string
          class_location?: string
          class_materials?: string | null
          class_price?: number
          class_time?: string
          class_title?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      image_metadata: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          object_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          object_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          object_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      material_purchases: {
        Row: {
          amount: number
          id: string
          material_id: string | null
          payment_id: string | null
          payment_status: string | null
          purchased_at: string
          user_email: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          amount: number
          id?: string
          material_id?: string | null
          payment_id?: string | null
          payment_status?: string | null
          purchased_at?: string
          user_email: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          amount?: number
          id?: string
          material_id?: string | null
          payment_id?: string | null
          payment_status?: string | null
          purchased_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          order_id: string
          payment_id: string | null
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          order_id: string
          payment_id?: string | null
          product_id: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          order_id?: string
          payment_id?: string | null
          product_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pending_admins: {
        Row: {
          created_at: string | null
          id: string
          phone_number: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone_number: string
        }
        Update: {
          created_at?: string | null
          id?: string
          phone_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      profiles_backup: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          is_admin: boolean | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_admin?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          is_admin?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string
          status: string
          study_material_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          status?: string
          study_material_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          status?: string
          study_material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_study_material_id_fkey"
            columns: ["study_material_id"]
            isOneToOne: false
            referencedRelation: "study_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      study_material_folders: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_premium: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          created_at: string
          description: string | null
          download_count: number | null
          downloadurl: string | null
          duration_months: number | null
          duration_type: string | null
          folder_id: string | null
          id: string
          is_upcoming: boolean
          ispremium: boolean | null
          name: string
          price: number
          thumbnailurl: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          downloadurl?: string | null
          duration_months?: number | null
          duration_type?: string | null
          folder_id?: string | null
          id?: string
          is_upcoming?: boolean
          ispremium?: boolean | null
          name: string
          price: number
          thumbnailurl?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          downloadurl?: string | null
          duration_months?: number | null
          duration_type?: string | null
          folder_id?: string | null
          id?: string
          is_upcoming?: boolean
          ispremium?: boolean | null
          name?: string
          price?: number
          thumbnailurl?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_materials_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "study_material_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      training_video_folders: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_premium: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_videos: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          folder_id: string | null
          id: string
          is_premium: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_premium?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_premium?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_videos_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "training_video_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases: {
        Row: {
          amount: number
          expires_at: string | null
          id: string
          material_id: string
          payment_id: string | null
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          expires_at?: string | null
          id?: string
          material_id: string
          payment_id?: string | null
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          expires_at?: string | null
          id?: string
          material_id?: string
          payment_id?: string | null
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_by_phone: { Args: { phone_number: string }; Returns: string }
      calculate_expiry_date: {
        Args: { duration_months: number; duration_type: string }
        Returns: string
      }
      check_bucket_exists: { Args: { bucket_name: string }; Returns: boolean }
      check_user_is_admin:
        | {
            Args: { check_user_id: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.check_user_is_admin(check_user_id => text), public.check_user_is_admin(check_user_id => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { check_user_id: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.check_user_is_admin(check_user_id => text), public.check_user_is_admin(check_user_id => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      check_user_is_admin_by_phone: {
        Args: { user_phone: string }
        Returns: boolean
      }
      create_user_roles_if_not_exists:
        | { Args: never; Returns: undefined }
        | { Args: { p_role: string; p_user_id: string }; Returns: undefined }
      ensure_user_role:
        | { Args: { p_role: string; p_user_id: string }; Returns: undefined }
        | { Args: { p_role: string; p_user_id: string }; Returns: undefined }
      get_admin_users: {
        Args: never
        Returns: {
          created_at: string
          phone: string
          role: string
          user_id: string
        }[]
      }
      get_pending_admin_emails: {
        Args: never
        Returns: {
          created_at: string
          email: string
        }[]
      }
      get_pending_admins: {
        Args: never
        Returns: {
          created_at: string
          phone_number: string
        }[]
      }
      get_user_role:
        | { Args: { p_user_id: string }; Returns: string }
        | { Args: { user_id_param: string }; Returns: string }
      get_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          full_name: string
          id: string
          phone_number: string
          role: string
        }[]
      }
      has_active_access: {
        Args: { material_id: string; user_id: string }
        Returns: boolean
      }
      increment_material_downloads: {
        Args: { material_id: string }
        Returns: number
      }
      is_admin:
        | { Args: { user_uuid: string }; Returns: boolean }
        | { Args: { user_id_param: string }; Returns: boolean }
      is_admin_by_phone: { Args: { phone_num: string }; Returns: boolean }
      is_admin_phone: { Args: { phone_num: string }; Returns: boolean }
      is_admin_user: { Args: { user_uuid?: string }; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      promote_email_to_admin: {
        Args: { target_email: string }
        Returns: string
      }
      promote_phone_to_admin: {
        Args: { target_phone: string }
        Returns: string
      }
      setup_phone_admin: { Args: { phone_number: string }; Returns: undefined }
    }
    Enums: {
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "admin"],
    },
  },
} as const
