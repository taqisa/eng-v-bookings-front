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
      bookings: {
        Row: {
          confirmation_status: string | null
          confirmed_at: string | null
          created_at: string
          date: string
          duration: number | null
          google_event_id: string | null
          id: string
          notes: string | null
          provider_id: string
          provider_name: string
          status: string | null
          time: string
          user_id: string
        }
        Insert: {
          confirmation_status?: string | null
          confirmed_at?: string | null
          created_at?: string
          date: string
          duration?: number | null
          google_event_id?: string | null
          id?: string
          notes?: string | null
          provider_id: string
          provider_name: string
          status?: string | null
          time: string
          user_id: string
        }
        Update: {
          confirmation_status?: string | null
          confirmed_at?: string | null
          created_at?: string
          date?: string
          duration?: number | null
          google_event_id?: string | null
          id?: string
          notes?: string | null
          provider_id?: string
          provider_name?: string
          status?: string | null
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          name_ar: string
          provider_count: number
        }
        Insert: {
          created_at?: string
          id: string
          image_url?: string | null
          name: string
          name_ar: string
          provider_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          name_ar?: string
          provider_count?: number
        }
        Relationships: []
      }
      google_accounts: {
        Row: {
          created_at: string
          google_access_token: string
          google_calendar_id: string
          google_refresh_token: string | null
          id: string
          provider_id: string
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          google_access_token: string
          google_calendar_id: string
          google_refresh_token?: string | null
          id?: string
          provider_id: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          google_access_token?: string
          google_calendar_id?: string
          google_refresh_token?: string | null
          id?: string
          provider_id?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_accounts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string
          slug: string
          status: string | null
          subscription_status: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: string | null
          subscription_status?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: string | null
          subscription_status?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          active_google_account_id: string | null
          break_end: string | null
          break_start: string | null
          city_id: string
          created_at: string
          display_name: string | null
          email: string | null
          experience: string | null
          google_access_token: string | null
          google_calendar_connected: boolean | null
          google_calendar_id: string | null
          google_connected: boolean | null
          google_refresh_token: string | null
          id: string
          image_filename: string | null
          location: string | null
          name: string
          name_ar: string
          organization_id: string | null
          phone: string | null
          phone_code: string | null
          rating: number | null
          review_count: number | null
          slot_duration: number | null
          slug: string | null
          specialty: string
          specialty_ar: string
          token_expires_at: string | null
          whatsapp: string | null
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          active_google_account_id?: string | null
          break_end?: string | null
          break_start?: string | null
          city_id: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          experience?: string | null
          google_access_token?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_id?: string | null
          google_connected?: boolean | null
          google_refresh_token?: string | null
          id: string
          image_filename?: string | null
          location?: string | null
          name: string
          name_ar: string
          organization_id?: string | null
          phone?: string | null
          phone_code?: string | null
          rating?: number | null
          review_count?: number | null
          slot_duration?: number | null
          slug?: string | null
          specialty: string
          specialty_ar: string
          token_expires_at?: string | null
          whatsapp?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          active_google_account_id?: string | null
          break_end?: string | null
          break_start?: string | null
          city_id?: string
          created_at?: string
          display_name?: string | null
          email?: string | null
          experience?: string | null
          google_access_token?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_id?: string | null
          google_connected?: boolean | null
          google_refresh_token?: string | null
          id?: string
          image_filename?: string | null
          location?: string | null
          name?: string
          name_ar?: string
          organization_id?: string | null
          phone?: string | null
          phone_code?: string | null
          rating?: number | null
          review_count?: number | null
          slot_duration?: number | null
          slug?: string | null
          specialty?: string
          specialty_ar?: string
          token_expires_at?: string | null
          whatsapp?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_active_google_account_id_fkey"
            columns: ["active_google_account_id"]
            isOneToOne: false
            referencedRelation: "google_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string
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
    Enums: {},
  },
} as const
