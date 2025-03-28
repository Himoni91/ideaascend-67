
import { Json } from "@/integrations/supabase/types";

// Custom types for mentor-specific tables
export interface MentorAvailabilitySlotRow {
  id: string;
  mentor_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  session_id?: string;
  created_at: string;
  recurring_rule?: string;
}

export interface MentorSessionTypeRow {
  id: string;
  mentor_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  currency?: string;
  is_free?: boolean;
  is_featured?: boolean;
  color?: string;
  created_at: string;
}

export interface MentorSessionRow {
  id: string;
  mentor_id: string;
  mentee_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  payment_provider?: string;
  payment_id?: string;
  payment_amount?: number;
  payment_currency?: string;
  session_url?: string;
  session_notes?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  session_type?: string;
  created_at: string;
  price?: number;
  metadata?: Json;
}

// Helper functions for type casting
export const asMentorAvailabilitySlot = (data: any): MentorAvailabilitySlotRow => {
  return data as MentorAvailabilitySlotRow;
};

export const asMentorSessionType = (data: any): MentorSessionTypeRow => {
  return data as MentorSessionTypeRow;
};

export const asMentorSession = (data: any): MentorSessionRow => {
  return data as MentorSessionRow;
};
