import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ffrjwrxqzfpiqqxyziww.supabase.co'
// Use the correct service_role key from your Supabase dashboard
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmcmp3cnhxemZwaXFxeHl6aXd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQyMzk2MywiZXhwIjoyMDY1OTk5OTYzfQ.ZVqiRL1J1rHu8SQkHUBaEaZVnn1d7U315aczZAvEh8o'

export const supabase = createClient(supabaseUrl, supabaseServiceKey)