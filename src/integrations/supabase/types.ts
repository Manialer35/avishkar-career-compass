export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      study_materials: {
        Row: {
          created_at: string
          description: string | null
          downloadurl: string | null
          id: string
          ispremium: boolean | null
          name: string
          price: number
          thumbnailurl: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          downloadurl?: string | null
          id?: string
          ispremium?: boolean | null
          name: string
          price: number
          thumbnailurl?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          downloadurl?: string | null
          id?: string
          ispremium?: boolean | null
          name?: string
          price?: number
          thumbnailurl?: string | null
          title?: string | null
        }
        Relationships: []
      }
      training_videos: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
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
          id?: string
          is_premium?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          amount: number
          id: string
          material_id: string
          payment_id: string | null
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          material_id: string
          payment_id?: string | null
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
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
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_bucket_exists: {
        Args: { bucket_name: string }
        Returns: boolean
      }
      create_user_roles_if_not_exists: {
        Args: Record<PropertyKey, never> | { p_user_id: string; p_role: string }
        Returns: undefined
      }
      ensure_user_role: {
        Args:
          | { p_user_id: string; p_role: string }
          | { p_user_id: string; p_role: string }
        Returns: undefined
      }
      get_user_role: {
        Args: { p_user_id: string }
        Returns: string
      }
      has_active_access: {
        Args: { material_id: string; user_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
