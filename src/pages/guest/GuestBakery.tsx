import { useState } from 'react';
import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Croissant, 
  Clock, 
  Minus, 
  Plus, 
  ShoppingBasket, 
  Lock,
  CheckCircle2,
  CalendarDays,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  maxPerOrder: number;
  emoji: string;
}

interface Order {
  id: string;
  items: { product: Product; quantity: number }[];
  total: number;
  pickupTime: string;
  date: string;
  status: 'pending' | 'ready' | 'collected';
}

const products: Product[] = [
  { id: 1, name: "Rundstykker", price: 5, description: "Friske morgenbrød", maxPerOrder: 20, emoji: "🥖" },
  { id: 2, name: "Croissant", price: 12, description: "Smørcroissant", maxPerOrder: 10, emoji: "🥐" },
  { id: 3, name: "Chokoladebolle", price: 15, description: "Chokolade wienerbrød", maxPerOrder: 10, emoji: "🍫" },
  { id: 4, name: "Rugbrød", price: 35, description: "Fuldkorns rugbrød", maxPerOrder: 2, emoji: "🍞" },
];

const pickupTimes = [
  { value: "07:00-08:00", label: "07:00 - 08:00" },
  { value: "08:00-09:00", label: "08:00 - 09:00" },
  { value: "09:00-10:00", label: "09:00 - 10:00" },
];

const GuestBakery = () => {
  const { guest, t, language } = useGuest();
  const [cart, setCart] = useState<Record<number, number>>({});
  const [pickupTime, setPickupTime] = useState<string>("07:00-08:00");
  const [orders, setOrders] = useState<Order[]>([]);
  const [showConfirmation, setShowConfirmation] = useState<Order | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toLocaleDateString('da-DK', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const currentHour = new Date().getHours();
  const isOrderingClosed = currentHour >= 18;

  const updateCart = (productId: number, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, Math.min(product.maxPerOrder, currentQty + delta));
      
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = products.reduce((sum, product) => {
    return sum + (cart[product.id] || 0) * product.price;
  }, 0);

  const handlePlaceOrder = () => {
    if (totalItems === 0) return;
    
    const orderItems = products
      .filter(p => cart[p.id] > 0)
      .map(p => ({ product: p, quantity: cart[p.id] }));

    const newOrder: Order = {
      id: `#${Math.floor(1000 + Math.random() * 9000)}`,
      items: orderItems,
      total: totalPrice,
      pickupTime,
      date: tomorrow.toISOString().split('T')[0],
      status: 'pending'
    };

    setOrders(prev => [newOrder, ...prev]);
    setShowConfirmation(newOrder);
    setCart({});
    toast.success('Bestilling modtaget!');
  };

  // Not checked in
  if (!guest.checkedIn) {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader 
          title={t('orderBread')}
          subtitle={language === 'da' ? 'Friske morgenbrød hver dag' : 'Fresh bread every morning'}
          image={HEADER_IMAGE}
        />
        <div className="max-w-2xl mx-auto p-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Lock className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-gray-800 font-medium mb-2">
                {language === 'da' ? 'Bageri ikke tilgængeligt' : 'Bakery not available'}
              </p>
              <p className="text-sm text-gray-600">
                {language === 'da' ? 'Bestilling er tilgængelig efter check-in' : 'Available after check-in'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show confirmation
  if (showConfirmation) {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader 
          title={language === 'da' ? 'Bestilling modtaget!' : 'Order received!'}
          subtitle={`${language === 'da' ? 'Ordrenummer' : 'Order'}: ${showConfirmation.id}`}
          image={HEADER_IMAGE}
        />
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-teal-600" />
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-500">{language === 'da' ? 'Afhentning' : 'Pickup'}</span>
                <span className="font-semibold">{showConfirmation.pickupTime}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-500">{language === 'da' ? 'Dato' : 'Date'}</span>
                <span className="font-semibold capitalize">{tomorrowFormatted}</span>
              </div>
              {showConfirmation.items.map(item => (
                <div key={item.product.id} className="flex justify-between items-center">
                  <span>{item.product.emoji} {item.quantity}x {item.product.name}</span>
                  <span className="font-medium">{item.quantity * item.product.price} kr</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
                <span>Total</span>
                <span className="text-teal-600">{showConfirmation.total} kr</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-sm text-amber-700">
              {language === 'da' ? 'Betaling sker ved afhentning i receptionen' : 'Pay at pickup in reception'}
            </p>
          </div>

          <Button 
            className="w-full bg-teal-600 hover:bg-teal-700 h-12" 
            onClick={() => setShowConfirmation(null)}
          >
            {language === 'da' ? 'Bestil mere' : 'Order more'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={t('orderBread')}
        subtitle={language === 'da' ? 'Friske morgenbrød hver dag' : 'Fresh bread every morning'}
        image={HEADER_IMAGE}
      />
      
      {/* Teal info bar */}
      <div className="bg-teal-700 text-white py-3 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            <span className="capitalize">{language === 'da' ? 'Til' : 'For'} {tomorrowFormatted}</span>
          </div>
          <span className="text-sm text-white/80">
            {language === 'da' ? 'Bestil inden kl. 18' : 'Order before 6 PM'}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Order Deadline Warning */}
        {isOrderingClosed ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700">{language === 'da' ? 'Bestilling lukket' : 'Orders closed'}</p>
              <p className="text-sm text-red-600">{language === 'da' ? 'Åbner igen i morgen' : 'Opens again tomorrow'}</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              {language === 'da' ? 'Bestil inden kl. 18:00 for levering i morgen' : 'Order before 6 PM for tomorrow delivery'}
            </p>
          </div>
        )}

      {/* Products */}
      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="border-0 shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{product.emoji}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.description}</p>
                    <p className="text-teal-600 font-bold mt-1">{product.price} kr</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => updateCart(product.id, -1)}
                    disabled={!cart[product.id] || isOrderingClosed}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold text-lg">
                    {cart[product.id] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => updateCart(product.id, 1)}
                    disabled={(cart[product.id] || 0) >= product.maxPerOrder || isOrderingClosed}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {(cart[product.id] || 0) >= product.maxPerOrder && (
                <p className="text-xs text-gray-400 mt-2">
                  Max {product.maxPerOrder} {language === 'da' ? 'pr. bestilling' : 'per order'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pickup Time */}
      {totalItems > 0 && (
        <Card className="border-0 shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <Clock className="h-5 w-5 text-teal-600" />
              {language === 'da' ? 'Vælg afhentningstid' : 'Select pickup time'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={pickupTime} onValueChange={setPickupTime}>
              {pickupTimes.map((time) => (
                <div key={time.value} className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value={time.value} id={time.value} />
                  <Label htmlFor={time.value} className="font-normal cursor-pointer">
                    {time.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      {totalItems > 0 && (
        <Card className="bg-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBasket className="h-5 w-5" />
                <span>{totalItems} {totalItems === 1 ? (language === 'da' ? 'vare' : 'item') : (language === 'da' ? 'varer' : 'items')}</span>
              </div>
              <span className="text-2xl font-bold">{totalPrice} kr</span>
            </div>
            <Button 
              className="w-full bg-white text-teal-600 hover:bg-gray-100 h-12 font-semibold"
              onClick={handlePlaceOrder}
              disabled={isOrderingClosed}
            >
              {language === 'da' ? 'Bestil - Betal ved afhentning' : 'Order - Pay at pickup'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Previous Orders */}
      {orders.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h2 className="font-semibold flex items-center gap-2 text-gray-800">
            <Receipt className="h-5 w-5 text-teal-600" />
            {language === 'da' ? 'Mine bestillinger' : 'My orders'}
          </h2>
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono font-bold">{order.id}</span>
                    <Badge variant="secondary" className="ml-2">{language === 'da' ? 'Afventer' : 'Pending'}</Badge>
                  </div>
                  <span className="font-semibold text-teal-600">{order.total} kr</span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>{language === 'da' ? 'Afhentning' : 'Pickup'}: {order.pickupTime}</p>
                  <p className="capitalize">{new Date(order.date).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="mt-2 text-sm">
                  {order.items.map(item => (
                    <span key={item.product.id} className="mr-2">
                      {item.product.emoji} {item.quantity}x
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default GuestBakery;
