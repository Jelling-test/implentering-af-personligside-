// Backend til at hente live data fra Supabase Edge Function
// Hybrid løsning: Søger først i customer tabeller, derefter i webhook_data for udtjekkede gæster

export const mockValidateToken = async (token: string) => {
  // Hvis token er et booking ID (nummer), hent live data fra Supabase
  if (/^\d+$/.test(token)) {
    try {
      console.log('🔍 Henter live data for booking', token);
      
      const response = await fetch('https://jkmqliztlhmfyejhmuil.supabase.co/functions/v1/get-live-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ bookingId: parseInt(token) })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Live data hentet for booking', token);
        console.log('   Kilde:', data.source);
        console.log('   Gæst:', data.guest?.firstName, data.guest?.lastName);
        console.log('   Status: checkedIn=', data.guest?.checkedIn, ', checkedOut=', data.guest?.checkedOut);
        return data;
      } else {
        const errorData = await response.json();
        console.error('❌ Edge Function fejl:', response.status, errorData);
        throw new Error(errorData.error || 'Booking ikke fundet');
      }
    } catch (error) {
      console.error('❌ Fejl ved hentning af live data:', error);
      throw error;
    }
  }
  
  // For test tokens (ikke numeriske)
  throw new Error('Ugyldigt booking ID - skal være et nummer');
};
