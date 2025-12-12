import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useGuest } from '../contexts/GuestContext';

const SUPABASE_URL = 'https://jkmqliztlhmfyejhmuil.supabase.co';

const MagicLink = () => {
  const { bookingId, token } = useParams();
  const navigate = useNavigate();
  const { setGuestData } = useGuest();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!bookingId || !token) {
        setError('Ugyldigt link - manglende booking eller token');
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
          setError(data.error || 'Ugyldigt eller udløbet link');
        }
      } catch (err) {
        console.error('Error validating token:', err);
        setError(err instanceof Error ? err.message : 'Der opstod en fejl under login');
      }
    };

    validateToken();
  }, [bookingId, token, navigate, setGuestData]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl">⚠️ Fejl</div>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="text-blue-500 hover:underline"
          >
            Tilbage til start
          </button>
        </div>
      </div>
    );
  }

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
