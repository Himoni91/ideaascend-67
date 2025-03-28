
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface ErrorResponse {
  error: string;
  status: number;
}

export const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or key')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}
