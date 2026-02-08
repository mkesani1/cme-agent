// Auto-generated types for Supabase database
// Re-export from lib/database.types.ts for convenience

import { Database as DatabaseTypes, Tables as TablesType, TablesInsert as TablesInsertType, TablesUpdate as TablesUpdateType } from '../lib/database.types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Re-export the main Database type
export type Database = DatabaseTypes;

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

// Convenience types for all tables
export type Profile = Tables<'profiles'>
export type License = Tables<'licenses'>
export type LicenseRequirement = Tables<'license_requirements'>
export type DEARegistration = Tables<'dea_registrations'>
export type Certificate = Tables<'certificates'>
export type CreditAllocation = Tables<'credit_allocations'>
export type ChatMessage = Tables<'chat_messages'>
export type ProviderConnection = Tables<'provider_connections'>
export type Course = Tables<'courses'>
export type StateRequirement = Tables<'state_requirements'>
export type Subscription = Tables<'subscriptions'>
export type Notification = Tables<'notifications'>
export type PushToken = Tables<'push_tokens'>
export type Agency = Tables<'agencies'>
export type ExpertConsultation = Tables<'expert_consultations'>
