import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useGuest } from '../contexts/GuestContext';

const SUPABASE_URL = 'https://jkmqliztlhmfyejhmuil.supabase.co';

const MagicLink = () => {
  const { bookingId, token } = useParams();
  const navigate = useNavigate();
  const { setGuestData } = useGuest();

  useEffect(() => {
    const validateToken = async () => {
      if (!bookingId || !token) {
        // Manglende parametre = send til "tak for ophold" siden
        navigate('/guest/departed');
        return;
      }

      try {
        // Call live Edge Function to validate magic link
        const response = await fetch(`${SUPABASE_URL}/functions/v1/validate-magic-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: parseInt(bookingId), token }),
        });

        const data = await response.json();

        if (data?.valid && data?.guest) {
          // Gem magic token til auto-reload ved page refresh
          sessionStorage.setItem('guestMagicToken', token);
          // Update GuestContext with real guest data
          setGuestData(data.guest);
          navigate('/guest');
        } else {
          // Ugyldigt link = kunde er sandsynligvis udtjekket (GDPR slettet)
          // Send til "tak for ophold" siden
          navigate('/guest/departed');
        }
      } catch (err) {
        console.error('Error validating token:', err);
        // Ved fejl, send også til departed siden
        navigate('/guest/departed');
      }
    };

    validateToken();
  }, [bookingId, token, navigate, setGuestData]);

  // Vis kun loading mens vi validerer
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Validerer token og henter dine data...</p>
      </div>
    </div>
  );
};

export default MagicLink;
