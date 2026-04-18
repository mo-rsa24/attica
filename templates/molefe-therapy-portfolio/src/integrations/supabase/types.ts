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
      audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      availability_blocks: {
        Row: {
          block_date: string
          created_at: string
          end_time: string | null
          id: string
          is_full_day: boolean
          reason: string | null
          start_time: string | null
        }
        Insert: {
          block_date: string
          created_at?: string
          end_time?: string | null
          id?: string
          is_full_day?: boolean
          reason?: string | null
          start_time?: string | null
        }
        Update: {
          block_date?: string
          created_at?: string
          end_time?: string | null
          id?: string
          is_full_day?: boolean
          reason?: string | null
          start_time?: string | null
        }
        Relationships: []
      }
      booking_series: {
        Row: {
          created_at: string
          custom_interval_days: number | null
          day_of_week: number | null
          duration_minutes: number
          id: string
          notes: string | null
          patient_email: string
          patient_id: string | null
          patient_name: string
          patient_phone: string
          recurrence_pattern: string
          series_end_date: string | null
          series_start_date: string
          service_type: string
          start_time: string
          status: string
          total_sessions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_interval_days?: number | null
          day_of_week?: number | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          patient_email: string
          patient_id?: string | null
          patient_name: string
          patient_phone: string
          recurrence_pattern: string
          series_end_date?: string | null
          series_start_date: string
          service_type: string
          start_time: string
          status?: string
          total_sessions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_interval_days?: number | null
          day_of_week?: number | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          patient_email?: string
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string
          recurrence_pattern?: string
          series_end_date?: string | null
          series_start_date?: string
          service_type?: string
          start_time?: string
          status?: string
          total_sessions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_series_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          access_token: string
          access_token_created_at: string
          appointment_date: string
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          duration_minutes: number
          id: string
          no_show_at: string | null
          no_show_fee_cents: number | null
          notes: string | null
          patient_email: string
          patient_id: string | null
          patient_name: string
          patient_phone: string
          reschedule_count: number
          rescheduled_from_id: string | null
          series_id: string | null
          series_index: number | null
          service_type: string
          start_time: string
          status: string
        }
        Insert: {
          access_token?: string
          access_token_created_at?: string
          appointment_date: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          no_show_at?: string | null
          no_show_fee_cents?: number | null
          notes?: string | null
          patient_email: string
          patient_id?: string | null
          patient_name: string
          patient_phone: string
          reschedule_count?: number
          rescheduled_from_id?: string | null
          series_id?: string | null
          series_index?: number | null
          service_type: string
          start_time: string
          status?: string
        }
        Update: {
          access_token?: string
          access_token_created_at?: string
          appointment_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          no_show_at?: string | null
          no_show_fee_cents?: number | null
          notes?: string | null
          patient_email?: string
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string
          reschedule_count?: number
          rescheduled_from_id?: string | null
          series_id?: string | null
          series_index?: number | null
          service_type?: string
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_rescheduled_from_id_fkey"
            columns: ["rescheduled_from_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "booking_series"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_log: {
        Row: {
          body: string | null
          booking_id: string | null
          channel: string
          created_at: string
          direction: string
          id: string
          metadata: Json | null
          patient_id: string | null
          sent_at: string
          status: string
          subject: string | null
        }
        Insert: {
          body?: string | null
          booking_id?: string | null
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
        }
        Update: {
          body?: string | null
          booking_id?: string | null
          channel?: string
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          name: string
          patient_id: string
          phone: string
          relationship: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          name: string
          patient_id: string
          phone: string
          relationship?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          name?: string
          patient_id?: string
          phone?: string
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_intake: {
        Row: {
          additional_notes: string | null
          completed_at: string | null
          created_at: string
          current_medications: string | null
          id: string
          patient_id: string
          presenting_concerns: string | null
          previous_therapy: boolean | null
          previous_therapy_details: string | null
          referral_source: Database["public"]["Enums"]["referral_source"] | null
        }
        Insert: {
          additional_notes?: string | null
          completed_at?: string | null
          created_at?: string
          current_medications?: string | null
          id?: string
          patient_id: string
          presenting_concerns?: string | null
          previous_therapy?: boolean | null
          previous_therapy_details?: string | null
          referral_source?:
            | Database["public"]["Enums"]["referral_source"]
            | null
        }
        Update: {
          additional_notes?: string | null
          completed_at?: string | null
          created_at?: string
          current_medications?: string | null
          id?: string
          patient_id?: string
          presenting_concerns?: string | null
          previous_therapy?: boolean | null
          previous_therapy_details?: string | null
          referral_source?:
            | Database["public"]["Enums"]["referral_source"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_intake_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_assessments: {
        Row: {
          administered_by: string
          assessment_type: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          responses: Json
          severity: string | null
          total_score: number
        }
        Insert: {
          administered_by?: string
          assessment_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          responses?: Json
          severity?: string | null
          total_score?: number
        }
        Update: {
          administered_by?: string
          assessment_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          responses?: Json
          severity?: string | null
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_consents: {
        Row: {
          accepted: boolean
          accepted_at: string | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          created_at: string
          id: string
          ip_address: string | null
          patient_id: string
          revoked_at: string | null
          version: string
        }
        Insert: {
          accepted?: boolean
          accepted_at?: string | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          created_at?: string
          id?: string
          ip_address?: string | null
          patient_id: string
          revoked_at?: string | null
          version?: string
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          consent_type?: Database["public"]["Enums"]["consent_type"]
          created_at?: string
          id?: string
          ip_address?: string | null
          patient_id?: string
          revoked_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          notes: string | null
          patient_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          patient_id: string
          uploaded_by?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          patient_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          email_verification_expires_at: string | null
          email_verification_token: string | null
          email_verified: boolean
          first_name: string
          id: string
          id_number: string | null
          last_name: string
          onboarding_completed: boolean
          phone: string | null
          preferred_contact_method: Database["public"]["Enums"]["contact_method"]
          preferred_language: string
          updated_at: string
          user_id: string | null
          verification_code: string | null
          verification_code_expires_at: string | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          email_verification_expires_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean
          first_name: string
          id?: string
          id_number?: string | null
          last_name: string
          onboarding_completed?: boolean
          phone?: string | null
          preferred_contact_method?: Database["public"]["Enums"]["contact_method"]
          preferred_language?: string
          updated_at?: string
          user_id?: string | null
          verification_code?: string | null
          verification_code_expires_at?: string | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          email_verification_expires_at?: string | null
          email_verification_token?: string | null
          email_verified?: boolean
          first_name?: string
          id?: string
          id_number?: string | null
          last_name?: string
          onboarding_completed?: boolean
          phone?: string | null
          preferred_contact_method?: Database["public"]["Enums"]["contact_method"]
          preferred_language?: string
          updated_at?: string
          user_id?: string | null
          verification_code?: string | null
          verification_code_expires_at?: string | null
        }
        Relationships: []
      }
      practitioner_breaks: {
        Row: {
          created_at: string
          end_time: string
          id: string
          label: string | null
          schedule_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          label?: string | null
          schedule_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          label?: string | null
          schedule_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_breaks_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "practitioner_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          effective_from: string | null
          effective_until: string | null
          end_time: string
          id: string
          is_active: boolean
          location: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          effective_from?: string | null
          effective_until?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          location?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          effective_from?: string | null
          effective_until?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          location?: string | null
          start_time?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      public_holidays: {
        Row: {
          country_code: string
          created_at: string
          date: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          date: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          country_code?: string
          created_at?: string
          date?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      scheduling_rules: {
        Row: {
          allow_same_day_booking: boolean
          buffer_minutes: number
          cancellation_cutoff_hours: number
          cancellation_fee_cents: number | null
          id: string
          max_advance_days: number
          max_daily_sessions: number
          max_reschedules: number
          min_notice_hours: number
          reschedule_cutoff_hours: number
          updated_at: string
        }
        Insert: {
          allow_same_day_booking?: boolean
          buffer_minutes?: number
          cancellation_cutoff_hours?: number
          cancellation_fee_cents?: number | null
          id?: string
          max_advance_days?: number
          max_daily_sessions?: number
          max_reschedules?: number
          min_notice_hours?: number
          reschedule_cutoff_hours?: number
          updated_at?: string
        }
        Update: {
          allow_same_day_booking?: boolean
          buffer_minutes?: number
          cancellation_cutoff_hours?: number
          cancellation_fee_cents?: number | null
          id?: string
          max_advance_days?: number
          max_daily_sessions?: number
          max_reschedules?: number
          min_notice_hours?: number
          reschedule_cutoff_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_types: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          color: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          is_first_consult: boolean
          is_follow_up: boolean
          max_participants: number
          mode: Database["public"]["Enums"]["service_mode"]
          name: string
          price_cents: number | null
          requires_intake: boolean
          sort_order: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["service_category"]
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          is_first_consult?: boolean
          is_follow_up?: boolean
          max_participants?: number
          mode?: Database["public"]["Enums"]["service_mode"]
          name: string
          price_cents?: number | null
          requires_intake?: boolean
          sort_order?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          color?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_first_consult?: boolean
          is_follow_up?: boolean
          max_participants?: number
          mode?: Database["public"]["Enums"]["service_mode"]
          name?: string
          price_cents?: number | null
          requires_intake?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          booking_id: string
          clinical_notes: string | null
          created_at: string
          follow_up_notes: string | null
          follow_up_recommended: boolean | null
          id: string
          mood_rating: number | null
          outcome: string | null
          risk_level: string | null
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          clinical_notes?: string | null
          created_at?: string
          follow_up_notes?: string | null
          follow_up_recommended?: boolean | null
          id?: string
          mood_rating?: number | null
          outcome?: string | null
          risk_level?: string | null
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          clinical_notes?: string | null
          created_at?: string
          follow_up_notes?: string | null
          follow_up_recommended?: boolean | null
          id?: string
          mood_rating?: number | null
          outcome?: string | null
          risk_level?: string | null
          treatment_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notes_history: {
        Row: {
          booking_id: string
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          clinical_notes: string | null
          follow_up_notes: string | null
          follow_up_recommended: boolean | null
          id: string
          mood_rating: number | null
          outcome: string | null
          risk_level: string | null
          session_note_id: string
          treatment_plan: string | null
          version_number: number
        }
        Insert: {
          booking_id: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          clinical_notes?: string | null
          follow_up_notes?: string | null
          follow_up_recommended?: boolean | null
          id?: string
          mood_rating?: number | null
          outcome?: string | null
          risk_level?: string | null
          session_note_id: string
          treatment_plan?: string | null
          version_number?: number
        }
        Update: {
          booking_id?: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          clinical_notes?: string | null
          follow_up_notes?: string | null
          follow_up_recommended?: boolean | null
          id?: string
          mood_rating?: number | null
          outcome?: string | null
          risk_level?: string | null
          session_note_id?: string
          treatment_plan?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_history_session_note_id_fkey"
            columns: ["session_note_id"]
            isOneToOne: false
            referencedRelation: "session_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_locks: {
        Row: {
          appointment_date: string
          created_at: string
          duration_minutes: number
          expires_at: string
          id: string
          locked_by: string
          start_time: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          duration_minutes?: number
          expires_at: string
          id?: string
          locked_by: string
          start_time: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          duration_minutes?: number
          expires_at?: string
          id?: string
          locked_by?: string
          start_time?: string
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
      waitlist: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          notified_at: string | null
          patient_email: string
          patient_name: string
          patient_phone: string
          preferred_date: string
          preferred_time_end: string | null
          preferred_time_start: string | null
          service_type: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          notified_at?: string | null
          patient_email: string
          patient_name: string
          patient_phone: string
          preferred_date: string
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          service_type: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          notified_at?: string | null
          patient_email?: string
          patient_name?: string
          patient_phone?: string
          preferred_date?: string
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          service_type?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_locks: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      consent_type: "popia" | "treatment" | "telehealth" | "data_sharing"
      contact_method: "email" | "sms" | "whatsapp"
      referral_source: "self" | "doctor" | "insurance" | "other"
      service_category: "individual" | "couples" | "group" | "assessment"
      service_mode: "in_person" | "telehealth" | "both"
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
      app_role: ["admin", "user"],
      consent_type: ["popia", "treatment", "telehealth", "data_sharing"],
      contact_method: ["email", "sms", "whatsapp"],
      referral_source: ["self", "doctor", "insurance", "other"],
      service_category: ["individual", "couples", "group", "assessment"],
      service_mode: ["in_person", "telehealth", "both"],
    },
  },
} as const
