import { createClient } from '@supabase/supabase-js'

// PRODUKTION projekt - jkmqliztlhmfyejhmuil
const supabaseUrl = 'https://jkmqliztlhmfyejhmuil.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprbXFsaXp0bGhtZnllamhtdWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODQ5NzAsImV4cCI6MjA3NjU2MDk3MH0.QBlcBs-3Udf0C3qAc7efxyUddzPnjTPR2ROSA3dHqeQ'

console.log('🔌 Supabase URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
