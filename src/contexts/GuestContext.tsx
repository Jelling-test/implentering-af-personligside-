import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const SUPABASE_URL = 'https://jkmqliztlhmfyejhmuil.supabase.co';

export type Language = 'da' | 'en' | 'de' | 'nl';
export type BookingType = 'camping' | 'cabin' | 'seasonal';

export interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  language: Language;
  country: string;
  arrivalDate: string;
  departureDate: string;
  checkedIn: boolean;
  checkedOut: boolean;
  bookingType: BookingType;
  previousVisits: number;
  meterId: string | null;
  spotNumber?: string;
  bookingId?: number;
  booking_nummer?: number;
  phone?: string;
}

interface GuestContextType {
  guest: GuestData;
  language: Language;
  setLanguage: (lang: Language) => void;
  setGuestData: (guestData: GuestData) => void;
  t: (key: string) => string;
}

// Default guest = IKKE logget ind - ingen adgang til systemet
const emptyGuest: GuestData = {
  firstName: "",
  lastName: "",
  email: "",
  language: "da",
  country: "DK",
  arrivalDate: "",
  departureDate: "",
  checkedIn: false,
  checkedOut: true, // Behandles som udtjekket = ingen adgang
  bookingType: "camping",
  previousVisits: 0,
  meterId: null,
  spotNumber: "",
  bookingId: undefined,
  booking_nummer: undefined,
  phone: ""
};

const translations: Record<Language, Record<string, string>> = {
  da: {
    'welcome': 'Velkommen',
    'welcomeBack': 'Velkommen tilbage',
    'stayInfo': 'Dit ophold',
    'arrival': 'Ankomst',
    'departure': 'Afrejse',
    'nightsRemaining': 'nætter tilbage',
    'checkedIn': 'Tjekket ind',
    'notCheckedIn': 'Ikke tjekket ind',
    'power': 'Strøm',
    'bakery': 'Bageri',
    'events': 'Events',
    'cafe': 'Café',
    'practical': 'Praktisk info',
    'quickActions': 'Hurtige handlinger',
    'powerManagement': 'Strømstyring',
    'orderBread': 'Bestil morgenbrød',
    'eventsActivities': 'Events & aktiviteter',
    'cafeOffers': 'Café & tilbud',
    'practicalInfo': 'Praktisk information',
    'back': 'Tilbage',
    'home': 'Hjem',
    'currentUsage': 'Nuværende forbrug',
    'noMeter': 'Ingen elmåler tilknyttet',
    'orderDeadline': 'Bestil inden kl. 18:00',
    'pickupTime': 'Afhentning kl. 7:00-9:00',
    'todaysEvents': 'Dagens events',
    'upcomingEvents': 'Kommende events',
    'openingHours': 'Åbningstider',
    'menuOfTheDay': 'Dagens menu',
    'wifiInfo': 'WiFi information',
    'emergencyContacts': 'Nødkontakter',
    'checkoutInfo': 'Check-out information',
    'facilities': 'Faciliteter',
    'cabin': 'Din hytte',
    'attractions': 'Attraktioner',
  },
  en: {
    'welcome': 'Welcome',
    'welcomeBack': 'Welcome back',
    'stayInfo': 'Your stay',
    'arrival': 'Arrival',
    'departure': 'Departure',
    'nightsRemaining': 'nights remaining',
    'checkedIn': 'Checked in',
    'notCheckedIn': 'Not checked in',
    'power': 'Power',
    'bakery': 'Bakery',
    'events': 'Events',
    'cafe': 'Café',
    'practical': 'Practical info',
    'quickActions': 'Quick actions',
    'powerManagement': 'Power management',
    'orderBread': 'Order bread rolls',
    'eventsActivities': 'Events & activities',
    'cafeOffers': 'Café & offers',
    'practicalInfo': 'Practical information',
    'back': 'Back',
    'home': 'Home',
    'currentUsage': 'Current usage',
    'noMeter': 'No power meter connected',
    'orderDeadline': 'Order before 6:00 PM',
    'pickupTime': 'Pickup 7:00-9:00 AM',
    'todaysEvents': "Today's events",
    'upcomingEvents': 'Upcoming events',
    'openingHours': 'Opening hours',
    'menuOfTheDay': 'Menu of the day',
    'wifiInfo': 'WiFi information',
    'emergencyContacts': 'Emergency contacts',
    'checkoutInfo': 'Check-out information',
    'facilities': 'Facilities',
    'cabin': 'Your cabin',
    'attractions': 'Attractions',
  },
  de: {
    'welcome': 'Willkommen',
    'welcomeBack': 'Willkommen zurück',
    'stayInfo': 'Ihr Aufenthalt',
    'arrival': 'Ankunft',
    'departure': 'Abreise',
    'nightsRemaining': 'Nächte verbleibend',
    'checkedIn': 'Eingecheckt',
    'notCheckedIn': 'Nicht eingecheckt',
    'power': 'Strom',
    'bakery': 'Bäckerei',
    'events': 'Events',
    'cafe': 'Café',
    'practical': 'Praktische Info',
    'quickActions': 'Schnellaktionen',
    'powerManagement': 'Stromverwaltung',
    'orderBread': 'Brötchen bestellen',
    'eventsActivities': 'Events & Aktivitäten',
    'cafeOffers': 'Café & Angebote',
    'practicalInfo': 'Praktische Informationen',
    'back': 'Zurück',
    'home': 'Startseite',
    'currentUsage': 'Aktueller Verbrauch',
    'noMeter': 'Kein Stromzähler verbunden',
    'orderDeadline': 'Bestellung bis 18:00 Uhr',
    'pickupTime': 'Abholung 7:00-9:00 Uhr',
    'todaysEvents': 'Heutige Events',
    'upcomingEvents': 'Kommende Events',
    'openingHours': 'Öffnungszeiten',
    'menuOfTheDay': 'Tagesmenü',
    'wifiInfo': 'WLAN Information',
    'emergencyContacts': 'Notfallkontakte',
    'checkoutInfo': 'Check-out Information',
    'facilities': 'Einrichtungen',
    'cabin': 'Ihre Hütte',
    'attractions': 'Attraktionen',
  },
  nl: {
    'welcome': 'Welkom',
    'welcomeBack': 'Welkom terug',
    'stayInfo': 'Uw verblijf',
    'arrival': 'Aankomst',
    'departure': 'Vertrek',
    'nightsRemaining': 'nachten over',
    'checkedIn': 'Ingecheckt',
    'notCheckedIn': 'Niet ingecheckt',
    'power': 'Stroom',
    'bakery': 'Bakkerij',
    'events': 'Evenementen',
    'cafe': 'Café',
    'practical': 'Praktische info',
    'quickActions': 'Snelle acties',
    'powerManagement': 'Stroombeheer',
    'orderBread': 'Broodjes bestellen',
    'eventsActivities': 'Evenementen & activiteiten',
    'cafeOffers': 'Café & aanbiedingen',
    'practicalInfo': 'Praktische informatie',
    'back': 'Terug',
    'home': 'Home',
    'currentUsage': 'Huidig verbruik',
    'noMeter': 'Geen stroommeter verbonden',
    'orderDeadline': 'Bestel voor 18:00 uur',
    'pickupTime': 'Ophalen 7:00-9:00 uur',
    'todaysEvents': 'Evenementen vandaag',
    'upcomingEvents': 'Komende evenementen',
    'openingHours': 'Openingstijden',
    'menuOfTheDay': 'Dagmenu',
    'wifiInfo': 'WiFi informatie',
    'emergencyContacts': 'Noodcontacten',
    'checkoutInfo': 'Check-out informatie',
    'facilities': 'Faciliteiten',
    'cabin': 'Uw hut',
    'attractions': 'Attracties',
  },
};

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const GuestProvider = ({ children }: { children: ReactNode }) => {
  // Hent gemt guest data fra sessionStorage (overlever refresh)
  const getStoredGuest = (): GuestData => {
    try {
      const stored = sessionStorage.getItem('guestData');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Kunne ikke læse gemt gæstedata:', e);
    }
    return emptyGuest;
  };

  const storedGuest = getStoredGuest();
  const [language, setLanguage] = useState<Language>(storedGuest.language);
  const [guest, setGuest] = useState<GuestData>(storedGuest);

  // Auto-reload guest data fra backend ved HVER page load
  // Bruger get-guest-status API der kun kræver bookingId (ikke magic token)
  useEffect(() => {
    const reloadGuestData = async () => {
      const bookingId = storedGuest.bookingId;
      
      // Hvis ingen bookingId, er bruger ikke logget ind
      if (!bookingId) return;
      
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/get-guest-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: bookingId }),
        });
        
        const data = await response.json();
        
        if (data?.valid && data?.guest) {
          // Opdater guest data med friske data fra backend
          setGuest(data.guest);
          setLanguage(data.guest.language);
          sessionStorage.setItem('guestData', JSON.stringify(data.guest));
          console.log('Guest data refreshed from backend');
        }
      } catch (err) {
        console.error('Could not refresh guest data:', err);
      }
    };
    
    reloadGuestData();
  }, []); // Kun ved mount

  // Gem guest data i sessionStorage når det ændres
  const setGuestData = (newGuest: GuestData) => {
    setGuest(newGuest);
    setLanguage(newGuest.language);
    try {
      sessionStorage.setItem('guestData', JSON.stringify(newGuest));
    } catch (e) {
      console.error('Kunne ikke gemme gæstedata:', e);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <GuestContext.Provider value={{ guest, language, setLanguage, setGuestData, t }}>
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};
