import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Zap, ArrowRight, Loader2 } from 'lucide-react';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { guest, language } = useGuest();
  const [isLoading, setIsLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simuler loading mens vi "verificerer" betaling
    // I produktion ville vi kalde et API for at bekræfte Stripe session
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'da' ? 'Bekræfter betaling...' : 'Confirming payment...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={language === 'da' ? 'Betaling gennemført!' : 'Payment successful!'}
        subtitle={language === 'da' ? 'Tak for dit køb' : 'Thank you for your purchase'}
        image={HEADER_IMAGE}
      />
      
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Success card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {language === 'da' ? 'Din strømpakke er aktiveret!' : 'Your power package is activated!'}
            </h2>
            <p className="text-white/80">
              {language === 'da' 
                ? 'Du kan nu tænde strømmen på din måler'
                : 'You can now turn on the power at your meter'
              }
            </p>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-teal-600 mt-1" />
              <div>
                <p className="font-medium text-teal-800">
                  {language === 'da' ? 'Næste skridt' : 'Next step'}
                </p>
                <p className="text-sm text-teal-600 mt-1">
                  {language === 'da' 
                    ? 'Gå til strømstyring og tænd din måler'
                    : 'Go to power management and turn on your meter'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button */}
        <Button 
          onClick={() => navigate('/guest/power')}
          className="w-full h-14 text-lg bg-teal-600 hover:bg-teal-700"
        >
          <Zap className="h-5 w-5 mr-2" />
          {language === 'da' ? 'Gå til strømstyring' : 'Go to power management'}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>

        {/* Receipt info */}
        <p className="text-center text-sm text-gray-500">
          {language === 'da' 
            ? 'En kvittering er sendt til din email'
            : 'A receipt has been sent to your email'
          }
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
