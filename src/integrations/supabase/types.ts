export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          author_name: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          prompt_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          prompt_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          prompt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_usage: {
        Row: {
          ai_tests_used: number | null
          created_at: string | null
          id: string
          month_year: string
          projects_count: number | null
          team_members_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_tests_used?: number | null
          created_at?: string | null
          id?: string
          month_year: string
          projects_count?: number | null
          team_members_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_tests_used?: number | null
          created_at?: string | null
          id?: string
          month_year?: string
          projects_count?: number | null
          team_members_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_ai_analysis: {
        Row: {
          analysis_result: Json
          analysis_type: string
          analysis_version: string
          content_hash: string
          created_at: string
          detected_language: string | null
          id: string
          language_confidence: number | null
          original_language: string | null
          prompt_id: string | null
        }
        Insert: {
          analysis_result: Json
          analysis_type?: string
          analysis_version?: string
          content_hash: string
          created_at?: string
          detected_language?: string | null
          id?: string
          language_confidence?: number | null
          original_language?: string | null
          prompt_id?: string | null
        }
        Update: {
          analysis_result?: Json
          analysis_type?: string
          analysis_version?: string
          content_hash?: string
          created_at?: string
          detected_language?: string | null
          id?: string
          language_confidence?: number | null
          original_language?: string | null
          prompt_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_ai_analysis_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_reviews: {
        Row: {
          completed_at: string | null
          created_at: string
          feedback: string | null
          id: string
          invitation_id: string | null
          prompt_id: string
          reviewer_id: string
          status: Database["public"]["Enums"]["review_status"]
          suggested_changes: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          invitation_id?: string | null
          prompt_id: string
          reviewer_id: string
          status?: Database["public"]["Enums"]["review_status"]
          suggested_changes?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          invitation_id?: string | null
          prompt_id?: string
          reviewer_id?: string
          status?: Database["public"]["Enums"]["review_status"]
          suggested_changes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_reviews_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "review_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_reviews_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_versions: {
        Row: {
          change_summary: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          is_current: boolean
          prompt_id: string
          status: string
          title: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_current?: boolean
          prompt_id: string
          status: string
          title: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_current?: boolean
          prompt_id?: string
          status?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_versions_prompt_id_fkey"
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
          project_id: string
          status: string
          title: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      review_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          inviter_id: string
          message: string | null
          prompt_id: string
          reviewer_completed_at: string | null
          reviewer_email: string
          reviewer_id: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          inviter_id: string
          message?: string | null
          prompt_id: string
          reviewer_completed_at?: string | null
          reviewer_email: string
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          inviter_id?: string
          message?: string | null
          prompt_id?: string
          reviewer_completed_at?: string | null
          reviewer_email?: string
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_invitations_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_invitations_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          max_ai_tests_monthly: number | null
          max_projects: number | null
          max_users: number | null
          plan_name: string
          price_monthly: number
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_ai_tests_monthly?: number | null
          max_projects?: number | null
          max_users?: number | null
          plan_name: string
          price_monthly: number
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_ai_tests_monthly?: number | null
          max_projects?: number | null
          max_users?: number | null
          plan_name?: string
          price_monthly?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      test_results: {
        Row: {
          batch_id: string | null
          cost_estimate: number | null
          created_at: string
          error_message: string | null
          id: string
          input_data: string | null
          max_tokens: number | null
          model_name: string | null
          model_used: string | null
          model_version: string | null
          output_data: string | null
          parameters: Json | null
          prompt_id: string
          prompt_version_id: string | null
          response_time_ms: number | null
          status: string | null
          temperature: number | null
          tokens_used: Json | null
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          cost_estimate?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: string | null
          max_tokens?: number | null
          model_name?: string | null
          model_used?: string | null
          model_version?: string | null
          output_data?: string | null
          parameters?: Json | null
          prompt_id: string
          prompt_version_id?: string | null
          response_time_ms?: number | null
          status?: string | null
          temperature?: number | null
          tokens_used?: Json | null
          user_id: string
        }
        Update: {
          batch_id?: string | null
          cost_estimate?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: string | null
          max_tokens?: number | null
          model_name?: string | null
          model_used?: string | null
          model_version?: string | null
          output_data?: string | null
          parameters?: Json | null
          prompt_id?: string
          prompt_version_id?: string | null
          response_time_ms?: number | null
          status?: string | null
          temperature?: number | null
          tokens_used?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_prompt_version_id_fkey"
            columns: ["prompt_version_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_name: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_name_fkey"
            columns: ["plan_name"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["plan_name"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_usage_limit: {
        Args: { user_id: string; limit_type: string }
        Returns: boolean
      }
      create_default_project: {
        Args: { user_id: string }
        Returns: undefined
      }
      get_accessible_projects: {
        Args: { user_id: string }
        Returns: {
          id: string
          name: string
          description: string
          user_id: string
          created_at: string
          updated_at: string
          access_type: string
        }[]
      }
      get_ai_cost_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_cost_all_time: number
          total_cost_this_month: number
          total_cost_this_week: number
          total_tests_all_time: number
          total_tests_this_month: number
          average_cost_per_test: number
        }[]
      }
      get_cost_by_model: {
        Args: Record<PropertyKey, never>
        Returns: {
          model_name: string
          total_cost: number
          total_tests: number
          average_cost: number
          total_tokens: number
        }[]
      }
      get_current_prompt_version: {
        Args: { p_prompt_id: string }
        Returns: {
          version_id: string
          version_number: number
          title: string
          content: string
          status: string
        }[]
      }
      get_daily_cost_trends: {
        Args: Record<PropertyKey, never>
        Returns: {
          date: string
          total_cost: number
          test_count: number
        }[]
      }
      get_test_analytics: {
        Args: { p_prompt_id: string }
        Returns: {
          total_tests: number
          avg_response_time: number
          total_cost: number
          models_used: number
          success_rate: number
        }[]
      }
      get_top_spenders: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_email: string
          total_cost: number
          test_count: number
        }[]
      }
      get_user_plan: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_active_review_invitation_for_prompt: {
        Args: { prompt_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      project_has_active_review_invitation_for_project: {
        Args: { project_id: string }
        Returns: boolean
      }
      user_exists_by_email: {
        Args: { email_address: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
      invitation_status: "sent" | "accepted" | "declined" | "expired"
      review_status: "pending" | "in_progress" | "completed" | "declined"
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
      app_role: ["admin", "user", "moderator"],
      invitation_status: ["sent", "accepted", "declined", "expired"],
      review_status: ["pending", "in_progress", "completed", "declined"],
    },
  },
} as const
