
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Helper function to populate test data for the mentor space
 * This allows developers to quickly test the mentor functionality
 */
export async function populateMentorTestData(userId: string) {
  try {
    // 1. Make current user a mentor if they aren't already
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        is_mentor: true,
        mentor_bio: "I'm an experienced mentor ready to help you with your projects.",
        mentor_hourly_rate: 75,
        expertise: ['Startup Strategy', 'Fundraising', 'Pitch Deck', 'Business Model'],
        position: "Senior Advisor",
        company: "Growth Ventures"
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (profileError) throw profileError;

    // 2. Create session types for the mentor
    const sessionTypes = [
      {
        mentor_id: userId,
        name: "Quick Consultation",
        description: "A brief 30-minute session to discuss specific questions or get quick feedback.",
        duration: 30,
        price: 0,
        is_free: true,
        color: "#4CAF50"
      },
      {
        mentor_id: userId,
        name: "Strategy Session",
        description: "An in-depth 60-minute session to review your business strategy and provide guidance.",
        duration: 60,
        price: 75,
        is_free: false,
        color: "#2196F3"
      },
      {
        mentor_id: userId,
        name: "Deep Dive",
        description: "A comprehensive 90-minute session to thoroughly analyze your business and create an action plan.",
        duration: 90,
        price: 120,
        is_free: false,
        color: "#9C27B0"
      }
    ];

    const { data: sessionTypesData, error: sessionTypesError } = await supabase
      .from('mentor_session_types')
      .upsert(sessionTypes, { onConflict: 'mentor_id,name' })
      .select();

    if (sessionTypesError) throw sessionTypesError;

    // 3. Create availability slots for the next 7 days
    const slots = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Morning slot (10:00 AM - 11:00 AM)
      const morningStart = new Date(date);
      morningStart.setHours(10, 0, 0, 0);
      const morningEnd = new Date(date);
      morningEnd.setHours(11, 0, 0, 0);
      
      // Afternoon slot (2:00 PM - 3:00 PM)
      const afternoonStart = new Date(date);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(date);
      afternoonEnd.setHours(15, 0, 0, 0);
      
      slots.push({
        mentor_id: userId,
        start_time: morningStart.toISOString(),
        end_time: morningEnd.toISOString(),
        is_booked: false
      });
      
      slots.push({
        mentor_id: userId,
        start_time: afternoonStart.toISOString(),
        end_time: afternoonEnd.toISOString(),
        is_booked: false
      });
    }

    const { data: slotsData, error: slotsError } = await supabase
      .from('mentor_availability_slots')
      .upsert(slots, { onConflict: 'mentor_id,start_time' })
      .select();

    if (slotsError) throw slotsError;

    toast.success("Test data created! You can now test the mentor functionality.");
    return true;
  } catch (error) {
    console.error("Error creating test data:", error);
    toast.error("Failed to create test data. See console for details.");
    return false;
  }
}
