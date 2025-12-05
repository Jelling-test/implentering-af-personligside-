import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const MagicLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // In production, validate token with backend
    // For now, simulate a brief loading and redirect
    const timer = setTimeout(() => {
      navigate('/guest');
    }, 1500);

    return () => clearTimeout(timer);
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Logger ind...</p>
      </div>
    </div>
  );
};

export default MagicLink;
