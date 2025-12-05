import { useState } from 'react';
import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  AlertCircle, 
  Power, 
  CheckCircle2, 
  Lock,
  ShoppingCart,
  Home
} from 'lucide-react';
import { toast } from 'sonner';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80';

interface Meter {
  id: string;
  name: string;
  available: boolean;
}

interface PowerPackage {
  kwh: number;
  price: number;
}

const availableMeters: Meter[] = [
  { id: "M001", name: "Spot 42", available: true },
  { id: "M002", name: "Spot 43", available: true },
  { id: "M003", name: "Spot 44", available: false },
];

const powerPackages: PowerPackage[] = [
  { kwh: 10, price: 50 },
  { kwh: 25, price: 100 },
  { kwh: 50, price: 175 },
];

const GuestPower = () => {
  const { guest, t, language } = useGuest();
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(guest.meterId);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [showPackages, setShowPackages] = useState(false);

  // Mock usage data
  const mockUsage = {
    used: 2.4,
    packageTotal: 10,
    remaining: 7.6,
  };

  const selectedMeter = availableMeters.find(m => m.id === selectedMeterId);
  const usagePercent = (mockUsage.used / mockUsage.packageTotal) * 100;

  // Not checked in
  if (!guest.checkedIn) {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader 
          title={t('powerManagement')}
          subtitle={language === 'da' ? 'Styr din strøm' : 'Manage your electricity'}
          image={HEADER_IMAGE}
        />
        <div className="max-w-2xl mx-auto p-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Lock className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-gray-800 font-medium mb-2">
                {language === 'da' ? 'Strømstyring ikke tilgængelig' : 'Power management not available'}
              </p>
              <p className="text-sm text-gray-600">
                {language === 'da' ? 'Strømstyring er tilgængelig efter check-in' : 'Available after check-in'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Cabin guest - power included
  if (guest.bookingType === 'cabin') {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader 
          title={t('powerManagement')}
          subtitle={language === 'da' ? 'Strøm inkluderet i hytten' : 'Power included in cabin'}
          image={HEADER_IMAGE}
        />
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Info banner */}
          <div className="bg-teal-700 text-white p-4 rounded-lg flex items-center gap-3">
            <Home className="h-6 w-6" />
            <div>
              <p className="font-semibold">Cabin 7</p>
              <p className="text-sm text-white/80">
                {language === 'da' ? 'Strøm er inkluderet i din hytte' : 'Power is included in your cabin'}
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <p className="text-6xl font-light text-gray-800 mb-2">{mockUsage.used}</p>
              <p className="text-gray-500">kWh {language === 'da' ? 'brugt under ophold' : 'used during stay'}</p>
              <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm text-teal-700">
                  {language === 'da' ? 'Strøm inkluderet i hytten' : 'Power included in cabin'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Camping/Seasonal guest - no meter selected
  if (!selectedMeterId) {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader 
          title={t('powerManagement')}
          subtitle={language === 'da' ? 'Vælg din elmåler' : 'Select your meter'}
          image={HEADER_IMAGE}
        />
        <div className="max-w-2xl mx-auto p-6 space-y-4">
          <p className="text-gray-600 mb-4">
            {language === 'da' ? 'Vælg den elmåler der passer til din plads' : 'Select the meter for your pitch'}
          </p>
          
          {availableMeters.filter(m => m.available).map((meter) => (
            <Card 
              key={meter.id}
              className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow"
              onClick={() => {
                setSelectedMeterId(meter.id);
                toast.success(`Elmåler ${meter.name} valgt`);
              }}
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{meter.name}</p>
                    <p className="text-sm text-gray-500">Måler ID: {meter.id}</p>
                  </div>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  {language === 'da' ? 'Vælg' : 'Select'}
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {availableMeters.filter(m => !m.available).length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-400 mb-2">
                {language === 'da' ? 'Ikke tilgængelige:' : 'Not available:'}
              </p>
              {availableMeters.filter(m => !m.available).map((meter) => (
                <div key={meter.id} className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Zap className="h-4 w-4" />
                  <span>{meter.name}</span>
                  <Badge variant="secondary" className="text-xs">{language === 'da' ? 'Optaget' : 'Occupied'}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Camping/Seasonal guest - meter selected (main view)
  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={t('powerManagement')}
        subtitle={selectedMeter?.name || 'Elmåler'}
        image={HEADER_IMAGE}
      />
      
      {/* Teal info bar */}
      <div className="bg-teal-700 text-white py-3 px-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span>{selectedMeter?.name}</span>
            <span className="text-white/60 text-sm">ID: {selectedMeterId}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:text-white hover:bg-white/20"
            onClick={() => setSelectedMeterId(null)}
          >
            {language === 'da' ? 'Skift måler' : 'Change meter'}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Power Toggle Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className={`p-6 ${isPowerOn ? 'bg-gradient-to-r from-teal-500 to-teal-600' : 'bg-gray-400'} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Power className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{language === 'da' ? 'Strøm' : 'Power'}</p>
                  <p className="text-white/80">
                    {isPowerOn 
                      ? (language === 'da' ? 'Tændt' : 'On') 
                      : (language === 'da' ? 'Slukket' : 'Off')}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPowerOn}
                onCheckedChange={(checked) => {
                  setIsPowerOn(checked);
                  toast.success(checked ? 'Strøm tændt' : 'Strøm slukket');
                }}
                className="scale-150"
              />
            </div>
          </div>
        </Card>

        {/* Usage Stats */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {language === 'da' ? 'Forbrug' : 'Usage'}
            </h3>
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-5xl font-light text-teal-600">{mockUsage.used}</span>
                <span className="text-gray-500 ml-2">kWh {language === 'da' ? 'brugt' : 'used'}</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-light text-gray-800">{mockUsage.remaining}</span>
                <span className="text-gray-500 ml-2">kWh {language === 'da' ? 'tilbage' : 'left'}</span>
              </div>
            </div>
            <Progress value={usagePercent} className="h-3 bg-gray-100" />
            <p className="text-sm text-gray-500 text-center mt-2">
              {mockUsage.used} / {mockUsage.packageTotal} kWh {language === 'da' ? 'pakke' : 'package'}
            </p>
          </CardContent>
        </Card>

        {/* Buy More Power */}
        {!showPackages ? (
          <Button 
            className="w-full bg-teal-600 hover:bg-teal-700 h-14 text-lg" 
            onClick={() => setShowPackages(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {language === 'da' ? 'Køb mere strøm' : 'Buy more power'}
          </Button>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between">
                <span>{language === 'da' ? 'Strømpakker' : 'Power packages'}</span>
                <Button variant="ghost" size="sm" onClick={() => setShowPackages(false)}>
                  {language === 'da' ? 'Luk' : 'Close'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {powerPackages.map((pkg) => (
                <div 
                  key={pkg.kwh}
                  className="p-4 border rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{pkg.kwh} kWh</p>
                      <p className="text-sm text-gray-500">
                        {(pkg.price / pkg.kwh).toFixed(1)} kr/kWh
                      </p>
                    </div>
                    <p className="font-bold text-2xl text-teal-600">{pkg.price} kr</p>
                  </div>
                </div>
              ))}
              
              <Button className="w-full mt-4 bg-gray-300 text-gray-600 cursor-not-allowed" disabled>
                <Lock className="h-4 w-4 mr-2" />
                {language === 'da' ? 'Stripe betaling - kommer snart' : 'Stripe payment - coming soon'}
              </Button>
              <p className="text-xs text-center text-gray-400">
                {language === 'da' ? 'Online betaling er under udvikling' : 'Online payment is under development'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuestPower;
