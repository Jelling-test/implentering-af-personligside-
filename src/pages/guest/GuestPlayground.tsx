import { useState, useEffect } from 'react';
import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Baby, TreePine, Car, Flag } from 'lucide-react';

// Billeder fra Supabase Storage
const STORAGE_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/storage/v1/object/public/playground-images';
const HEADER_IMAGE = `${STORAGE_URL}/IMG_7740.jpg`;

// Edge function URL
const API_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4';

interface PlaygroundSettings {
  dinocar_title?: string;
  dinocar_text_da?: string;
  dinocar_text_en?: string;
  dinocar_text_de?: string;
  hoppepude_title?: string;
  hoppepude_text_da?: string;
  hoppepude_text_en?: string;
  hoppepude_text_de?: string;
  minigolf_title?: string;
  minigolf_text_da?: string;
  minigolf_text_en?: string;
  minigolf_text_de?: string;
  open_text_da?: string;
  open_text_en?: string;
  open_text_de?: string;
}

const GuestPlayground = () => {
  const { language } = useGuest();
  const [settings, setSettings] = useState<PlaygroundSettings>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}?action=get-facility-settings&facility=playground`, {
          headers: { 'Authorization': `Bearer ${ANON_KEY}` }
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching playground settings:', error);
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
        title={getText('Legeplads', 'Playground', 'Spielplatz')}
        subtitle={getText('Sjov for hele familien', 'Fun for the whole family', 'Spaß für die ganze Familie')}
        image={HEADER_IMAGE}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Åbningstider */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 mb-2">
                  {getText('Altid åben', 'Always open', 'Immer geöffnet')}
                </h3>
                <p className="text-green-700">
                  {getText(
                    settings.open_text_da || 'Legepladsen er åben døgnet rundt for alle campingens gæster.',
                    settings.open_text_en || 'The playground is open 24 hours for all campsite guests.',
                    settings.open_text_de || 'Der Spielplatz ist rund um die Uhr für alle Campingplatzgäste geöffnet.'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dino Cars */}
        <Card className="border-red-200 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <img 
              src={`${STORAGE_URL}/dinocar.jpg`}
              alt="Dino Cars"
              className="w-full h-48 md:h-full object-cover"
            />
            <CardContent className="p-6 bg-red-50 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Car className="h-5 w-5 text-red-700" />
                </div>
                <h3 className="font-semibold text-red-800 text-lg">
                  {settings.dinocar_title || 'Dino Cars'}
                </h3>
              </div>
              <p className="text-red-700">
                {getText(
                  settings.dinocar_text_da || 'Vi har sjove Dino Cars som børnene kan køre rundt på pladsen. Spørg i receptionen!',
                  settings.dinocar_text_en || 'We have fun Dino Cars that children can drive around the campsite. Ask at reception!',
                  settings.dinocar_text_de || 'Wir haben lustige Dino Cars, mit denen Kinder auf dem Campingplatz fahren können. Fragen Sie an der Rezeption!'
                )}
              </p>
            </CardContent>
          </div>
        </Card>

        {/* Hoppepude */}
        <Card className="border-blue-200 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <img 
              src={`${STORAGE_URL}/hoppepude.png`}
              alt="Hoppepude"
              className="w-full h-48 md:h-full object-cover"
            />
            <CardContent className="p-6 bg-blue-50 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Baby className="h-5 w-5 text-blue-700" />
                </div>
                <h3 className="font-semibold text-blue-800 text-lg">
                  {settings.hoppepude_title || getText('Hoppepude', 'Jumping Pillow', 'Hüpfkissen')}
                </h3>
              </div>
              <p className="text-blue-700">
                {getText(
                  settings.hoppepude_text_da || 'Vores store hoppepude er et hit hos børnene. Perfekt til at brænde energi af!',
                  settings.hoppepude_text_en || 'Our large jumping pillow is a hit with the kids. Perfect for burning off energy!',
                  settings.hoppepude_text_de || 'Unser großes Hüpfkissen ist ein Hit bei den Kindern. Perfekt um Energie abzubauen!'
                )}
              </p>
            </CardContent>
          </div>
        </Card>

        {/* Minigolf */}
        <Card className="border-green-200 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <img 
              src={`${STORAGE_URL}/minigolf.jpg`}
              alt="Minigolf"
              className="w-full h-48 md:h-full object-cover"
            />
            <CardContent className="p-6 bg-green-50 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Flag className="h-5 w-5 text-green-700" />
                </div>
                <h3 className="font-semibold text-green-800 text-lg">
                  {settings.minigolf_title || getText('Minigolf', 'Mini Golf', 'Minigolf')}
                </h3>
              </div>
              <p className="text-green-700">
                {getText(
                  settings.minigolf_text_da || 'Prøv vores 18-hullers minigolfbane. Køller og bolde kan lånes i receptionen.',
                  settings.minigolf_text_en || 'Try our 18-hole mini golf course. Clubs and balls can be borrowed at reception.',
                  settings.minigolf_text_de || 'Probieren Sie unseren 18-Loch-Minigolfplatz. Schläger und Bälle können an der Rezeption ausgeliehen werden.'
                )}
              </p>
            </CardContent>
          </div>
        </Card>

        {/* Faciliteter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-600" />
              {getText('Øvrige faciliteter', 'Other facilities', 'Weitere Einrichtungen')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 gap-3 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {getText('Gynger', 'Swings', 'Schaukeln')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {getText('Rutsjebane', 'Slide', 'Rutsche')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {getText('Klatrestativ', 'Climbing frame', 'Klettergerüst')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {getText('Sandkasse', 'Sandbox', 'Sandkasten')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {getText('Vippe', 'Seesaw', 'Wippe')}
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Placering */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              {getText('Placering', 'Location', 'Standort')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {getText(
                'Legepladsen ligger centralt på campingpladsen ved servicebygningen.',
                'The playground is centrally located on the campsite near the service building.',
                'Der Spielplatz befindet sich zentral auf dem Campingplatz in der Nähe des Servicegebäudes.'
              )}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default GuestPlayground;
