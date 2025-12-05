import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { mockValidateToken } from '../lib/mockBackend';
import { useGuest } from '../contexts/GuestContext';

const MagicLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setGuestData } = useGuest();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Ugyldigt link - manglende token');
        return;
      }

      try {
        // Use mock backend for now (until Supabase Edge Function is deployed)
        const data = await mockValidateToken(token);

        if (data?.guest) {
          // Update GuestContext with real guest data
          setGuestData(data.guest);
          navigate('/guest');
        } else {
          setError('Ingen gæste data fundet');
        }
      } catch (err) {
        console.error('Error validating token:', err);
        setError(err instanceof Error ? err.message : 'Der opstod en fejl under login');
      }
    };

    validateToken();
  }, [token, navigate, setGuestData]);

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
