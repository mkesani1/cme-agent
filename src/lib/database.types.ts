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
        Relationships: [
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_courses: {
        Row: {
          accreditation_type: string | null
          created_at: string | null
          description: string | null
          format: string | null
          hours: number
          id: string
          is_active: boolean | null
          last_verified_at: string | null
          name: string
          price: number | null
          provider: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          accreditation_type?: string | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          hours: number
          id?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          name: string
          price?: number | null
          provider: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          accreditation_type?: string | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          hours?: number
          id?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          name?: string
          price?: number | null
          provider?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      course_state_coverage: {
        Row: {
          category: string
          course_id: string | null
          created_at: string | null
          credits_awarded: number
          id: string
          notes: string | null
          state_code: string
        }
        Insert: {
          category: string
          course_id?: string | null
          created_at?: string | null
          credits_awarded: number
          id?: string
          notes?: string | null
          state_code: string
        }
        Update: {
          category?: string
          course_id?: string | null
          created_at?: string | null
          credits_awarded?: number
          id?: string
          notes?: string | null
          state_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_state_coverage_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "cme_courses"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "credit_allocations_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_allocations_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_allocations_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "license_requirements"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "dea_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discovered_courses: {
        Row: {
          accreditation: string[] | null
          created_at: string | null
          credit_types: string[] | null
          credits: number
          description: string | null
          discovered_at: string | null
          duration_hours: number | null
          efficiency_score: number | null
          format: string
          id: string
          price: number | null
          provider: string
          provider_url: string | null
          relevance_score: number | null
          source_url: string | null
          specialty_focus: string[] | null
          states_accepted: string[] | null
          title: string
          topics: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accreditation?: string[] | null
          created_at?: string | null
          credit_types?: string[] | null
          credits?: number
          description?: string | null
          discovered_at?: string | null
          duration_hours?: number | null
          efficiency_score?: number | null
          format?: string
          id?: string
          price?: number | null
          provider: string
          provider_url?: string | null
          relevance_score?: number | null
          source_url?: string | null
          specialty_focus?: string[] | null
          states_accepted?: string[] | null
          title: string
          topics?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accreditation?: string[] | null
          created_at?: string | null
          credit_types?: string[] | null
          credits?: number
          description?: string | null
          discovered_at?: string | null
          duration_hours?: number | null
          efficiency_score?: number | null
          format?: string
          id?: string
          price?: number | null
          provider?: string
          provider_url?: string | null
          relevance_score?: number | null
          source_url?: string | null
          specialty_focus?: string[] | null
          states_accepted?: string[] | null
          title?: string
          topics?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      discovery_logs: {
        Row: {
          completed_at: string | null
          courses_found: number | null
          created_at: string | null
          error_message: string | null
          id: string
          queries_used: string[] | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          courses_found?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          queries_used?: string[] | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          courses_found?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          queries_used?: string[] | null
          status?: string
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
        Relationships: [
          {
            foreignKeyName: "expert_consultations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          },
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
        Relationships: [
          {
            foreignKeyName: "licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "provider_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recommendations: {
        Row: {
          ai_insight: string | null
          breakdown: Json | null
          categories_covered: string[] | null
          course_id: string | null
          efficiency_score: number | null
          expires_at: string | null
          generated_at: string | null
          id: string
          priority_rank: number | null
          states_covered: string[] | null
          total_credits_toward_gaps: number | null
          user_id: string | null
        }
        Insert: {
          ai_insight?: string | null
          breakdown?: Json | null
          categories_covered?: string[] | null
          course_id?: string | null
          efficiency_score?: number | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          priority_rank?: number | null
          states_covered?: string[] | null
          total_credits_toward_gaps?: number | null
          user_id?: string | null
        }
        Update: {
          ai_insight?: string | null
          breakdown?: Json | null
          categories_covered?: string[] | null
          course_id?: string | null
          efficiency_score?: number | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          priority_rank?: number | null
          states_covered?: string[] | null
          total_credits_toward_gaps?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_recommendations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "cme_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
