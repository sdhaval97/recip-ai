import { createClient } from '@supabase/supabase-js'

// --- IMPORTANT: Replace with your Supabase project's URL and anon key ---
const supabaseUrl = 'https://ywkkahrnajqifaymwsam.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3a2thaHJuYWpxaWZheW13c2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTE4MzEsImV4cCI6MjA3MTI4NzgzMX0.EDRjQg9YN_3mTRks0qGg54gVSThy3rHnJCur2Jf-Id8'
// --------------------------------------------------------------------

export const supabase = createClient(supabaseUrl, supabaseAnonKey)