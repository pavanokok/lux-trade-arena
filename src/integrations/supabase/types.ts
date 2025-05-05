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
      code_versions: {
        Row: {
          code_content: string
          created_at: string
          id: string
          project_id: string
          version_name: string
        }
        Insert: {
          code_content: string
          created_at?: string
          id?: string
          project_id: string
          version_name: string
        }
        Update: {
          code_content?: string
          created_at?: string
          id?: string
          project_id?: string
          version_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          code_snippet: string | null
          content: string
          course_id: string
          created_at: string
          id: string
          language: string
          order_index: number
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          code_snippet?: string | null
          content: string
          course_id: string
          created_at?: string
          id?: string
          language: string
          order_index: number
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          code_snippet?: string | null
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          language?: string
          order_index?: number
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      market_data: {
        Row: {
          change: number | null
          change_percent: number | null
          description: string | null
          high_24h: number | null
          last_updated: string | null
          low_24h: number | null
          name: string
          previous_price: number | null
          price: number
          symbol: string
          type: string
          volume: number | null
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          description?: string | null
          high_24h?: number | null
          last_updated?: string | null
          low_24h?: number | null
          name: string
          previous_price?: number | null
          price: number
          symbol: string
          type: string
          volume?: number | null
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          description?: string | null
          high_24h?: number | null
          last_updated?: string | null
          low_24h?: number | null
          name?: string
          previous_price?: number | null
          price?: number
          symbol?: string
          type?: string
          volume?: number | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          average_price: number
          created_at: string | null
          id: string
          name: string
          quantity: number
          symbol: string
          type: string
          user_id: string
        }
        Insert: {
          average_price: number
          created_at?: string | null
          id?: string
          name: string
          quantity: number
          symbol: string
          type: string
          user_id: string
        }
        Update: {
          average_price?: number
          created_at?: string | null
          id?: string
          name?: string
          quantity?: number
          symbol?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          last_activity: string | null
          level: number
          streak_days: number
          username: string | null
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          last_activity?: string | null
          level?: number
          streak_days?: number
          username?: string | null
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          last_activity?: string | null
          level?: number
          streak_days?: number
          username?: string | null
          xp?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          code_files: Json
          created_at: string
          description: string | null
          id: string
          prompt_id: string
          title: string
        }
        Insert: {
          code_files: Json
          created_at?: string
          description?: string | null
          id?: string
          prompt_id: string
          title: string
        }
        Update: {
          code_files?: Json
          created_at?: string
          description?: string | null
          id?: string
          prompt_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          content: string
          created_at: string
          id: string
          tech_stack: string[] | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          tech_stack?: string[] | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tech_stack?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer: string
          id: string
          is_correct: boolean
          question_id: string
        }
        Insert: {
          answer: string
          id?: string
          is_correct?: boolean
          question_id: string
        }
        Update: {
          answer?: string
          id?: string
          is_correct?: boolean
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          id: string
          order_index: number
          question: string
          question_type: string
          quiz_id: string
          xp_reward: number
        }
        Insert: {
          id?: string
          order_index: number
          question: string
          question_type: string
          quiz_id: string
          xp_reward?: number
        }
        Update: {
          id?: string
          order_index?: number
          question?: string
          question_type?: string
          quiz_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string
          id: string
          order_type: string
          price: number
          quantity: number
          symbol: string
          total: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_type: string
          price: number
          quantity: number
          symbol: string
          total: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_type?: string
          price?: number
          quantity?: number
          symbol?: string
          total?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed: boolean
          course_id: string
          current_lesson_index: number
          enrolled_at: string
          id: string
          last_activity_at: string
          progress_percentage: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          course_id: string
          current_lesson_index?: number
          enrolled_at?: string
          id?: string
          last_activity_at?: string
          progress_percentage?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          course_id?: string
          current_lesson_index?: number
          enrolled_at?: string
          id?: string
          last_activity_at?: string
          progress_percentage?: number
          user_id?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          code_submission: string | null
          completed: boolean
          completed_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          code_submission?: string | null
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          code_submission?: string | null
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          code_content: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          language: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code_content: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          language: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code_content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          language?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_quiz_attempts: {
        Row: {
          created_at: string
          id: string
          max_score: number
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_score: number
          passed?: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_score?: number
          passed?: boolean
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          virtual_balance: number | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          virtual_balance?: number | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          virtual_balance?: number | null
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string
          description: string | null
          edges: Json
          id: string
          is_public: boolean
          nodes: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          edges: Json
          id?: string
          is_public?: boolean
          nodes: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          edges?: Json
          id?: string
          is_public?: boolean
          nodes?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
