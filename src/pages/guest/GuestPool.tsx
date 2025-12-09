import { useState, useEffect } from 'react';
import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, CreditCard, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HEADER_IMAGE = 'https://ljeszhbaqszgiyyrkxep.supabase.co/storage/v1/object/public/playground-images/friluftsbad.png';

// Edge function URL
const API_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4';

interface PoolSettings {
  access_title_da?: string;
  access_title_en?: string;
  access_title_de?: string;
  access_text_da?: string;
  access_text_en?: string;
  access_text_de?: string;
  morning_swim_time?: string;
  period1_dates?: string;
  period1_weekdays?: string;
  period1_weekend?: string;
  period2_dates?: string;
  period2_everyday?: string;
  period3_dates?: string;
  period3_weekdays?: string;
  period3_weekend?: string;
  closed_date?: string;
  location_address?: string;
  location_text_da?: string;
  location_text_en?: string;
  location_text_de?: string;
  external_url?: string;
}

const GuestPool = () => {
  const { language } = useGuest();
  const [settings, setSettings] = useState<PoolSettings>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}?action=get-facility-settings&facility=pool`, {
          headers: { 'Authorization': `Bearer ${ANON_KEY}` }
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching pool settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const getText = (da: string, en: string, de: string) => {
    if (language === 'de') return de;
    if (language === 'en') return en;
    return da;
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={getText('Jelling Friluftsbad', 'Jelling Outdoor Pool', 'Jelling Freibad')}
        subtitle={getText('Fri adgang for alle gæster', 'Free access for all guests', 'Freier Eintritt für alle Gäste')}
        image={HEADER_IMAGE}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Info kort */}
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-100 rounded-full">
                <CreditCard className="h-6 w-6 text-teal-700" />
              </div>
              <div>
                <h3 className="font-semibold text-teal-800 mb-2">
                  {getText(
                    settings.access_title_da || 'Fri adgang som gæst',
                    settings.access_title_en || 'Free access as guest',
                    settings.access_title_de || 'Freier Eintritt als Gast'
                  )}
                </h3>
                <p className="text-teal-700">
                  {getText(
                    settings.access_text_da || 'Som gæst på Jelling Camping har du fri adgang til friluftsbadet. Hent dit adgangskort i receptionen (depositum 200 kr).',
                    settings.access_text_en || 'As a guest at Jelling Camping you have free access to the outdoor pool. Pick up your access card at reception (deposit 200 DKK).',
                    settings.access_text_de || 'Als Gast auf Jelling Camping haben Sie freien Eintritt zum Freibad. Holen Sie Ihre Zugangskarte an der Rezeption ab (Kaution 200 DKK).'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Åbningstider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              {getText('Åbningstider 2025', 'Opening Hours 2025', 'Öffnungszeiten 2025')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">7. juni - 31. august 2025</p>
            
            {/* Morgensvømning */}
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">
                {getText('Morgensvømning', 'Morning Swim', 'Morgenschwimmen')}
              </h4>
              <p className="text-gray-600">{settings.morning_swim_time || '06:00 - 08:30'}</p>
            </div>
            
            {/* Periode 1 - Lavsæson start */}
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2 text-blue-700">
                {getText('Lavsæson', 'Low season', 'Nebensaison')}: {settings.period1_dates || '7. juni - 27. juni'}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">{getText('Hverdage', 'Weekdays', 'Wochentage')}:</span>
                  <span className="ml-2 font-medium">{settings.period1_weekdays || '15:00 - 19:00'}</span>
                </div>
                <div>
                  <span className="text-gray-500">{getText('Weekend', 'Weekend', 'Wochenende')}:</span>
                  <span className="ml-2 font-medium">{settings.period1_weekend || '12:00 - 20:00'}</span>
                </div>
              </div>
            </div>
            
            {/* Periode 2 - Højsæson */}
            <div className="border-b pb-4 bg-teal-50 -mx-6 px-6 py-4">
              <h4 className="font-medium mb-2 text-teal-700">
                {getText('Højsæson', 'High season', 'Hauptsaison')}: {settings.period2_dates || '28. juni - 10. august'}
              </h4>
              <div className="text-sm">
                <span className="text-gray-500">{getText('Alle dage', 'Every day', 'Alle Tage')}:</span>
                <span className="ml-2 font-medium">{settings.period2_everyday || '11:00 - 21:00'}</span>
              </div>
            </div>

            {/* Periode 3 - Lavsæson slut */}
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2 text-blue-700">
                {getText('Lavsæson', 'Low season', 'Nebensaison')}: {settings.period3_dates || '11. august - 31. august'}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">{getText('Hverdage', 'Weekdays', 'Wochentage')}:</span>
                  <span className="ml-2 font-medium">{settings.period3_weekdays || '15:00 - 19:00'}</span>
                </div>
                <div>
                  <span className="text-gray-500">{getText('Weekend', 'Weekend', 'Wochenende')}:</span>
                  <span className="ml-2 font-medium">{settings.period3_weekend || '12:00 - 20:00'}</span>
                </div>
              </div>
            </div>
            
            {/* Lukket */}
            {settings.closed_date && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {getText('Lukket', 'Closed', 'Geschlossen')} {settings.closed_date}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placering */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-600" />
              {getText('Placering', 'Location', 'Standort')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {settings.location_address || 'Mølvangvej 18, 7300 Jelling'}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              {getText(
                settings.location_text_da || 'Friluftsbadet ligger kun 2 minutters gang fra campingpladsen.',
                settings.location_text_en || 'The outdoor pool is only a 2 minute walk from the campsite.',
                settings.location_text_de || 'Das Freibad ist nur 2 Gehminuten vom Campingplatz entfernt.'
              )}
            </p>
            {(settings.external_url || 'https://www.vejle.dk/da/oplevelser/idraet-og-fritid/svoemmehaller-og-friluftsbade/jelling-friluftsbad/') && (
              <a 
                href={settings.external_url || 'https://www.vejle.dk/da/oplevelser/idraet-og-fritid/svoemmehaller-og-friluftsbade/jelling-friluftsbad/'} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {getText('Se mere på vejle.dk', 'See more at vejle.dk', 'Mehr auf vejle.dk')}
                </Button>
              </a>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default GuestPool;
