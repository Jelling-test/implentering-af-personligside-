import { createClient } from '@supabase/supabase-js'

// TEST projekt - ljeszhbaqszgiyyrkxep (Development)
const supabaseUrl = 'https://ljeszhbaqszgiyyrkxep.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4'

console.log('🔌 Supabase URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
