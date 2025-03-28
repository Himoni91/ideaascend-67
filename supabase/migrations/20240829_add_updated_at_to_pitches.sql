
-- Add updated_at column to pitches table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pitches' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.pitches ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- Create a trigger to automatically update the updated_at field
CREATE OR REPLACE FUNCTION update_pitch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to the pitches table
DROP TRIGGER IF EXISTS update_pitch_updated_at_trigger ON public.pitches;
CREATE TRIGGER update_pitch_updated_at_trigger
BEFORE UPDATE ON public.pitches
FOR EACH ROW
EXECUTE FUNCTION update_pitch_updated_at();
