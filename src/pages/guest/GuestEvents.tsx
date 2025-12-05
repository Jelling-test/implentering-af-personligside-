import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Users, ExternalLink, Tent, Map } from 'lucide-react';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=1200&q=80';

interface CampEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  targetGroup: 'families' | 'adults' | 'children' | 'all';
  registrationPlace: 'reception' | 'cafe' | 'none';
}

interface ExternalEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  externalUrl: string;
}

// Events PÅ PLADSEN
const mockCampEvents: CampEvent[] = [
  {
    id: '1',
    title: 'Pandekage Aften',
    description: 'All-you-can-eat pandekager for hele familien!',
    date: '2025-12-12',
    time: '18:00',
    location: 'Caféen',
    targetGroup: 'families',
    registrationPlace: 'cafe',
  },
  {
    id: '2',
    title: 'Bingo Aften',
    description: 'Hyggelig bingo med fine præmier',
    date: '2025-12-14',
    time: '19:30',
    location: 'Fællesrummet',
    targetGroup: 'all',
    registrationPlace: 'reception',
  },
  {
    id: '3',
    title: 'Morgenyoga',
    description: 'Start dagen med rolig yoga for alle niveauer',
    date: '2025-12-15',
    time: '08:00',
    location: 'Fællesområdet',
    targetGroup: 'adults',
    registrationPlace: 'none',
  },
];

// Events I OMRÅDET (eksterne)
const mockExternalEvents: ExternalEvent[] = [
  {
    id: '101',
    title: 'Jelling Vikingemarked',
    date: '2025-12-13',
    time: '10:00-16:00',
    location: 'Jellingestenene',
    distance: '1.2 km',
    externalUrl: 'https://natmus.dk/jelling',
  },
  {
    id: '102',
    title: 'Julekoncert i Vejle Kirke',
    date: '2025-12-15',
    time: '19:00',
    location: 'Vejle Kirke',
    distance: '12 km',
    externalUrl: 'https://vejlekirke.dk',
  },
  {
    id: '103',
    title: 'LEGOLAND Vinterevent',
    date: '2025-12-10',
    time: '10:00-18:00',
    location: 'LEGOLAND Billund',
    distance: '25 km',
    externalUrl: 'https://legoland.dk',
  },
];

const GuestEvents = () => {
  const { t, language } = useGuest();

  const formatDate = (dateStr: string) => {
    const locale = language === 'da' ? 'da-DK' : language === 'de' ? 'de-DE' : language === 'nl' ? 'nl-NL' : 'en-GB';
    return new Date(dateStr).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getTargetGroupLabel = (group: CampEvent['targetGroup']) => {
    const labels = {
      families: { da: 'Familier', en: 'Families', de: 'Familien', nl: 'Gezinnen' },
      adults: { da: 'Voksne', en: 'Adults', de: 'Erwachsene', nl: 'Volwassenen' },
      children: { da: 'Børn', en: 'Children', de: 'Kinder', nl: 'Kinderen' },
      all: { da: 'Alle', en: 'Everyone', de: 'Alle', nl: 'Iedereen' },
    };
    return labels[group][language] || labels[group]['en'];
  };

  const getRegistrationLabel = (place: CampEvent['registrationPlace']) => {
    if (place === 'none') return null;
    const labels = {
      reception: { da: 'Tilmeld i receptionen', en: 'Sign up at reception', de: 'Anmeldung an der Rezeption', nl: 'Aanmelden bij receptie' },
      cafe: { da: 'Tilmeld i caféen', en: 'Sign up at café', de: 'Anmeldung im Café', nl: 'Aanmelden in café' },
    };
    return labels[place][language] || labels[place]['en'];
  };

  const CampEventCard = ({ event }: { event: CampEvent }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-foreground">{event.title}</h3>
          <Badge variant="outline" className="text-xs">
            {getTargetGroupLabel(event.targetGroup)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {event.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {event.location}
          </span>
        </div>
        {event.registrationPlace !== 'none' && (
          <Button variant="outline" size="sm" className="w-full">
            {getRegistrationLabel(event.registrationPlace)}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const ExternalEventCard = ({ event }: { event: ExternalEvent }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-foreground">{event.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {event.distance}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {event.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {event.location}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
          onClick={() => window.open(event.externalUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          {language === 'da' ? 'Mere info' : language === 'de' ? 'Mehr Info' : language === 'nl' ? 'Meer info' : 'More info'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={t('eventsActivities')}
        subtitle={language === 'da' ? 'Oplevelser og aktiviteter' : 'Experiences and activities'}
        image={HEADER_IMAGE}
      />
      
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* PÅ PLADSEN */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
              <Tent className="h-5 w-5 text-teal-600" />
            </div>
            <h2 className="font-semibold text-xl text-gray-800">
              {language === 'da' ? 'På pladsen' : language === 'de' ? 'Auf dem Platz' : language === 'nl' ? 'Op de camping' : 'At the campsite'}
            </h2>
          </div>
          <div className="space-y-3">
            {mockCampEvents.map(event => (
              <CampEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* I OMRÅDET */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Map className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-xl text-gray-800">
              {language === 'da' ? 'I området' : language === 'de' ? 'In der Umgebung' : language === 'nl' ? 'In de omgeving' : 'In the area'}
            </h2>
          </div>
          <div className="space-y-3">
            {mockExternalEvents.map(event => (
              <ExternalEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default GuestEvents;
