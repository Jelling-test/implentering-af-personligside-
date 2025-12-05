import { useGuest } from '@/contexts/GuestContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Home,
  UtensilsCrossed,
  Bed,
  Bath,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Phone
} from 'lucide-react';
import { useState } from 'react';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80';

const GuestCabin = () => {
  const { guest, language } = useGuest();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Kun vis for hytte-gæster
  if (guest.bookingType !== 'cabin') {
    return (
      <div className="bg-white min-h-screen">
        <PageHeader 
          title={language === 'da' ? 'Din hytte' : 'Your cabin'}
          subtitle={language === 'da' ? 'Information om din hytte' : 'Cabin information'}
          image={HEADER_IMAGE}
        />
        <div className="max-w-2xl mx-auto p-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Home className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-gray-600">
                {language === 'da' ? 'Denne side er kun for hytte-gæster' :
                 language === 'de' ? 'Diese Seite ist nur für Hüttengäste' :
                 language === 'nl' ? 'Deze pagina is alleen voor hutgasten' :
                 'This page is only for cabin guests'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const inventory = [
    { 
      icon: UtensilsCrossed, 
      category: { da: 'Køkken', en: 'Kitchen', de: 'Küche', nl: 'Keuken' },
      items: { 
        da: 'Tallerkner, kopper, bestik til 6 personer, gryder, pander, elkedel',
        en: 'Plates, cups, cutlery for 6 persons, pots, pans, kettle',
        de: 'Teller, Tassen, Besteck für 6 Personen, Töpfe, Pfannen, Wasserkocher',
        nl: 'Borden, kopjes, bestek voor 6 personen, pannen, waterkoker'
      }
    },
    { 
      icon: Bed, 
      category: { da: 'Soveværelse', en: 'Bedroom', de: 'Schlafzimmer', nl: 'Slaapkamer' },
      items: { 
        da: 'Dyner og puder (medbring eget sengetøj eller lej)',
        en: 'Duvets and pillows (bring own linens or rent)',
        de: 'Bettdecken und Kissen (eigene Bettwäsche mitbringen oder mieten)',
        nl: 'Dekbedden en kussens (eigen beddengoed meenemen of huren)'
      }
    },
    { 
      icon: Bath, 
      category: { da: 'Badeværelse', en: 'Bathroom', de: 'Badezimmer', nl: 'Badkamer' },
      items: { 
        da: 'Håndklæder er IKKE inkluderet',
        en: 'Towels are NOT included',
        de: 'Handtücher sind NICHT enthalten',
        nl: 'Handdoeken zijn NIET inbegrepen'
      }
    },
    { 
      icon: Sparkles, 
      category: { da: 'Rengøring', en: 'Cleaning', de: 'Reinigung', nl: 'Schoonmaak' },
      items: { 
        da: 'Kost, moppe, fejebakke, opvaskemiddel',
        en: 'Broom, mop, dustpan, dish soap',
        de: 'Besen, Mopp, Kehrschaufel, Spülmittel',
        nl: 'Bezem, mop, blik, afwasmiddel'
      }
    },
  ];

  const checkoutTasks = [
    { id: 'dishes', da: 'Vask og sæt alt service på plads', en: 'Wash and put away all dishes', de: 'Geschirr spülen und wegräumen', nl: 'Was af en ruim alle servies op' },
    { id: 'fridge', da: 'Tøm køleskabet', en: 'Empty the refrigerator', de: 'Kühlschrank leeren', nl: 'Maak de koelkast leeg' },
    { id: 'trash', da: 'Smid affald ud (sorteret)', en: 'Take out trash (sorted)', de: 'Müll entsorgen (sortiert)', nl: 'Vuilnis buiten zetten (gesorteerd)' },
    { id: 'sweep', da: 'Fej gulvene', en: 'Sweep the floors', de: 'Böden fegen', nl: 'Veeg de vloeren' },
    { id: 'belongings', da: 'Tjek for personlige ejendele', en: 'Check for personal belongings', de: 'Nach persönlichen Gegenständen suchen', nl: 'Controleer op persoonlijke spullen' },
    { id: 'key', da: 'Aflever nøgle i receptionen senest kl. 11:00', en: 'Return key at reception by 11:00', de: 'Schlüssel bis 11:00 an der Rezeption abgeben', nl: 'Lever sleutel in bij receptie voor 11:00' },
  ];

  const toggleTask = (taskId: string) => {
    setChecklist(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const completedTasks = Object.values(checklist).filter(Boolean).length;
  const allDone = completedTasks === checkoutTasks.length;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader 
        title={language === 'da' ? 'Din hytte' : language === 'de' ? 'Ihre Hütte' : language === 'nl' ? 'Uw hut' : 'Your cabin'}
        subtitle={language === 'da' ? 'Information og tjekliste' : 'Information and checklist'}
        image={HEADER_IMAGE}
      />
      
      <div className="max-w-2xl mx-auto p-6 space-y-6">

      {/* Inventory */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">
          {language === 'da' ? 'Hvad er i hytten' : language === 'de' ? 'Was ist in der Hütte' : language === 'nl' ? 'Wat zit er in de hut' : "What's in the cabin"}
        </h2>
        <div className="space-y-3">
          {inventory.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.category[language] || item.category['en']}</p>
                    <p className="text-sm text-muted-foreground">{item.items[language] || item.items['en']}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Checkout Checklist */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            {language === 'da' ? 'Ved afrejse' : language === 'de' ? 'Beim Auschecken' : language === 'nl' ? 'Bij vertrek' : 'Before you leave'}
          </h2>
          <span className="text-sm text-muted-foreground">
            {completedTasks}/{checkoutTasks.length}
          </span>
        </div>
        
        <Card className={allDone ? 'border-green-500/50 bg-green-500/5' : ''}>
          <CardContent className="p-0 divide-y divide-border">
            {checkoutTasks.map((task) => (
              <label 
                key={task.id}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Checkbox 
                  checked={checklist[task.id] || false}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <span className={checklist[task.id] ? 'line-through text-muted-foreground' : ''}>
                  {task[language] || task['en']}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        {allDone && (
          <div className="flex items-center gap-2 text-green-600 bg-green-500/10 p-3 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">
              {language === 'da' ? 'Alt er klar! God tur hjem!' :
               language === 'de' ? 'Alles erledigt! Gute Heimreise!' :
               language === 'nl' ? 'Alles klaar! Goede reis!' :
               'All done! Safe travels!'}
            </span>
          </div>
        )}
      </section>

      {/* Problems */}
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                {language === 'da' ? 'Problemer med hytten?' :
                 language === 'de' ? 'Probleme mit der Hütte?' :
                 language === 'nl' ? 'Problemen met de hut?' :
                 'Problems with the cabin?'}
              </p>
              <p className="text-sm text-amber-700 mb-3">
                {language === 'da' ? 'Kontakt receptionen med det samme' :
                 language === 'de' ? 'Kontaktieren Sie sofort die Rezeption' :
                 language === 'nl' ? 'Neem direct contact op met de receptie' :
                 'Contact reception immediately'}
              </p>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href="tel:+4575871653">
                  <Phone className="h-4 w-4" />
                  +45 75 87 16 53
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default GuestCabin;
