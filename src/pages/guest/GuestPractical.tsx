import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wifi, 
  Phone, 
  Clock, 
  Car, 
  Droplets, 
  Trash2, 
  Dog,
  MapPin,
  TreePine,
  Train,
  ShoppingBag,
  Landmark,
  Fish,
  Footprints,
  Bike,
  Baby,
  Pill,
  Hospital
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=1200&q=80';

const GuestPractical = () => {
  const { t, language } = useGuest();

  const facilities = [
    { icon: Droplets, name: 'Baderum', info: 'Åbent 24 timer' },
    { icon: Trash2, name: 'Affald', info: 'Sortering - se skilt' },
    { icon: Car, name: 'Parkering', info: 'Ved din plads' },
    { icon: Dog, name: 'Hunde', info: 'Tilladt i snor' },
    { icon: Baby, name: 'Legeplads', info: 'Ved receptionen' },
  ];

  const emergencyContacts = [
    { name: 'Nødnummer', phone: '112', urgent: true },
    { name: 'Lægevagt', phone: '1813', urgent: true },
    { name: 'Reception', phone: '+45 75 87 16 53', urgent: false },
  ];

  const nearbyServices = [
    { icon: Pill, name: 'Jelling Apotek', distance: '1.5 km', hours: '09:00-17:30' },
    { icon: ShoppingBag, name: 'Fakta', distance: '0.8 km', hours: '08:00-21:00' },
    { icon: Hospital, name: 'Vejle Sygehus', distance: '15 km', hours: '24 timer' },
  ];

  const attractions = [
    { icon: Landmark, name: 'Jellingstenene (UNESCO)', distance: '0.5 km', highlight: true },
    { icon: TreePine, name: 'Vandreruter', distance: 'Fra pladsen' },
    { icon: Bike, name: 'Cykelruter', distance: 'Fra pladsen' },
    { icon: Fish, name: 'Fiskeri', distance: 'Fiskekort i reception' },
  ];

  const transport = [
    { name: 'Jelling Station', distance: '1 km' },
    { name: 'Vejle (centrum)', distance: '12 km' },
    { name: 'Billund Lufthavn', distance: '25 km' },
    { name: 'LEGOLAND', distance: '25 km' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={t('practicalInfo')}
        subtitle={language === 'da' ? 'Alt du har brug for at vide' : 'Everything you need to know'}
        image={HEADER_IMAGE}
      />
      
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* WiFi - ÅBENT NETVÆRK */}
        <Card className="bg-teal-50 border-teal-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wifi className="h-5 w-5 text-primary" />
            {t('wifiInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-2">
            <p className="text-lg font-medium text-primary">
              {language === 'da' ? 'Åbent netværk - ingen kode' : 
               language === 'de' ? 'Offenes Netzwerk - kein Passwort' : 
               language === 'nl' ? 'Open netwerk - geen wachtwoord' : 
               'Open network - no password'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'da' ? 'Forbind automatisk til "JellingCamping"' :
               language === 'de' ? 'Automatisch mit "JellingCamping" verbinden' :
               language === 'nl' ? 'Automatisch verbinden met "JellingCamping"' :
               'Connect automatically to "JellingCamping"'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Phone className="h-5 w-5 text-rose-500" />
          {t('emergencyContacts')}
        </h2>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {emergencyContacts.map((contact, i) => (
              <a 
                key={i}
                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${contact.urgent ? 'bg-rose-500/5' : ''}`}
              >
                <span className={`font-medium ${contact.urgent ? 'text-rose-600' : ''}`}>{contact.name}</span>
                <span className={`font-mono ${contact.urgent ? 'text-rose-600 font-bold' : 'text-primary'}`}>{contact.phone}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Nearby Services */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">
          {language === 'da' ? 'I nærheden' : language === 'de' ? 'In der Nähe' : language === 'nl' ? 'In de buurt' : 'Nearby'}
        </h2>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {nearbyServices.map((service, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <service.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.hours}</p>
                </div>
                <span className="text-sm text-muted-foreground">{service.distance}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Nature & Attractions */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <TreePine className="h-5 w-5 text-green-600" />
          {language === 'da' ? 'Natur & Oplevelser' : language === 'de' ? 'Natur & Erlebnisse' : language === 'nl' ? 'Natuur & Bezienswaardigheden' : 'Nature & Attractions'}
        </h2>
        <div className="grid gap-3">
          {attractions.map((attr, i) => (
            <Card key={i} className={attr.highlight ? 'border-amber-500/50 bg-amber-500/5' : ''}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${attr.highlight ? 'bg-amber-500/20' : 'bg-primary/10'}`}>
                  <attr.icon className={`h-5 w-5 ${attr.highlight ? 'text-amber-600' : 'text-primary'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{attr.name}</p>
                </div>
                <span className="text-sm text-muted-foreground">{attr.distance}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Transport */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Train className="h-5 w-5 text-blue-500" />
          {language === 'da' ? 'Transport & Afstande' : language === 'de' ? 'Transport & Entfernungen' : language === 'nl' ? 'Vervoer & Afstanden' : 'Transport & Distances'}
        </h2>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {transport.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <span className="font-medium text-sm">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.distance}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.open('https://rejseplanen.dk', '_blank')}
        >
          <Train className="h-4 w-4 mr-2" />
          Rejseplanen.dk
        </Button>
      </section>

      {/* Check-out */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            {t('checkoutInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {language === 'da' ? 'Check-out senest' : language === 'de' ? 'Check-out spätestens' : language === 'nl' ? 'Check-out uiterlijk' : 'Check-out by'}
            </span>
            <span className="font-medium">11:00</span>
          </div>
        </CardContent>
      </Card>

      {/* Facilities */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">{t('facilities')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {facilities.map((facility, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <facility.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{facility.name}</p>
                  <p className="text-xs text-muted-foreground">{facility.info}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

        {/* Address */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-teal-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">Jelling Camping</p>
              <p className="text-sm text-gray-500">Mølvangvej 10</p>
              <p className="text-sm text-gray-500">7300 Jelling, Denmark</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestPractical;
