// Auto-generated Supabase types - DO NOT EDIT
// Generated from: https://drwpnasiqgzqdubmlwxj.supabase.co

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
      agencies: {
        Row: {
          billing_email: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          price_per_physician_cents: number | null
          primary_color: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          billing_email?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          price_per_physician_cents?: number | null
          primary_color?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          billing_email?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          price_per_physician_cents?: number | null
          primary_color?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          category: string | null
          certificate_url: string | null
          completion_date: string
          course_name: string
          created_at: string | null
          credit_hours: number
          id: string
          provider: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          category?: string | null
          certificate_url?: string | null
          completion_date: string
          course_name: string
          created_at?: string | null
          credit_hours: number
          id?: string
          provider?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          category?: string | null
          certificate_url?: string | null
          completion_date?: string
          course_name?: string
          created_at?: string | null
          credit_hours?: number
          id?: string
          provider?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          accme_accredited: boolean | null
          accreditation_ids: string[] | null
          affiliate_url: string | null
          approved_states: string[] | null
          category: string | null
          course_url: string | null
          created_at: string | null
          credit_hours: number
          description: string | null
          duration_minutes: number | null
          format: string | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          last_verified_at: string | null
          price_cents: number | null
          provider: string
          specialty_tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          accme_accredited?: boolean | null
          accreditation_ids?: string[] | null
          affiliate_url?: string | null
          approved_states?: string[] | null
          category?: string | null
          course_url?: string | null
          created_at?: string | null
          credit_hours: number
          description?: string | null
          duration_minutes?: number | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          last_verified_at?: string | null
          price_cents?: number | null
          provider: string
          specialty_tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          accme_accredited?: boolean | null
          accreditation_ids?: string[] | null
          affiliate_url?: string | null
          approved_states?: string[] | null
          category?: string | null
          course_url?: string | null
          created_at?: string | null
          credit_hours?: number
          description?: string | null
          duration_minutes?: number | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          last_verified_at?: string | null
          price_cents?: number | null
          provider?: string
          specialty_tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_allocations: {
        Row: {
          certificate_id: string
          created_at: string | null
          credits_applied: number
          id: string
          license_id: string
          requirement_id: string | null
        }
        Insert: {
          certificate_id: string
          created_at?: string | null
          credits_applied: number
          id?: string
          license_id: string
          requirement_id?: string | null
        }
        Update: {
          certificate_id?: string
          created_at?: string | null
          credits_applied?: number
          id?: string
          license_id?: string
          requirement_id?: string | null
        }
        Relationships: []
      }
      dea_registrations: {
        Row: {
          created_at: string | null
          dea_number: string
          expiry_date: string | null
          id: string
          linked_states: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dea_number: string
          expiry_date?: string | null
          id?: string
          linked_states?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dea_number?: string
          expiry_date?: string | null
          id?: string
          linked_states?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expert_consultations: {
        Row: {
          attachments: string[] | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          expert_id: string | null
          expert_name: string | null
          follow_up_required: boolean | null
          id: string
          priority: string | null
          resolution_notes: string | null
          scheduled_at: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          expert_id?: string | null
          expert_name?: string | null
          follow_up_required?: boolean | null
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          scheduled_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          expert_id?: string | null
          expert_name?: string | null
          follow_up_required?: boolean | null
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          scheduled_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      license_requirements: {
        Row: {
          category: string
          created_at: string | null
          credits_required: number
          due_date: string | null
          id: string
          license_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          credits_required: number
          due_date?: string | null
          id?: string
          license_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          credits_required?: number
          due_date?: string | null
          id?: string
          license_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_requirements_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          }
        ]
      }
      licenses: {
        Row: {
          created_at: string | null
          degree_type: string | null
          expiry_date: string | null
          id: string
          license_number: string | null
          state: string
          total_credits_required: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          degree_type?: string | null
          expiry_date?: string | null
          id?: string
          license_number?: string | null
          state: string
          total_credits_required?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          degree_type?: string | null
          expiry_date?: string | null
          id?: string
          license_number?: string | null
          state?: string
          total_credits_required?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          push_sent: boolean | null
          push_sent_at: string | null
          push_token: string | null
          read: boolean | null
          read_at: string | null
          send_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          push_sent?: boolean | null
          push_sent_at?: string | null
          push_token?: string | null
          read?: boolean | null
          read_at?: string | null
          send_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          push_sent?: boolean | null
          push_sent_at?: string | null
          push_token?: string | null
          read?: boolean | null
          read_at?: string | null
          send_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_id: string | null
          created_at: string | null
          degree_type: string | null
          full_name: string | null
          id: string
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          degree_type?: string | null
          full_name?: string | null
          id: string
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          degree_type?: string | null
          full_name?: string | null
          id?: string
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_connections: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          last_synced_at: string | null
          provider: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          provider: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      state_requirements: {
        Row: {
          category_requirements: Json | null
          ce_broker_mandatory: boolean | null
          ce_broker_state_code: string | null
          created_at: string | null
          degree_type: string
          effective_date: string | null
          id: string
          last_verified_at: string | null
          notes: string | null
          renewal_cycle_years: number
          source_url: string | null
          special_requirements: string[] | null
          state: string
          total_credits_required: number
          updated_at: string | null
        }
        Insert: {
          category_requirements?: Json | null
          ce_broker_mandatory?: boolean | null
          ce_broker_state_code?: string | null
          created_at?: string | null
          degree_type: string
          effective_date?: string | null
          id?: string
          last_verified_at?: string | null
          notes?: string | null
          renewal_cycle_years?: number
          source_url?: string | null
          special_requirements?: string[] | null
          state: string
          total_credits_required: number
          updated_at?: string | null
        }
        Update: {
          category_requirements?: Json | null
          ce_broker_mandatory?: boolean | null
          ce_broker_state_code?: string | null
          created_at?: string | null
          degree_type?: string
          effective_date?: string | null
          id?: string
          last_verified_at?: string | null
          notes?: string | null
          renewal_cycle_years?: number
          source_url?: string | null
          special_requirements?: string[] | null
          state?: string
          total_credits_required?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          agency_id: string | null
          billing_period: string | null
          canceled_at: string | null
          created_at: string | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          platform: string | null
          platform_product_id: string | null
          platform_subscription_id: string | null
          price_cents: number | null
          status: string
          tier: string
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          billing_period?: string | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          platform?: string | null
          platform_product_id?: string | null
          platform_subscription_id?: string | null
          price_cents?: number | null
          status?: string
          tier: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agency_id?: string | null
          billing_period?: string | null
          canceled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          platform?: string | null
          platform_product_id?: string | null
          platform_subscription_id?: string | null
          price_cents?: number | null
          status?: string
          tier?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
