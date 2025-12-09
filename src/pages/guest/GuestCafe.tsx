import { useState, useEffect } from 'react';
import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, UtensilsCrossed, Wine, Phone, Mail, ShoppingBag, PartyPopper, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4';
const HEADER_IMAGE = 'https://images.unsplash.com/photo-1554118811-1e0d58224f54?w=1200&q=80';

interface OpeningHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

interface MenuItem {
  id: number;
  category: 'food' | 'drinks';
  name_da: string;
  name_en: string;
  name_de: string;
  description_da: string;
  price: number;
  image_url: string;
  active: boolean;
}

interface Offer {
  id: number;
  ref_id: string;
  name_da: string;
  name_en: string;
  name_de: string;
  description_da: string;
  description_en: string;
  description_de: string;
  price: number;
  image_url: string;
  visible_from: string;
  visible_to: string;
  active: boolean;
}

interface PartyBox {
  id: number;
  title_da: string;
  title_en: string;
  title_de: string;
  text_da: string;
  text_en: string;
  text_de: string;
  image_url: string;
  active: boolean;
}

interface CafeSettings {
  opening_hours: OpeningHours;
  header_image: string;
  reopening_date: string;
  contact_phone: string;
  contact_email: string;
  contact_text_da: string;
  contact_text_en: string;
  contact_text_de: string;
  party_boxes: PartyBox[];
}

// Rækkefølge for dage (starter med mandag)
const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface CafeOrder {
  id: number;
  ref_id: string;
  order_number: string;
  offer_id: string;
  offer_name: string;
  quantity: number;
  dining_option: string;
  execution_date: string;
  total: number;
  status: string;
  created_at: string;
}

const dayNames: { [key: string]: { da: string; en: string; de: string } } = {
  mon: { da: 'Mandag', en: 'Monday', de: 'Montag' },
  tue: { da: 'Tirsdag', en: 'Tuesday', de: 'Dienstag' },
  wed: { da: 'Onsdag', en: 'Wednesday', de: 'Mittwoch' },
  thu: { da: 'Torsdag', en: 'Thursday', de: 'Donnerstag' },
  fri: { da: 'Fredag', en: 'Friday', de: 'Freitag' },
  sat: { da: 'Lørdag', en: 'Saturday', de: 'Samstag' },
  sun: { da: 'Søndag', en: 'Sunday', de: 'Sonntag' },
};

const GuestCafe = () => {
  const { guest, language } = useGuest();
  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [myOrders, setMyOrders] = useState<CafeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [diningOption, setDiningOption] = useState<'eat_in' | 'takeaway'>('eat_in');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${ANON_KEY}` };
      
      const [settingsRes, menuRes, offersRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}?action=cafe-get-settings`, { headers }),
        fetch(`${API_URL}?action=cafe-get-menu`, { headers }),
        fetch(`${API_URL}?action=cafe-get-offers&active=true`, { headers }),
        fetch(`${API_URL}?action=cafe-get-orders&booking_id=${guest.bookingId}`, { headers }),
      ]);

      const [settingsData, menuData, offersData, ordersData] = await Promise.all([
        settingsRes.json(),
        menuRes.json(),
        offersRes.json(),
        ordersRes.json(),
      ]);

      if (settingsData.success) setSettings(settingsData.settings);
      if (menuData.success) setMenuItems(menuData.items.filter((i: MenuItem) => i.active));
      if (offersData.success) setOffers(offersData.offers);
      if (ordersData.success) {
        const now = new Date();
        // Filtrer: Kun aktive ordrer der ikke er udløbet
        const activeOrders = ordersData.orders.filter((o: CafeOrder) => {
          // Fjern afbestilte
          if (o.status === 'cancelled') return false;
          // Fjern udløbne (execution_date er passeret)
          if (o.execution_date) {
            const execDate = new Date(o.execution_date);
            if (execDate < now) return false;
          }
          return true;
        });
        setMyOrders(activeOrders);
      }
    } catch (error) {
      console.error('Error fetching café data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getText = (da: string, en: string, de: string) => {
    if (language === 'de') return de;
    if (language === 'en') return en;
    return da;
  };

  const getTodayStatus = () => {
    if (!settings?.opening_hours) return null;
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = days[new Date().getDay()];
    const hours = settings.opening_hours[today];
    
    // Hvis lukket i dag eller ingen åbningstider sat
    if (!hours || hours.closed) {
      // Find next open day
      for (let i = 1; i <= 7; i++) {
        const nextDay = days[(new Date().getDay() + i) % 7];
        const nextHours = settings.opening_hours[nextDay];
        if (nextHours && !nextHours.closed) {
          return {
            closed: true,
            nextOpen: `${dayNames[nextDay]?.[language as 'da' | 'en' | 'de'] || dayNames[nextDay]?.da} kl. ${nextHours.open}`
          };
        }
      }
      // Alle dage lukket (vintersæson) - vis genåbningsdato hvis sat
      if (settings.reopening_date) {
        const reopenDate = new Date(settings.reopening_date);
        const formattedDate = reopenDate.toLocaleDateString(
          language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'da-DK',
          { day: 'numeric', month: 'long', year: 'numeric' }
        );
        return {
          closed: true,
          nextOpen: formattedDate
        };
      }
      return {
        closed: true,
        nextOpen: getText('Se åbningstider nedenfor', 'See opening hours below', 'Siehe Öffnungszeiten unten')
      };
    }
    
    return { closed: false, open: hours.open, close: hours.close };
  };

  const handleOrder = async () => {
    if (!selectedOffer) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}?action=cafe-create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}` },
        body: JSON.stringify({
          booking_nummer: guest.bookingId,
          guest_name: `${guest.firstName} ${guest.lastName}`,
          guest_phone: guest.phone || '',
          offer_id: selectedOffer.ref_id,
          offer_name: getText(selectedOffer.name_da, selectedOffer.name_en, selectedOffer.name_de),
          quantity,
          dining_option: diningOption,
          execution_date: selectedOffer.visible_to,
          price: selectedOffer.price,
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(getText('Bestilling oprettet!', 'Order placed!', 'Bestellung aufgegeben!'));
        setOrderDialogOpen(false);
        setSelectedOffer(null);
        setQuantity(1);
        fetchData();
      } else {
        toast.error(data.error || 'Fejl');
      }
    } catch {
      toast.error('Fejl ved bestilling');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (order: CafeOrder) => {
    if (!confirm(getText('Vil du annullere denne bestilling?', 'Cancel this order?', 'Diese Bestellung stornieren?'))) return;
    try {
      console.log('Cancelling order:', order.ref_id, 'booking:', guest.bookingId);
      const res = await fetch(`${API_URL}?action=cafe-cancel-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}` },
        body: JSON.stringify({ order_id: order.ref_id, booking_nummer: guest.bookingId })
      });
      const data = await res.json();
      console.log('Cancel response:', data);
      if (data.success) {
        toast.success(getText('Bestilling annulleret', 'Order cancelled', 'Bestellung storniert'));
        // Fjern ordren fra listen med det samme
        setMyOrders(prev => prev.filter(o => o.ref_id !== order.ref_id));
      } else {
        toast.error(data.error || 'Kunne ikke afbestille');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error('Fejl ved afbestilling');
    }
  };

  const canCancelOrder = (order: CafeOrder) => {
    // Find tilbuddet via offer_id - brug visible_to som deadline
    const offer = offers.find(o => o.ref_id === order.offer_id);
    if (!offer?.visible_to) return true;
    return new Date() < new Date(offer.visible_to);
  };

  const todayStatus = getTodayStatus();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={getText('Café', 'Café', 'Café')}
        subtitle={getText('Mad, drikke og hygge', 'Food, drinks and comfort', 'Essen, Trinken und Gemütlichkeit')}
        image={settings?.header_image || HEADER_IMAGE}
      />
      
      {/* Status bar */}
      {todayStatus && (
        <div className={`py-3 px-6 text-white ${todayStatus.closed ? 'bg-red-600' : 'bg-teal-700'}`}>
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            {todayStatus.closed ? (
              <span>{getText('Lukket', 'Closed', 'Geschlossen')} - {getText('Åbner', 'Opens', 'Öffnet')} {todayStatus.nextOpen}</span>
            ) : (
              <span>{getText('Åbent i dag', 'Open today', 'Heute geöffnet')}: {todayStatus.open} - {todayStatus.close}</span>
            )}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        
        {/* Mine bestillinger */}
        {myOrders.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-600" />
                {getText('Mine bestillinger', 'My orders', 'Meine Bestellungen')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium">{order.quantity}× {order.offer_name}</p>
                    <p className="text-sm text-gray-500">
                      {order.execution_date} • {order.dining_option === 'eat_in' ? '🍽️' : '📦'} • {order.total} kr
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      ✓ {getText('Bekræftet', 'Confirmed', 'Bestätigt')}
                    </p>
                  </div>
                  {canCancelOrder(order) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleCancelOrder(order)}
                    >
                      {getText('Afbestil', 'Cancel', 'Stornieren')}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Aktive tilbud */}
        {offers.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              {getText('Aktive tilbud', 'Special offers', 'Sonderangebote')}
            </h2>
            <div className="space-y-3">
              {offers.map(offer => (
                <Card key={offer.id} className="border-rose-200 overflow-hidden">
                  <div className="flex">
                    {offer.image_url && (
                      <img src={offer.image_url} alt="" className="w-24 h-24 object-cover" />
                    )}
                    <CardContent className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{getText(offer.name_da, offer.name_en, offer.name_de)}</h3>
                          <p className="text-sm text-gray-600">{getText(offer.description_da, offer.description_en, offer.description_de)}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {getText('Deadline', 'Deadline', 'Frist')}: {offer.visible_to ? new Date(offer.visible_to).toLocaleString('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-rose-600">{offer.price} kr</p>
                          {guest.checkedIn ? (
                            <Dialog open={orderDialogOpen && selectedOffer?.id === offer.id} onOpenChange={(open) => {
                              setOrderDialogOpen(open);
                              if (open) setSelectedOffer(offer);
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="mt-2">
                                  {getText('Bestil', 'Order', 'Bestellen')}
                                </Button>
                              </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{getText('Bestil tilbud', 'Order offer', 'Angebot bestellen')}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <p className="font-medium">{getText(offer.name_da, offer.name_en, offer.name_de)}</p>
                                <p className="text-sm text-gray-500">{offer.price} kr {getText('pr. stk', 'each', 'pro Stück')}</p>
                                
                                <div>
                                  <Label>{getText('Antal', 'Quantity', 'Anzahl')}</Label>
                                  <Input type="number" min={1} value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
                                </div>

                                <div>
                                  <Label>{getText('Hvordan vil du have det?', 'How would you like it?', 'Wie möchten Sie es?')}</Label>
                                  <RadioGroup value={diningOption} onValueChange={(v) => setDiningOption(v as 'eat_in' | 'takeaway')} className="mt-2">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="eat_in" id="eat_in" />
                                      <Label htmlFor="eat_in">🍽️ {getText('Spise i café', 'Eat in café', 'Im Café essen')}</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="takeaway" id="takeaway" />
                                      <Label htmlFor="takeaway">📦 {getText('Tag med hjem', 'Takeaway', 'Zum Mitnehmen')}</Label>
                                    </div>
                                  </RadioGroup>
                                </div>

                                <div className="p-3 bg-gray-100 rounded-lg">
                                  <p className="font-bold text-lg">Total: {offer.price * quantity} kr</p>
                                </div>

                                <Button onClick={handleOrder} disabled={submitting} className="w-full">
                                  {submitting ? 'Bestiller...' : getText('Bekræft bestilling', 'Confirm order', 'Bestellung bestätigen')}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          ) : (
                            <div className="mt-2">
                              <Button size="sm" disabled className="opacity-50 cursor-not-allowed">
                                <Lock className="h-3 w-3 mr-1" />
                                {getText('Bestil', 'Order', 'Bestellen')}
                              </Button>
                              <p className="text-xs text-amber-600 mt-1">
                                {getText('Tilgængelig efter check-in', 'Available after check-in', 'Nach Check-in verfügbar')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Åbningstider */}
        {settings?.opening_hours && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" />
                {getText('Åbningstider', 'Opening hours', 'Öffnungszeiten')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {dayOrder.map(day => {
                const hours = settings.opening_hours[day];
                if (!hours) return null;
                return (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="text-gray-500">{dayNames[day]?.[language as 'da' | 'en' | 'de'] || dayNames[day]?.da}</span>
                    <span className={hours.closed ? 'text-red-500' : 'font-medium'}>
                      {hours.closed ? getText('Lukket', 'Closed', 'Geschlossen') : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Menukort */}
        {menuItems.length > 0 && (
          <>
            {/* Mad */}
            {menuItems.filter(m => m.category === 'food').length > 0 && (
              <section className="space-y-3">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-teal-600" />
                  {getText('Mad', 'Food', 'Essen')}
                </h2>
                <Card>
                  <CardContent className="p-0 divide-y">
                    {menuItems.filter(m => m.category === 'food').map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          {item.image_url && <img src={item.image_url} alt="" className="w-12 h-12 rounded object-cover" />}
                          <span className="font-medium">{getText(item.name_da, item.name_en, item.name_de)}</span>
                        </div>
                        <span className="font-semibold text-teal-600">{item.price} kr</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Drikkevarer */}
            {menuItems.filter(m => m.category === 'drinks').length > 0 && (
              <section className="space-y-3">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Wine className="h-5 w-5 text-purple-600" />
                  {getText('Drikkevarer', 'Drinks', 'Getränke')}
                </h2>
                <Card>
                  <CardContent className="p-0 divide-y">
                    {menuItems.filter(m => m.category === 'drinks').map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          {item.image_url && <img src={item.image_url} alt="" className="w-12 h-12 rounded object-cover" />}
                          <span className="font-medium">{getText(item.name_da, item.name_en, item.name_de)}</span>
                        </div>
                        <span className="font-semibold text-purple-600">{item.price} kr</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}
          </>
        )}

        {/* Festmenuer */}
        {settings?.party_boxes?.filter(b => b.active).length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-amber-500" />
              {getText('Festmenuer', 'Party menus', 'Partymenüs')}
            </h2>
            <div className="grid gap-4">
              {settings.party_boxes.filter(b => b.active).map(box => (
                <Card key={box.id} className="overflow-hidden">
                  {box.image_url && (
                    <img src={box.image_url} alt="" className="w-full h-32 object-cover" />
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{getText(box.title_da, box.title_en, box.title_de)}</h3>
                    <p className="text-sm text-gray-600 mt-1">{getText(box.text_da, box.text_en, box.text_de)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Kontakt */}
        {settings && (
          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{getText('Kontakt', 'Contact', 'Kontakt')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-2 text-teal-700">
                  <Phone className="h-4 w-4" /> {settings.contact_phone}
                </a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 text-teal-700">
                  <Mail className="h-4 w-4" /> {settings.contact_email}
                </a>
              )}
              <p className="text-sm text-gray-600 mt-2">
                {getText(settings.contact_text_da, settings.contact_text_en, settings.contact_text_de)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuestCafe;
