import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Users, ExternalLink, Tent, Map, TreePine, Landmark, PawPrint, Mountain, Loader2, Navigation, Star, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=1200&q=80';

// Campingpladsens adresse for Google Maps rutevejledning
const CAMPING_LOCATION = 'Jelling+Familie+Camping,+M%C3%B8lvangvej+8,+7300+Jelling';

interface CampEvent {
  id: string;
  title: string;
  title_en?: string;
  title_de?: string;
  description: string;
  description_en?: string;
  description_de?: string;
  event_date: string;
  event_time: string;
  end_time?: string;
  location: string;
  target_group: 'families' | 'adults' | 'children' | 'all';
  registration_place: 'reception' | 'cafe' | 'none';
  max_participants?: number;
}

interface ExternalEvent {
  id: string;
  attraction_name: string;
  title: string;
  title_en?: string;
  title_de?: string;
  description?: string;
  description_en?: string;
  description_de?: string;
  event_date: string;
  event_time?: string;
  end_date?: string;
  location: string;
  distance_km: number;
  category: string;
  event_url?: string;
  attraction_url?: string;
}

// Unified event type for display
interface UnifiedEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location: string;
  distance_km: number;
  isInternal: boolean;
  // Internal event specific
  target_group?: 'families' | 'adults' | 'children' | 'all';
  registration_place?: 'reception' | 'cafe' | 'none';
  // External event specific
  attraction_name?: string;
  event_url?: string;
  attraction_url?: string;
  category?: string;
}

// Attraktioner i nærheden (max 50 km fra Jelling)
interface Attraction {
  id: string;
  name: string;
  description: string;
  distance: string;
  category: 'zoo' | 'museum' | 'nature' | 'adventure' | 'family';
  eventsUrl: string;
  mainUrl: string;
}

const nearbyAttractions: Attraction[] = [
  {
    id: 'givskud',
    name: 'GIVSKUD ZOO',
    description: 'Zoo, safari og dinosaurpark',
    distance: '20 km',
    category: 'zoo',
    eventsUrl: 'https://www.givskudzoo.dk/da/events-og-koncerter/',
    mainUrl: 'https://www.givskudzoo.dk',
  },
  {
    id: 'legoland',
    name: 'LEGOLAND Billund',
    description: 'Familieforlystelsespark',
    distance: '25 km',
    category: 'family',
    eventsUrl: 'https://www.legoland.dk/oplev/events/',
    mainUrl: 'https://www.legoland.dk',
  },
  {
    id: 'kongernes-jelling',
    name: 'Kongernes Jelling',
    description: 'UNESCO verdensarv - vikingemonumenter',
    distance: '0.5 km',
    category: 'museum',
    eventsUrl: 'https://natmus.dk/museer-og-slotte/kongernes-jelling/',
    mainUrl: 'https://natmus.dk/museer-og-slotte/kongernes-jelling/',
  },
  {
    id: 'oekolariet',
    name: 'Økolariet',
    description: 'Videns- og oplevelsescenter om klima',
    distance: '12 km',
    category: 'museum',
    eventsUrl: 'https://oekolariet.dk/kalender/',
    mainUrl: 'https://oekolariet.dk',
  },
  {
    id: 'gorilla-park',
    name: 'Gorilla Park Vejle',
    description: 'Trætopklatring for hele familien',
    distance: '15 km',
    category: 'adventure',
    eventsUrl: 'https://www.gorillapark.dk/vejle/',
    mainUrl: 'https://www.gorillapark.dk/vejle/',
  },
  {
    id: 'skaerup-zoo',
    name: 'Skærup Zoo',
    description: '100+ dyrearter og klappeged',
    distance: '20 km',
    category: 'zoo',
    eventsUrl: 'https://skaerupzoo.dk/',
    mainUrl: 'https://skaerupzoo.dk/',
  },
  {
    id: 'randboldal',
    name: 'Randbøldalmuseet',
    description: 'Natur, historie og håndværk',
    distance: '10 km',
    category: 'museum',
    eventsUrl: 'https://markup.dk/randboldal/',
    mainUrl: 'https://markup.dk/randboldal/',
  },
  {
    id: 'bindeballe',
    name: 'Bindeballe Købmandsgård',
    description: 'Historisk købmandsgård med museum',
    distance: '15 km',
    category: 'museum',
    eventsUrl: 'https://bindeballekoebmandsgaard.dk/',
    mainUrl: 'https://bindeballekoebmandsgaard.dk/',
  },
];

const GuestEvents = () => {
  const { t, language, guest } = useGuest();
  const [allEvents, setAllEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Beregn dato range: fra ankomst (eller i dag hvis ankomst er i fortiden) + 14 dage
  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const arrivalDate = new Date(guest.arrivalDate);
    arrivalDate.setHours(0, 0, 0, 0);
    
    // Start fra ankomst eller i dag (hvad der er senest)
    const startDate = arrivalDate > today ? arrivalDate : today;
    
    // 14 dage frem
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { start, end } = getDateRange();
        
        // Hent interne events
        const { data: internalData, error: internalError } = await supabase
          .from('camp_events')
          .select('*')
          .gte('event_date', start)
          .lte('event_date', end)
          .order('event_date', { ascending: true });

        if (internalError) throw internalError;

        // Hent eksterne events (max 50 km)
        const { data: externalData, error: externalError } = await supabase
          .from('external_events')
          .select('*')
          .gte('event_date', start)
          .lte('event_date', end)
          .lte('distance_km', 50)
          .order('event_date', { ascending: true });

        if (externalError) throw externalError;

        // Konverter til unified format
        const internalEvents: UnifiedEvent[] = (internalData || []).map(e => ({
          id: e.id,
          title: language === 'en' && e.title_en ? e.title_en : language === 'de' && e.title_de ? e.title_de : e.title,
          description: language === 'en' && e.description_en ? e.description_en : language === 'de' && e.description_de ? e.description_de : e.description,
          event_date: e.event_date,
          event_time: e.event_time,
          location: e.location,
          distance_km: 0, // Intern = på pladsen
          isInternal: true,
          target_group: e.target_group,
          registration_place: e.registration_place,
        }));

        const externalEvents: UnifiedEvent[] = (externalData || []).map(e => ({
          id: e.id,
          title: language === 'en' && e.title_en ? e.title_en : language === 'de' && e.title_de ? e.title_de : e.title,
          description: language === 'en' && e.description_en ? e.description_en : language === 'de' && e.description_de ? e.description_de : e.description,
          event_date: e.event_date,
          event_time: e.event_time,
          location: e.location,
          distance_km: e.distance_km,
          isInternal: false,
          attraction_name: e.attraction_name,
          event_url: e.event_url,
          attraction_url: e.attraction_url,
          category: e.category,
        }));

        // Kombiner og sorter: interne først, derefter efter dato
        const combined = [...internalEvents, ...externalEvents].sort((a, b) => {
          // Interne events først på samme dato
          if (a.event_date === b.event_date) {
            if (a.isInternal && !b.isInternal) return -1;
            if (!a.isInternal && b.isInternal) return 1;
            return (a.distance_km || 0) - (b.distance_km || 0);
          }
          return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        });

        setAllEvents(combined);
      } catch (err) {
        console.error('Fejl ved hentning af events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [guest.arrivalDate, language]);


  const formatDate = (dateStr: string) => {
    const locale = language === 'da' ? 'da-DK' : language === 'de' ? 'de-DE' : language === 'nl' ? 'nl-NL' : 'en-GB';
    return new Date(dateStr).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getTargetGroupLabel = (group: CampEvent['target_group']) => {
    const labels = {
      families: { da: 'Familier', en: 'Families', de: 'Familien', nl: 'Gezinnen' },
      adults: { da: 'Voksne', en: 'Adults', de: 'Erwachsene', nl: 'Volwassenen' },
      children: { da: 'Børn', en: 'Children', de: 'Kinder', nl: 'Kinderen' },
      all: { da: 'Alle', en: 'Everyone', de: 'Alle', nl: 'Iedereen' },
    };
    return labels[group][language] || labels[group]['en'];
  };

  const getRegistrationLabel = (place: CampEvent['registration_place']) => {
    if (place === 'none') return null;
    const labels = {
      reception: { da: 'Tilmeld i receptionen', en: 'Sign up at reception', de: 'Anmeldung an der Rezeption', nl: 'Aanmelden bij receptie' },
      cafe: { da: 'Tilmeld i caféen', en: 'Sign up at café', de: 'Anmeldung im Café', nl: 'Aanmelden in café' },
    };
    return labels[place][language] || labels[place]['en'];
  };

  // Unified Event Card - viser både interne og eksterne events
  const UnifiedEventCard = ({ event }: { event: UnifiedEvent }) => {
    const isInternal = event.isInternal;
    
    return (
      <Card className={`overflow-hidden transition-all ${
        isInternal 
          ? 'border-2 border-teal-300 bg-gradient-to-r from-teal-50 to-white shadow-md hover:shadow-lg' 
          : 'hover:shadow-md'
      }`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {isInternal && (
                <div className="flex items-center gap-1 text-teal-600">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <h3 className={`font-semibold ${isInternal ? 'text-teal-800' : 'text-foreground'}`}>
                {event.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {isInternal ? (
                <Badge className="bg-teal-600 text-white text-xs">
                  <Tent className="h-3 w-3 mr-1" />
                  {language === 'da' ? 'På pladsen' : 'On-site'}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {event.distance_km} km
                </Badge>
              )}
              {event.target_group && (
                <Badge variant="outline" className="text-xs">
                  {getTargetGroupLabel(event.target_group)}
                </Badge>
              )}
            </div>
          </div>
          
          {!isInternal && event.attraction_name && (
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.attraction_name}
            </p>
          )}
          
          {event.description && (
            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
          )}
          
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {formatDate(event.event_date)}
            </span>
            {event.event_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {event.event_time.slice(0, 5)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Intern event: tilmelding */}
            {isInternal && event.registration_place && event.registration_place !== 'none' && (
              <Button variant="default" size="sm" className="bg-teal-600 hover:bg-teal-700">
                {getRegistrationLabel(event.registration_place)}
              </Button>
            )}
            
            {/* Ekstern event: links */}
            {!isInternal && (
              <>
                {event.event_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => window.open(event.event_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {language === 'da' ? 'Læs mere' : 'Read more'}
                  </Button>
                )}
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open(getDirectionsUrl(event.attraction_name || event.location), '_blank')}
                >
                  <Navigation className="h-4 w-4" />
                  {language === 'da' ? 'Find vej' : 'Directions'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const getCategoryIcon = (category: Attraction['category']) => {
    switch (category) {
      case 'zoo': return PawPrint;
      case 'museum': return Landmark;
      case 'nature': return TreePine;
      case 'adventure': return Mountain;
      case 'family': return Users;
      default: return MapPin;
    }
  };

  const getCategoryColor = (category: Attraction['category']) => {
    switch (category) {
      case 'zoo': return 'bg-amber-100 text-amber-600';
      case 'museum': return 'bg-purple-100 text-purple-600';
      case 'nature': return 'bg-green-100 text-green-600';
      case 'adventure': return 'bg-red-100 text-red-600';
      case 'family': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Generer Google Maps URL fra campingpladsen til attraktionen
  const getDirectionsUrl = (attractionName: string) => {
    const destination = encodeURIComponent(attractionName + ', Denmark');
    return `https://www.google.com/maps/dir/${CAMPING_LOCATION}/${destination}`;
  };

  const AttractionCard = ({ attraction }: { attraction: Attraction }) => {
    const IconComponent = getCategoryIcon(attraction.category);
    const colorClass = getCategoryColor(attraction.category);
    
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-foreground">{attraction.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {attraction.distance}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{attraction.description}</p>
              <div className="flex flex-wrap gap-2">
                {/* Find vej knap - Google Maps */}
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open(getDirectionsUrl(attraction.name), '_blank')}
                >
                  <Navigation className="h-4 w-4" />
                  {language === 'da' ? 'Find vej' : language === 'de' ? 'Route' : language === 'nl' ? 'Routebeschrijving' : 'Directions'}
                </Button>
                {/* Besøg hjemmeside - med tydelig ekstern markering */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => window.open(attraction.mainUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  {language === 'da' ? 'Besøg hjemmeside' : language === 'de' ? 'Webseite besuchen' : language === 'nl' ? 'Bezoek website' : 'Visit website'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                {language === 'da' ? '↗ Åbner i nyt vindue' : '↗ Opens in new window'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={t('eventsActivities')}
        subtitle={language === 'da' ? 'Oplevelser og aktiviteter' : 'Experiences and activities'}
        image={HEADER_IMAGE}
      />
      
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* EVENTS I DIN PERIODE */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-xl text-gray-800">
                {language === 'da' ? 'Events i din periode' : language === 'de' ? 'Events in Ihrem Zeitraum' : 'Events during your stay'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'da' ? 'De næste 14 dage • Max 50 km' : 'Next 14 days • Max 50 km'}
              </p>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-muted-foreground">
                {language === 'da' ? 'På campingpladsen' : 'At the campsite'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-muted-foreground">
                {language === 'da' ? 'I nærheden' : 'Nearby'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              </div>
            ) : allEvents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {language === 'da' ? 'Ingen events fundet i denne periode' : 
                     language === 'de' ? 'Keine Events in diesem Zeitraum gefunden' : 
                     'No events found in this period'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              allEvents.map(event => (
                <UnifiedEventCard key={event.id} event={event} />
              ))
            )}
          </div>
        </section>

        {/* ATTRAKTIONER I NÆRHEDEN */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Map className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-xl text-gray-800">
                {language === 'da' ? 'Attraktioner i nærheden' : language === 'de' ? 'Attraktionen in der Nähe' : language === 'nl' ? 'Attracties in de buurt' : 'Nearby attractions'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'da' ? 'Max 50 km fra Jelling' : 'Max 50 km from Jelling'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {nearbyAttractions.map(attraction => (
              <AttractionCard key={attraction.id} attraction={attraction} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default GuestEvents;
