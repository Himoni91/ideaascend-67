
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

// Helper functions for type casting
export const asMentorAvailabilitySlot = (data: any): MentorAvailabilitySlotRow => {
  return data as MentorAvailabilitySlotRow;
};

export const asMentorSessionType = (data: any): MentorSessionTypeRow => {
  return data as MentorSessionTypeRow;
};
