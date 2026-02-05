// Auto-generated types for Supabase database

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
      profiles: {
        Row: {
          created_at: string | null
          degree_type: string | null
          full_name: string | null
          id: string
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          degree_type?: string | null
          full_name?: string | null
          id: string
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
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

// Helper types for table access
type PublicSchema = Database['public']

export type Tables<
  TableName extends keyof PublicSchema['Tables']
> = PublicSchema['Tables'][TableName]['Row']

export type TablesInsert<
  TableName extends keyof PublicSchema['Tables']
> = PublicSchema['Tables'][TableName]['Insert']

export type TablesUpdate<
  TableName extends keyof PublicSchema['Tables']
> = PublicSchema['Tables'][TableName]['Update']

// Convenience types
export type Profile = Tables<'profiles'>
export type License = Tables<'licenses'>
export type LicenseRequirement = Tables<'license_requirements'>
export type DEARegistration = Tables<'dea_registrations'>
export type Certificate = Tables<'certificates'>
export type CreditAllocation = Tables<'credit_allocations'>
export type ChatMessage = Tables<'chat_messages'>
export type ProviderConnection = Tables<'provider_connections'>
