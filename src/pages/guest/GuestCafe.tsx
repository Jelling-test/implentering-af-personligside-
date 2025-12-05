import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Coffee, UtensilsCrossed, Percent } from 'lucide-react';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1554118811-1e0d58224f54?w=1200&q=80';

const GuestCafe = () => {
  const { t, language } = useGuest();

  const openingHours = [
    { day: 'Mandag - Fredag', hours: '08:00 - 21:00' },
    { day: 'Lørdag - Søndag', hours: '08:00 - 22:00' },
  ];

  const menuItems = [
    { name: 'Dagens suppe m. brød', price: 65, emoji: '🍲' },
    { name: 'Club sandwich', price: 85, emoji: '🥪' },
    { name: 'Burger med pommes', price: 95, emoji: '🍔' },
    { name: 'Salat m. kylling', price: 89, emoji: '🥗' },
    { name: 'Kaffe & kage', price: 55, emoji: '☕' },
    { name: 'Softice', price: 25, emoji: '🍦' },
  ];

  const offers = [
    { title: 'Happy Hour', description: '2 øl for 50 kr (16:00-18:00)', discount: '25%' },
    { title: 'Familie menu', description: '2 voksen + 2 børn: 299 kr', discount: 'Spar 80 kr' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={t('cafeOffers')}
        subtitle={language === 'da' ? 'Mad, drikke og hygge' : 'Food, drinks and comfort'}
        image={HEADER_IMAGE}
      />
      
      {/* Teal info bar */}
      <div className="bg-teal-700 text-white py-3 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          <span>{language === 'da' ? 'Åbent i dag' : 'Open today'}: 08:00 - 21:00</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Opening Hours */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <Clock className="h-5 w-5 text-teal-600" />
              {t('openingHours')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openingHours.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{item.day}</span>
                <span className="font-semibold text-gray-800">{item.hours}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Special Offers */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
            <Percent className="h-5 w-5 text-rose-500" />
            {language === 'da' ? 'Tilbud' : 'Offers'}
          </h2>
          <div className="grid gap-3">
            {offers.map((offer, i) => (
              <Card key={i} className="bg-rose-50 border-rose-200">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{offer.title}</p>
                    <p className="text-sm text-gray-600">{offer.description}</p>
                  </div>
                  <Badge className="bg-rose-500 text-white border-0">{offer.discount}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Menu */}
        <section className="space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
            <UtensilsCrossed className="h-5 w-5 text-teal-600" />
            {t('menuOfTheDay')}
          </h2>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0 divide-y">
              {menuItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-medium text-gray-800">{item.name}</span>
                  </div>
                  <span className="font-semibold text-teal-600">{item.price} kr</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default GuestCafe;
