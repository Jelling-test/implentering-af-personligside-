import { Link } from 'react-router-dom';
import { useGuest } from '@/contexts/GuestContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Croissant, 
  CalendarDays, 
  Coffee, 
  Info,
  CheckCircle2,
  Home,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain
} from 'lucide-react';

// Billeder fra Jelling Camping stil
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1600&q=80', // Familie camping
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80', // Telt i natur
  'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1600&q=80', // Campingvogn
];

const SECTION_IMAGES = {
  power: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  events: 'https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=800&q=80',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  practical: 'https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=800&q=80',
  cabin: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80',
};

const GuestWelcome = () => {
  const { guest, t, language } = useGuest();

  const arrivalDate = new Date(guest.arrivalDate);
  const departureDate = new Date(guest.departureDate);
  const today = new Date();
  const nightsRemaining = Math.max(0, Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const formatDate = (date: Date) => {
    const locale = language === 'da' ? 'da-DK' : language === 'de' ? 'de-DE' : 'en-GB';
    return date.toLocaleDateString(locale, { 
      day: 'numeric', 
      month: 'long'
    });
  };

  const sections = [
    { to: '/guest/power', image: SECTION_IMAGES.power, label: t('power'), sublabel: language === 'da' ? 'Styr din strøm' : 'Manage your power' },
    { to: '/guest/bakery', image: SECTION_IMAGES.bakery, label: t('bakery'), sublabel: language === 'da' ? 'Friske morgenbrød' : 'Fresh morning bread' },
    { to: '/guest/events', image: SECTION_IMAGES.events, label: t('events'), sublabel: language === 'da' ? 'Se hvad der sker' : 'See what\'s happening' },
    { to: '/guest/cafe', image: SECTION_IMAGES.cafe, label: t('cafe'), sublabel: language === 'da' ? 'Mad & drikke' : 'Food & drinks' },
    { to: '/guest/practical', image: SECTION_IMAGES.practical, label: t('practical'), sublabel: language === 'da' ? 'Nødvendig info' : 'Essential info' },
  ];

  // Tilføj Cabin for hytte-gæster
  if (guest.bookingType === 'cabin') {
    sections.push({ 
      to: '/guest/cabin', 
      image: SECTION_IMAGES.cabin, 
      label: t('cabin') || 'Din hytte',
      sublabel: language === 'da' ? 'Info om din hytte' : 'Cabin information'
    });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Fullscreen billede som på jellingcamping.dk */}
      <div 
        className="relative h-[50vh] sm:h-[60vh] bg-cover bg-center"
        style={{
          backgroundImage: `url('${HERO_IMAGES[0]}')`
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
          <p className="text-white/80 text-sm sm:text-base tracking-widest uppercase mb-2">
            {language === 'da' ? 'Velkommen til' : language === 'de' ? 'Willkommen bei' : 'Welcome to'}
          </p>
          <h1 className="text-white text-4xl sm:text-6xl font-serif font-light mb-2">
            JELLING
          </h1>
          <h1 className="text-white text-4xl sm:text-6xl font-serif font-light mb-4">
            FAMILIE CAMPING
          </h1>
          
          {/* Gæst badge */}
          <div className="flex items-center gap-3 mb-4">
            <Badge 
              className={`${guest.checkedIn ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-600'} text-white border-0 text-sm px-3 py-1`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {guest.checkedIn ? t('checkedIn') : t('notCheckedIn')}
            </Badge>
          </div>

          <p className="text-white text-xl sm:text-2xl font-light">
            {guest.previousVisits > 0 ? t('welcomeBack') : t('welcome')}, {guest.firstName}!
          </p>
        </div>
      </div>

      {/* Teal info banner - som på jellingcamping.dk */}
      <div className="bg-teal-700 text-white py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="opacity-80">{t('arrival')}:</span>
              <span className="font-semibold">{formatDate(arrivalDate)}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="opacity-80">{t('departure')}:</span>
              <span className="font-semibold">{formatDate(departureDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <span className="text-2xl font-bold">{nightsRemaining}</span>
            <span className="text-sm opacity-90">{t('nightsRemaining')}</span>
          </div>
        </div>
      </div>

      {/* Vejr sektion */}
      <div className="bg-gray-50 py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-center gap-8">
          <div className="flex items-center gap-3">
            <Cloud className="h-8 w-8 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 uppercase">{language === 'da' ? 'I dag' : 'Today'}</p>
              <p className="text-lg font-semibold text-gray-800">5°C</p>
            </div>
          </div>
          <div className="w-px bg-gray-300" />
          <div className="flex items-center gap-3">
            <CloudRain className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500 uppercase">{language === 'da' ? 'I morgen' : 'Tomorrow'}</p>
              <p className="text-lg font-semibold text-gray-800">3°C</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid sektioner - som på jellingcamping.dk */}
      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <Link
                key={section.to}
                to={section.to}
                className="group relative h-48 sm:h-64 overflow-hidden rounded-lg"
              >
                {/* Baggrundsbillede */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${section.image}')` }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-white text-2xl font-semibold mb-1">
                    {section.label}
                  </h3>
                  <p className="text-white/80 text-sm mb-3">
                    {section.sublabel}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-fit bg-transparent border-white text-white hover:bg-white hover:text-gray-900 transition-colors"
                  >
                    {language === 'da' ? 'Se mere' : 'View'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer message - som på jellingcamping.dk */}
      <div 
        className="relative h-48 sm:h-64 bg-cover bg-center mt-4"
        style={{
          backgroundImage: `url('${HERO_IMAGES[1]}')`
        }}
      >
        <div className="absolute inset-0 bg-teal-800/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-white text-2xl sm:text-4xl font-serif mb-4">
            {language === 'da' ? 'Vi glæder os til at gøre dit ophold uforglemmelig' : 
             language === 'de' ? 'Wir freuen uns, Ihren Aufenthalt unvergesslich zu machen' :
             'We look forward to making your stay unforgettable'}
          </h2>
          <p className="text-white/80 text-sm">
            {language === 'da' ? 'Receptionen er åben alle dage 08.00 - 20.00' :
             language === 'de' ? 'Rezeption geöffnet täglich 08.00 - 20.00' :
             'Reception open daily 08.00 - 20.00'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestWelcome;
