// Backend til at hente live data fra Supabase Edge Function
// Hybrid løsning: Søger først i mock data, derefter Edge Function

// ============================================
// MOCK DATA TIL DEVELOPMENT/TESTING
// ============================================
// Brug disse test-tokens: kommende, campist, saeson, hytte, rejst, 46164, 46165
// ============================================

const mockGuests: Record<string, any> = {
  // KUNDE 46134 - Sæson-gæst med 2 målere
  '46134': {
    guest: {
      firstName: 'Stefan',
      lastName: 'Sæsongæst',
      email: 'stefan@test.dk',
      phone: '+4512345678',
      language: 'da',
      country: 'DK',
      arrivalDate: '2025-04-01',
      departureDate: '2025-10-01',
      spotNumber: '214',
      meterId: 'Måler 214',
      checkedIn: true,
      checkedOut: false,
      bookingType: 'seasonal',
      previousVisits: 5,
      bookingId: 46134,
      booking_nummer: 46134,
      // Sæson aktiveringspakke
      powerPackage: {
        id: 'saeson-pakke-46134',
        status: 'aktiv',
        name: '100 enheder (sæson)',
        totalEnheder: 100,
        usedEnheder: 15.82,
        remainingEnheder: 84.18,
        expiresAt: null,  // Sæsonpakke udløber ikke
      },
      // 2 målere
      meters: [
        {
          id: 'Måler 214',
          name: 'Måler 214',
          isPowerOn: true,
          usedEnheder: 10.5,
          currentPower: 311.0,
          voltage: 233,
          current: 1.39,
        },
        {
          id: 'Måler 215',
          name: 'Måler 215 (ekstra)',
          isPowerOn: true,
          usedEnheder: 5.32,
          currentPower: 120.0,
          voltage: 231,
          current: 0.52,
        }
      ],
    },
    source: 'mock_data'
  },

  // KUNDE 46165 - Hytte-gæst (hytte 26, tjekket ind)
  '46165': {
    guest: {
      firstName: 'Peter',
      lastName: 'Gosvig',
      email: 'peter@jellingcamping.dk',
      phone: '+4581826301',
      language: 'da',
      country: 'DK',
      arrivalDate: '2025-12-08',
      departureDate: '2025-12-09',
      spotNumber: '26',  // Hytte nummer
      meterId: 'Hytte 26',  // Automatisk tildelt måler
      checkedIn: true,
      checkedOut: false,
      bookingType: 'cabin',  // HYTTE
      previousVisits: 3,
      bookingId: 46165,
      booking_nummer: 46165,
      // Hytte prepaid pakke (10 enheder pr dag)
      powerPackage: {
        id: 'hytte-prepaid-46165',
        status: 'aktiv',
        name: 'Energipakke 1 dag',
        totalEnheder: 10,  // 1 dag × 10 enheder
        usedEnheder: 2.5,  // Simuleret forbrug
        remainingEnheder: 7.5,
        expiresAt: null,  // Ingen udløb - følger ophold
      },
      // Hytte måler
      meters: [{
        id: 'Hytte 26',
        name: 'Hytte 26',
        isPowerOn: true,
        usedEnheder: 2.5,
        currentPower: 360.0,  // Effekt i Watt
        voltage: 233,          // Spænding i Volt
        current: 1.55,         // Strømstyrke i Ampere
      }],
    },
    source: 'mock_data'
  },

  // KUNDE 46164 - Kommende kørende campist (ankomst 10. dec)
  '46164': {
    guest: {
      firstName: 'Peter',
      lastName: 'Gosvig',
      email: 'peter@jellingcamping.dk',
      phone: '+4581826301',
      language: 'da',
      country: 'DK',
      arrivalDate: '2025-12-10',
      departureDate: '2025-12-13',
      spotNumber: null,
      meterId: null,
      checkedIn: false,
      checkedOut: false,
      bookingType: 'camping',
      previousVisits: 3,
      bookingId: 46164,
      booking_nummer: 46164,
    },
    source: 'mock_data'
  },

  // 1. Kommende gæst (ikke ankommet endnu) - RIGTIG KUNDE 46163
  'kommende': {
    guest: {
      firstName: 'Berit',
      lastName: 'Gosvig',
      email: 'berit@jellingcamping.dk',
      phone: '+45 12345678',
      language: 'da',
      country: 'DK',
      arrivalDate: '2025-12-08',
      departureDate: '2025-12-28',
      spotNumber: null,
      meterId: null,
      checkedIn: true,
      checkedOut: false,
      bookingType: 'seasonal',
      previousVisits: 0,
      bookingId: 46163,
      booking_nummer: 46163,
    },
    source: 'mock_data'
  },
  
  // 2. UDREJST campist - RIGTIG KUNDE FRA DATABASE
  'campist': {
    guest: {
      firstName: 'Peter',
      lastName: 'Gosvig',
      email: 'peter@jellingcamping.dk',
      phone: '+4581826301',
      language: 'da',
      country: 'DK',
      arrivalDate: '2025-12-05',
      departureDate: '2025-12-25',
      spotNumber: null,
      checkedIn: true,
      checkedOut: true,  // NU TJEKKET UD
      bookingType: 'camping',
      previousVisits: 3,
      bookingId: 46158,  // RIGTIG booking fra database
      booking_nummer: 46158,
      // Måler fra database
      meterId: 'Kontor',
      meterNumber: 'Kontor',
      meterStartEnergy: 0,
      powerPackage: null,
      meters: []
    },
    source: 'mock_data'
  },
  
  // 2b. Campist MED måler men UDEN pakke
  'campist-maaler': {
    guest: {
      firstName: 'Bente',
      lastName: 'Campersen',
      email: 'bente@test.dk',
      phone: '+45 23456789',
      language: 'da',
      country: 'DK',
      arrivalDate: getPastDate(2),
      departureDate: getFutureDate(5),
      spotNumber: null,
      checkedIn: true,
      checkedOut: false,
      bookingType: 'camping',
      previousVisits: 3,
      bookingId: 99902,
      booking_nummer: 99902,
      // HAR måler
      meterId: 'ELM-042',
      meterNumber: '42',
      meterStartEnergy: 1234.5,
      // INGEN pakke købt endnu
      powerPackage: null,
      meters: [
        {
          id: 'ELM-042',
          name: 'Stander 42',
          isPowerOn: false,
          usedEnheder: 0,
          currentPower: 0,
          voltage: 230,
          current: 0,
        }
      ]
    },
    source: 'mock_data'
  },
  
  // 2c. Campist MED måler OG aktiv pakke (fuld adgang)
  'campist-aktiv': {
    guest: {
      firstName: 'Bente',
      lastName: 'Campersen',
      email: 'bente@test.dk',
      phone: '+45 23456789',
      language: 'da',
      country: 'DK',
      arrivalDate: getPastDate(2),
      departureDate: getFutureDate(5),
      spotNumber: null,
      checkedIn: true,
      checkedOut: false,
      bookingType: 'camping',
      previousVisits: 3,
      bookingId: 99903,
      booking_nummer: 99903,
      // HAR måler
      meterId: 'ELM-042',
      meterNumber: '42',
      meterStartEnergy: 1234.5,
      // HAR aktiv pakke
      powerPackage: {
        id: 'pkg-001',
        status: 'aktiv',
        name: '3 Dages Pakke',
        totalEnheder: 30,
        usedEnheder: 8.4,
        remainingEnheder: 21.6,
        expiresAt: getFutureDate(1) + 'T12:00:00'  // Udløber i morgen kl 12
      },
      meters: [
        {
          id: 'ELM-042',
          name: 'Stander 42',
          isPowerOn: true,
          usedEnheder: 8.4,
          currentPower: 450.0,
          voltage: 232,
          current: 1.94,
        }
      ]
    },
    source: 'mock_data'
  },
  
  // 3. Sæsongæst (fast plads hele sæsonen)
  'saeson': {
    guest: {
      firstName: 'Erik',
      lastName: 'Sæsonsen',
      email: 'erik@test.dk',
      phone: '+45 56789012',
      language: 'da',
      country: 'DK',
      arrivalDate: getPastDate(30),
      departureDate: getFutureDate(120),
      spotNumber: 'B15',  // Fast plads - vises fordi seasonal
      meterId: 'meter_saeson',
      checkedIn: true,
      checkedOut: false,
      bookingType: 'seasonal',
      previousVisits: 8,
      // Sæsongæst strømpakke
      powerPackage: {
        totalEnheder: 100,
        usedEnheder: 45.2,
        remainingEnheder: 54.8
      },
      meters: [
        {
          id: 'ELM-B15-01',
          name: 'Plads B15',
          isPowerOn: true,
          usedEnheder: 45.2,
          currentPower: 280.0,
          voltage: 234,
          current: 1.20,
        }
      ]
    },
    source: 'mock_data'
  },
  
  // 4. Hytte gæst (indtjekket i hytte)
  'hytte': {
    guest: {
      firstName: 'Dorthe',
      lastName: 'Hyttesen',
      email: 'dorthe@test.dk',
      phone: '+45 45678901',
      language: 'de',
      country: 'DE',
      arrivalDate: getPastDate(1),
      departureDate: getFutureDate(6),
      spotNumber: 'Hytte 3',  // Vises fordi cabin
      meterId: null,
      checkedIn: true,
      checkedOut: false,
      bookingType: 'cabin',
      previousVisits: 1,
    },
    source: 'mock_data'
  },
  
  // 4. Udtjekket gæst (har forladt pladsen)
  'rejst': {
    guest: {
      firstName: 'Carl',
      lastName: 'Rejstsen',
      email: 'carl@test.dk',
      phone: '+45 34567890',
      language: 'da',
      country: 'DK',
      arrivalDate: getPastDate(10),
      departureDate: getPastDate(3),
      spotNumber: 'C22',
      meterId: null,
      checkedIn: false,
      checkedOut: true,
      bookingType: 'camping',
      previousVisits: 5,
    },
    source: 'mock_data'
  },
};

// Hjælpefunktioner til datoer
function getFutureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function getPastDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export const mockValidateToken = async (token: string) => {
  // ============================================
  // 1. TJEK MOCK DATA FØRST (til development)
  // ============================================
  const lowerToken = token.toLowerCase();
  if (mockGuests[lowerToken]) {
    console.log('🧪 Bruger MOCK data for token:', token);
    console.log('   Gæst:', mockGuests[lowerToken].guest.firstName, mockGuests[lowerToken].guest.lastName);
    console.log('   Type:', mockGuests[lowerToken].guest.bookingType);
    console.log('   Status: checkedIn=', mockGuests[lowerToken].guest.checkedIn, ', checkedOut=', mockGuests[lowerToken].guest.checkedOut);
    return mockGuests[lowerToken];
  }

  // ============================================
  // 2. HVIS BOOKING ID (tal), PRØV EDGE FUNCTION
  // ============================================
  if (/^\d+$/.test(token)) {
    try {
      console.log('🔍 Henter live data for booking', token);
      
      // TEST projekt - ljeszhbaqszgiyyrkxep
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ljeszhbaqszgiyyrkxep.supabase.co';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/get-live-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ bookingId: parseInt(token) })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Live data hentet for booking', token);
        console.log('   Kilde:', data.source);
        console.log('   Gæst:', data.guest?.firstName, data.guest?.lastName);
        console.log('   Status: checkedIn=', data.guest?.checkedIn, ', checkedOut=', data.guest?.checkedOut);
        return data;
      } else {
        const errorData = await response.json();
        console.error('❌ Edge Function fejl:', response.status, errorData);
        // Fallback til mock campist hvis edge function fejler
        console.log('⚠️ Fallback til mock campist data');
        return mockGuests['campist'];
      }
    } catch (error) {
      console.error('❌ Fejl ved hentning af live data:', error);
      // Fallback til mock campist hvis der er netværksfejl
      console.log('⚠️ Fallback til mock campist data (netværksfejl)');
      return mockGuests['campist'];
    }
  }
  
  // ============================================
  // 3. UKENDT TOKEN - VIS HJÆLP
  // ============================================
  console.log('❓ Ukendt token:', token);
  console.log('   Gyldige test-tokens:');
  console.log('     - kommende (ikke ankommet)');
  console.log('     - campist (ingen måler)');
  console.log('     - campist-maaler (har måler, ingen pakke)');
  console.log('     - campist-aktiv (har måler + aktiv pakke)');
  console.log('     - saeson (sæsongæst med aktiv pakke)');
  console.log('     - hytte (strøm inkluderet)');
  console.log('     - rejst (udtjekket)');
  console.log('   Eller brug et booking ID (tal)');
  throw new Error('Ugyldigt token');
};
