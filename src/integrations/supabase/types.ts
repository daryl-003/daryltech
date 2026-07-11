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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          author_role: string
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          published: boolean
          read_time: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_name?: string
          author_role?: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          published?: boolean
          read_time?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_name?: string
          author_role?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean
          read_time?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      booking_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          preferred_date: string
          preferred_time: string
          service: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          preferred_date: string
          preferred_time: string
          service: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          preferred_date?: string
          preferred_time?: string
          service?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          course: string
          created_at: string
          description: string | null
          enrollment_id: string
          id: string
          issued_by: string
          issued_date: string
          student_name: string
          type: string
        }
        Insert: {
          course: string
          created_at?: string
          description?: string | null
          enrollment_id: string
          id?: string
          issued_by?: string
          issued_date?: string
          student_name: string
          type: string
        }
        Update: {
          course?: string
          created_at?: string
          description?: string | null
          enrollment_id?: string
          id?: string
          issued_by?: string
          issued_date?: string
          student_name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["enrollment_id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          assignment: Json | null
          content: string
          created_at: string
          duration: string
          id: string
          module_id: string
          position: number
          quiz: Json | null
          title: string
          type: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          assignment?: Json | null
          content?: string
          created_at?: string
          duration?: string
          id?: string
          module_id: string
          position?: number
          quiz?: Json | null
          title: string
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          assignment?: Json | null
          content?: string
          created_at?: string
          duration?: string
          id?: string
          module_id?: string
          position?: number
          quiz?: Json | null
          title?: string
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          module_name: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          module_name: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          module_name?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          amount_ghs: number | null
          course: string
          created_at: string
          cv_url: string | null
          email: string
          enrollment_id: string
          full_name: string
          id: string
          paid_at: string | null
          payment_status: string
          paystack_reference: string | null
          phone: string | null
          source: string
          status: string
          user_id: string | null
        }
        Insert: {
          amount_ghs?: number | null
          course: string
          created_at?: string
          cv_url?: string | null
          email: string
          enrollment_id: string
          full_name: string
          id?: string
          paid_at?: string | null
          payment_status?: string
          paystack_reference?: string | null
          phone?: string | null
          source?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          amount_ghs?: number | null
          course?: string
          created_at?: string
          cv_url?: string | null
          email?: string
          enrollment_id?: string
          full_name?: string
          id?: string
          paid_at?: string | null
          payment_status?: string
          paystack_reference?: string | null
          phone?: string | null
          source?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      internship_applications: {
        Row: {
          created_at: string
          email: string
          experience_level: string
          full_name: string
          id: string
          motivation: string
          phone: string | null
          portfolio_url: string | null
          status: string
          track: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          experience_level: string
          full_name: string
          id?: string
          motivation: string
          phone?: string | null
          portfolio_url?: string | null
          status?: string
          track: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          experience_level?: string
          full_name?: string
          id?: string
          motivation?: string
          phone?: string | null
          portfolio_url?: string | null
          status?: string
          track?: string
          updated_at?: string
        }
        Relationships: []
      }
      internship_offers: {
        Row: {
          course: string
          created_at: string
          description: string | null
          enrollment_id: string
          file_name: string
          file_url: string
          id: string
          issued_by: string
          offer_type: string
          student_name: string
        }
        Insert: {
          course: string
          created_at?: string
          description?: string | null
          enrollment_id: string
          file_name: string
          file_url: string
          id?: string
          issued_by?: string
          offer_type?: string
          student_name: string
        }
        Update: {
          course?: string
          created_at?: string
          description?: string | null
          enrollment_id?: string
          file_name?: string
          file_url?: string
          id?: string
          issued_by?: string
          offer_type?: string
          student_name?: string
        }
        Relationships: []
      }
      jael_feedback: {
        Row: {
          answer: string
          created_at: string
          id: string
          notes: string | null
          question: string | null
          rating: string
          user_id: string | null
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          notes?: string | null
          question?: string | null
          rating: string
          user_id?: string | null
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          notes?: string | null
          question?: string | null
          rating?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          course_id: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_id: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          course_id?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          max_score: number
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          max_score: number
          score: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          max_score?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          staff_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          email: string
          full_name: string
          id?: string
          staff_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          staff_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          admin_feedback: string | null
          course: string
          created_at: string
          description: string | null
          due_date: string | null
          enrollment_id: string
          file_name: string
          file_url: string
          grade_letter: string | null
          grade_score: number | null
          id: string
          reviewed_at: string | null
          status: string
          student_email: string
          student_name: string
          task_title: string
        }
        Insert: {
          admin_feedback?: string | null
          course: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          enrollment_id: string
          file_name: string
          file_url: string
          grade_letter?: string | null
          grade_score?: number | null
          id?: string
          reviewed_at?: string | null
          status?: string
          student_email: string
          student_name: string
          task_title: string
        }
        Update: {
          admin_feedback?: string | null
          course?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          enrollment_id?: string
          file_name?: string
          file_url?: string
          grade_letter?: string | null
          grade_score?: number | null
          id?: string
          reviewed_at?: string | null
          status?: string
          student_email?: string
          student_name?: string
          task_title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "staff"
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
      app_role: ["admin", "user", "staff"],
    },
  },
} as const
