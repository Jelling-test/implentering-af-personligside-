import { createClient } from '@supabase/supabase-js'

// PRODUKTION projekt - jkmqliztlhmfyejhmuil
const supabaseUrl = 'https://jkmqliztlhmfyejhmuil.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprbXFsaXp0bGhtZnllamhtdWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MTYzODUsImV4cCI6MjA0ODA5MjM4NX0.w7PhLhQXqB_m4vEMpq7VsU78tUY8WqXxqCJKTuABv6k'

console.log('🔌 Supabase URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
