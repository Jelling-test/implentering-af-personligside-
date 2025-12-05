// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token er påkrævet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // For demo: Return mock data based on token
    // In production: Validate token against database and fetch real guest data
    let mockGuest = null
    
    if (token === 'test123') {
      mockGuest = {
        firstName: "Peter",
        lastName: "Jensen",
        email: "peter@jellingcamping.dk",
        language: "da",
        country: "DK",
        arrivalDate: "2025-12-10",
        departureDate: "2025-12-17",
        checkedIn: true,
        bookingType: "camping",
        previousVisits: 1,
        meterId: "meter_001"
      }
    } else if (token === 'demo') {
      mockGuest = {
        firstName: "Anna",
        lastName: "Nielsen",
        email: "anna@jellingcamping.dk",
        language: "da",
        country: "DK",
        arrivalDate: "2025-12-15",
        departureDate: "2025-12-22",
        checkedIn: false,
        bookingType: "cabin",
        previousVisits: 3,
        meterId: "meter_002"
      }
    }

    if (!mockGuest) {
      return new Response(
        JSON.stringify({ error: 'Ugyldigt token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    return new Response(
      JSON.stringify({ guest: mockGuest }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in validate-magic-token:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
