import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Home, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4';

interface ChecklistItem {
  id: string;
  text_da: string;
  text_en: string;
  text_de: string;
  fee?: number; // Gebyr hvis ikke udført
}

interface InfoSection {
  id: string;
  title_da: string;
  title_en: string;
  title_de: string;
  text_da: string;
  text_en: string;
  text_de: string;
  icon: string; // fx 'kitchen', 'bedroom', 'bathroom', 'cleaning'
  cabin_numbers: string[] | 'all'; // ['26', '27'] eller 'all' for alle hytter
}

interface InventoryItem {
  id: string;
  quantity_4: number;  // Antal for 4-personers hytter
  quantity_6: number;  // Antal for 6-personers hytter
  name_da: string;
  name_en: string;
  name_de: string;
}

interface CabinSettings {
  // Ved ankomst
  arrival_items: ChecklistItem[];
  
  // Ved afrejse - altid
  departure_items: ChecklistItem[];
  
  // Slutrengøring
  cleaning_price: number;
  cleaning_items: ChecklistItem[];
  
  // Kontakt
  phone: string;
  
  // Info sektioner (Køkken, Soveværelse, etc)
  info_sections: InfoSection[];
  
  // Inventarliste
  inventory: InventoryItem[];
  
  // Hytter med 6 personer (resten antages at være 4 personer)
  cabin_6_persons: string[];  // ['26', '27', '28', ...]
}

const DEFAULT_SETTINGS: CabinSettings = {
  arrival_items: [
    { id: '1', text_da: 'Tjek om der er det anførte antal service i skabe/skuffer – ved mangler kontakt receptionen.', text_en: 'Check if there is the stated amount of tableware in cabinets/drawers - contact reception if missing.', text_de: 'Prüfen Sie, ob das angegebene Geschirr in Schränken/Schubladen vorhanden ist - bei Mängeln kontaktieren Sie die Rezeption.' },
    { id: '2', text_da: 'Er der øvrige mangler eller manglende rengøring skal det meldes til receptionen umiddelbart efter ankomst.', text_en: 'Any other deficiencies or missing cleaning must be reported to reception immediately upon arrival.', text_de: 'Sonstige Mängel oder fehlende Reinigung müssen sofort nach Ankunft an der Rezeption gemeldet werden.' },
    { id: '3', text_da: 'Skulle noget gå i stykker så henvend jer i receptionen.', text_en: 'If something breaks, please contact reception.', text_de: 'Sollte etwas kaputt gehen, wenden Sie sich bitte an die Rezeption.' },
  ],
  departure_items: [
    { id: '1', text_da: 'Affald/madampose/dåser/flasker skal være fjernet og afleveret sorteret i de opstillede containere', text_en: 'Waste/garbage bags/cans/bottles must be removed and sorted in the containers', text_de: 'Abfall/Müllbeutel/Dosen/Flaschen müssen entfernt und sortiert in die Container gebracht werden', fee: 50 },
    { id: '2', text_da: 'Evt. lejet sengelinned skal være pillet af og lagt på gulvet', text_en: 'Any rented bed linen must be removed and placed on the floor', text_de: 'Gemietete Bettwäsche muss abgezogen und auf den Boden gelegt werden', fee: 50 },
    { id: '3', text_da: 'Opvasken skal være taget og service sat på plads', text_en: 'Dishes must be washed and put away', text_de: 'Geschirr muss gespült und weggeräumt werden', fee: 100 },
    { id: '4', text_da: 'Mikro/miniovn, kaffemaskine og elkedel rengjort', text_en: 'Microwave/mini oven, coffee maker and kettle cleaned', text_de: 'Mikrowelle/Miniofen, Kaffeemaschine und Wasserkocher gereinigt', fee: 100 },
    { id: '5', text_da: 'Køleskabet tømt og rengjort', text_en: 'Refrigerator emptied and cleaned', text_de: 'Kühlschrank geleert und gereinigt', fee: 100 },
    { id: '6', text_da: 'Evt. lejet barneseng/højstol afleveret i receptionen', text_en: 'Any rented crib/high chair returned to reception', text_de: 'Gemietetes Kinderbett/Hochstuhl an der Rezeption abgegeben', fee: 100 },
  ],
  cleaning_price: 300,
  cleaning_items: [
    { id: '1', text_da: 'Badeværelse rengjort', text_en: 'Bathroom cleaned', text_de: 'Badezimmer gereinigt', fee: 200 },
    { id: '2', text_da: 'Overflader tørt af', text_en: 'Surfaces wiped dry', text_de: 'Oberflächen abgewischt', fee: 200 },
    { id: '3', text_da: 'Gulve fejet og vasket', text_en: 'Floors swept and washed', text_de: 'Böden gefegt und gewaschen', fee: 200 },
  ],
  phone: '+45 75 87 16 53',
  info_sections: [
    { id: '1', icon: 'kitchen', title_da: 'Køkken', title_en: 'Kitchen', title_de: 'Küche', text_da: 'Tallerkner, kopper, bestik til 6 personer, gryder, pander, elkedel', text_en: 'Plates, cups, cutlery for 6 persons, pots, pans, kettle', text_de: 'Teller, Tassen, Besteck für 6 Personen, Töpfe, Pfannen, Wasserkocher', cabin_numbers: 'all' },
    { id: '2', icon: 'bedroom', title_da: 'Soveværelse', title_en: 'Bedroom', title_de: 'Schlafzimmer', text_da: 'Dyner og puder (medbring eget sengetøj eller lej)', text_en: 'Duvets and pillows (bring own linens or rent)', text_de: 'Bettdecken und Kissen (eigene Bettwäsche mitbringen oder mieten)', cabin_numbers: 'all' },
    { id: '3', icon: 'bathroom', title_da: 'Badeværelse', title_en: 'Bathroom', title_de: 'Badezimmer', text_da: 'Håndklæder er IKKE inkluderet', text_en: 'Towels are NOT included', text_de: 'Handtücher sind NICHT enthalten', cabin_numbers: 'all' },
    { id: '4', icon: 'cleaning', title_da: 'Rengøring', title_en: 'Cleaning', title_de: 'Reinigung', text_da: 'Kost, moppe, fejebakke, opvaskemiddel', text_en: 'Broom, mop, dustpan, dish soap', text_de: 'Besen, Mopp, Kehrschaufel, Spülmittel', cabin_numbers: 'all' },
  ],
  inventory: [
    { id: '1', quantity_4: 4, quantity_6: 6, name_da: 'dybe tallerkner', name_en: 'deep plates', name_de: 'tiefe Teller' },
    { id: '2', quantity_4: 4, quantity_6: 6, name_da: 'frokost tallerkner', name_en: 'lunch plates', name_de: 'Frühstücksteller' },
    { id: '3', quantity_4: 4, quantity_6: 6, name_da: 'alm tallerkner', name_en: 'regular plates', name_de: 'normale Teller' },
    { id: '4', quantity_4: 4, quantity_6: 6, name_da: 'glas', name_en: 'glasses', name_de: 'Gläser' },
    { id: '5', quantity_4: 4, quantity_6: 6, name_da: 'kopper', name_en: 'cups', name_de: 'Tassen' },
    { id: '6', quantity_4: 4, quantity_6: 6, name_da: 'spiseknive', name_en: 'dinner knives', name_de: 'Essmesser' },
    { id: '7', quantity_4: 4, quantity_6: 6, name_da: 'gafler', name_en: 'forks', name_de: 'Gabeln' },
    { id: '8', quantity_4: 4, quantity_6: 6, name_da: 'spiseskeer', name_en: 'spoons', name_de: 'Esslöffel' },
    { id: '9', quantity_4: 4, quantity_6: 6, name_da: 't-skeer', name_en: 'teaspoons', name_de: 'Teelöffel' },
    { id: '10', quantity_4: 1, quantity_6: 1, name_da: 'kande', name_en: 'pitcher', name_de: 'Kanne' },
    { id: '11', quantity_4: 1, quantity_6: 1, name_da: 'sigte', name_en: 'strainer', name_de: 'Sieb' },
    { id: '12', quantity_4: 3, quantity_6: 3, name_da: 'skåle', name_en: 'bowls', name_de: 'Schüsseln' },
    { id: '13', quantity_4: 1, quantity_6: 1, name_da: 'pande', name_en: 'frying pan', name_de: 'Pfanne' },
    { id: '14', quantity_4: 3, quantity_6: 3, name_da: 'gryder', name_en: 'pots', name_de: 'Töpfe' },
    { id: '15', quantity_4: 1, quantity_6: 1, name_da: 'dåseåbner', name_en: 'can opener', name_de: 'Dosenöffner' },
    { id: '16', quantity_4: 1, quantity_6: 1, name_da: 'oplukker', name_en: 'bottle opener', name_de: 'Flaschenöffner' },
    { id: '17', quantity_4: 1, quantity_6: 1, name_da: 'kartoffelskræller', name_en: 'potato peeler', name_de: 'Kartoffelschäler' },
    { id: '18', quantity_4: 1, quantity_6: 1, name_da: 'brødkniv', name_en: 'bread knife', name_de: 'Brotmesser' },
    { id: '19', quantity_4: 3, quantity_6: 3, name_da: 'knive (forskellige størrelser)', name_en: 'knives (various sizes)', name_de: 'Messer (verschiedene Größen)' },
    { id: '20', quantity_4: 1, quantity_6: 1, name_da: 'piskeris', name_en: 'whisk', name_de: 'Schneebesen' },
    { id: '21', quantity_4: 1, quantity_6: 1, name_da: 'grydeske', name_en: 'ladle', name_de: 'Schöpfkelle' },
    { id: '22', quantity_4: 1, quantity_6: 1, name_da: 'paletkniv', name_en: 'spatula', name_de: 'Pfannenwender' },
    { id: '23', quantity_4: 1, quantity_6: 1, name_da: 'ostehøvl', name_en: 'cheese slicer', name_de: 'Käsehobel' },
  ],
  cabin_6_persons: ['28', '32', '33', '34', '36', '37', '38', '39', '40', '42'],
};

const AdminCabin = () => {
  const [settings, setSettings] = useState<CabinSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('arrival');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}?action=get-facility-settings&facility=cabin`, {
        headers: { 'Authorization': `Bearer ${ANON_KEY}` }
      });
      const data = await res.json();
      if (data.success && data.settings && Object.keys(data.settings).length > 0) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}?action=save-facility-settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ facility: 'cabin', settings })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Indstillinger gemt!');
      } else {
        toast.error('Fejl ved gem');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Fejl ved gem');
    } finally {
      setSaving(false);
    }
  };

  const updateArrivalItem = (index: number, field: string, value: string) => {
    const newItems = [...settings.arrival_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSettings({ ...settings, arrival_items: newItems });
  };

  const updateDepartureItem = (index: number, field: string, value: string | number) => {
    const newItems = [...settings.departure_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSettings({ ...settings, departure_items: newItems });
  };

  const updateCleaningItem = (index: number, field: string, value: string | number) => {
    const newItems = [...settings.cleaning_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSettings({ ...settings, cleaning_items: newItems });
  };

  const addArrivalItem = () => {
    setSettings({
      ...settings,
      arrival_items: [...settings.arrival_items, { id: Date.now().toString(), text_da: '', text_en: '', text_de: '' }]
    });
  };

  const addDepartureItem = () => {
    setSettings({
      ...settings,
      departure_items: [...settings.departure_items, { id: Date.now().toString(), text_da: '', text_en: '', text_de: '', fee: 0 }]
    });
  };

  const addCleaningItem = () => {
    setSettings({
      ...settings,
      cleaning_items: [...settings.cleaning_items, { id: Date.now().toString(), text_da: '', text_en: '', text_de: '', fee: 0 }]
    });
  };

  const removeArrivalItem = (index: number) => {
    setSettings({
      ...settings,
      arrival_items: settings.arrival_items.filter((_, i) => i !== index)
    });
  };

  const removeDepartureItem = (index: number) => {
    setSettings({
      ...settings,
      departure_items: settings.departure_items.filter((_, i) => i !== index)
    });
  };

  const removeCleaningItem = (index: number) => {
    setSettings({
      ...settings,
      cleaning_items: settings.cleaning_items.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/guest/welcome" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Home className="h-5 w-5 text-amber-600" />
                  Hytte Administration
                </h1>
                <p className="text-sm text-gray-500">Rediger tjeklister og gebyrer</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Gem
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="arrival">Ankomst</TabsTrigger>
            <TabsTrigger value="departure">Afrejse</TabsTrigger>
            <TabsTrigger value="cleaning">Rengøring</TabsTrigger>
            <TabsTrigger value="info">Info kasser</TabsTrigger>
            <TabsTrigger value="inventory">Inventar</TabsTrigger>
          </TabsList>

          {/* VED ANKOMST */}
          <TabsContent value="arrival" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tjekliste ved ankomst</CardTitle>
                <p className="text-sm text-gray-500">Punkter gæsten skal tjekke ved ankomst</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.arrival_items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-gray-600">Punkt {index + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeArrivalItem(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs">Dansk</Label>
                      <Textarea
                        value={item.text_da}
                        onChange={(e) => updateArrivalItem(index, 'text_da', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">English</Label>
                      <Textarea
                        value={item.text_en}
                        onChange={(e) => updateArrivalItem(index, 'text_en', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Deutsch</Label>
                      <Textarea
                        value={item.text_de}
                        onChange={(e) => updateArrivalItem(index, 'text_de', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addArrivalItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Tilføj punkt
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VED AFREJSE */}
          <TabsContent value="departure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tjekliste ved afrejse</CardTitle>
                <p className="text-sm text-gray-500">Punkter der SKAL udføres - med gebyr hvis ikke udført</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.departure_items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-amber-50">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-amber-700">Punkt {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Gebyr:</Label>
                          <Input
                            type="number"
                            value={item.fee || 0}
                            onChange={(e) => updateDepartureItem(index, 'fee', parseInt(e.target.value) || 0)}
                            className="w-20 h-8"
                          />
                          <span className="text-xs">kr</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeDepartureItem(index)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Dansk</Label>
                      <Textarea
                        value={item.text_da}
                        onChange={(e) => updateDepartureItem(index, 'text_da', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">English</Label>
                      <Textarea
                        value={item.text_en}
                        onChange={(e) => updateDepartureItem(index, 'text_en', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Deutsch</Label>
                      <Textarea
                        value={item.text_de}
                        onChange={(e) => updateDepartureItem(index, 'text_de', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addDepartureItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Tilføj punkt
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SLUTRENGØRING */}
          <TabsContent value="cleaning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Slutrengøring</CardTitle>
                <p className="text-sm text-gray-500">Kan tilkøbes - ellers skal gæsten selv udføre</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-lg">
                  <Label className="font-medium">Pris for slutrengøring:</Label>
                  <Input
                    type="number"
                    value={settings.cleaning_price}
                    onChange={(e) => setSettings({ ...settings, cleaning_price: parseInt(e.target.value) || 0 })}
                    className="w-24"
                  />
                  <span>kr</span>
                </div>

                <p className="text-sm text-gray-600 font-medium mt-6">Hvis IKKE tilkøbt slutrengøring, skal følgende udføres:</p>

                {settings.cleaning_items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-red-50">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-red-700">Punkt {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Gebyr:</Label>
                          <Input
                            type="number"
                            value={item.fee || 0}
                            onChange={(e) => updateCleaningItem(index, 'fee', parseInt(e.target.value) || 0)}
                            className="w-20 h-8"
                          />
                          <span className="text-xs">kr</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeCleaningItem(index)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Dansk</Label>
                      <Textarea
                        value={item.text_da}
                        onChange={(e) => updateCleaningItem(index, 'text_da', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">English</Label>
                      <Textarea
                        value={item.text_en}
                        onChange={(e) => updateCleaningItem(index, 'text_en', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Deutsch</Label>
                      <Textarea
                        value={item.text_de}
                        onChange={(e) => updateCleaningItem(index, 'text_de', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addCleaningItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Tilføj punkt
                </Button>
              </CardContent>
            </Card>

            {/* Kontakt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kontakt</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Telefonnummer</Label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INFO SEKTIONER */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Info kasser</CardTitle>
                <p className="text-sm text-gray-500">Køkken, Soveværelse, Badeværelse, Rengøring etc.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.info_sections?.map((section, index) => (
                  <div key={section.id} className="border rounded-lg p-4 space-y-3 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-blue-700">Sektion {index + 1}</span>
                        <select
                          value={section.icon}
                          onChange={(e) => {
                            const newSections = [...settings.info_sections];
                            newSections[index] = { ...newSections[index], icon: e.target.value };
                            setSettings({ ...settings, info_sections: newSections });
                          }}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="kitchen">🍳 Køkken</option>
                          <option value="bedroom">🛏️ Soveværelse</option>
                          <option value="bathroom">🚿 Badeværelse</option>
                          <option value="cleaning">🧹 Rengøring</option>
                        </select>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSettings({
                          ...settings,
                          info_sections: settings.info_sections.filter((_, i) => i !== index)
                        });
                      }} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Hytte numre */}
                    <div className="flex items-center gap-2 bg-white p-2 rounded border">
                      <Label className="text-xs whitespace-nowrap">Vis for hytter:</Label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={section.cabin_numbers === 'all'}
                          onChange={(e) => {
                            const newSections = [...settings.info_sections];
                            newSections[index] = { 
                              ...newSections[index], 
                              cabin_numbers: e.target.checked ? 'all' : [] 
                            };
                            setSettings({ ...settings, info_sections: newSections });
                          }}
                          className="rounded"
                        />
                        Alle
                      </label>
                      {section.cabin_numbers !== 'all' && (
                        <Input
                          value={Array.isArray(section.cabin_numbers) ? section.cabin_numbers.join(', ') : ''}
                          onChange={(e) => {
                            const newSections = [...settings.info_sections];
                            const numbers = e.target.value.split(',').map(n => n.trim()).filter(n => n);
                            newSections[index] = { ...newSections[index], cabin_numbers: numbers };
                            setSettings({ ...settings, info_sections: newSections });
                          }}
                          placeholder="26, 27, 28"
                          className="flex-1 text-xs h-8"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Titel (DA)</Label>
                        <Input
                          value={section.title_da}
                          onChange={(e) => {
                            const newSections = [...settings.info_sections];
                            newSections[index] = { ...newSections[index], title_da: e.target.value };
                            setSettings({ ...settings, info_sections: newSections });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Titel (EN)</Label>
                        <Input
                          value={section.title_en}
                          onChange={(e) => {
                            const newSections = [...settings.info_sections];
                            newSections[index] = { ...newSections[index], title_en: e.target.value };
                            setSettings({ ...settings, info_sections: newSections });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Titel (DE)</Label>
                        <Input
                          value={section.title_de}
                          onChange={(e) => {
                            const newSections = [...settings.info_sections];
                            newSections[index] = { ...newSections[index], title_de: e.target.value };
                            setSettings({ ...settings, info_sections: newSections });
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Beskrivelse (DA)</Label>
                      <Textarea
                        value={section.text_da}
                        onChange={(e) => {
                          const newSections = [...settings.info_sections];
                          newSections[index] = { ...newSections[index], text_da: e.target.value };
                          setSettings({ ...settings, info_sections: newSections });
                        }}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Beskrivelse (EN)</Label>
                      <Textarea
                        value={section.text_en}
                        onChange={(e) => {
                          const newSections = [...settings.info_sections];
                          newSections[index] = { ...newSections[index], text_en: e.target.value };
                          setSettings({ ...settings, info_sections: newSections });
                        }}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Beskrivelse (DE)</Label>
                      <Textarea
                        value={section.text_de}
                        onChange={(e) => {
                          const newSections = [...settings.info_sections];
                          newSections[index] = { ...newSections[index], text_de: e.target.value };
                          setSettings({ ...settings, info_sections: newSections });
                        }}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => {
                  setSettings({
                    ...settings,
                    info_sections: [...(settings.info_sections || []), { 
                      id: Date.now().toString(), 
                      icon: 'kitchen',
                      title_da: '', title_en: '', title_de: '',
                      text_da: '', text_en: '', text_de: '',
                      cabin_numbers: 'all'
                    }]
                  });
                }} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Tilføj info sektion
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INVENTAR */}
          <TabsContent value="inventory" className="space-y-4">
            {/* 6-personers hytter */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">6-personers hytter</CardTitle>
                <p className="text-xs text-gray-500">Angiv hyttenumre (kommasepareret)</p>
              </CardHeader>
              <CardContent>
                <Input
                  defaultValue={settings.cabin_6_persons?.join(', ') || ''}
                  onBlur={(e) => {
                    const numbers = e.target.value.split(',').map(n => n.trim()).filter(n => n);
                    setSettings({ ...settings, cabin_6_persons: numbers });
                  }}
                  placeholder="28, 32, 33, 34, 36, 37, 38, 39, 40, 42"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inventarliste</CardTitle>
                <p className="text-sm text-gray-500">Service og udstyr i hytten</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Header */}
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded text-xs font-medium text-gray-600">
                  <span className="w-14 text-center">4-pers</span>
                  <span className="w-14 text-center">6-pers</span>
                  <span className="flex-1">Dansk</span>
                  <span className="flex-1">English</span>
                  <span className="flex-1">Deutsch</span>
                  <span className="w-8"></span>
                </div>
                {settings.inventory?.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Input
                      type="number"
                      value={item.quantity_4}
                      onChange={(e) => {
                        const newInventory = [...settings.inventory];
                        newInventory[index] = { ...newInventory[index], quantity_4: parseInt(e.target.value) || 0 };
                        setSettings({ ...settings, inventory: newInventory });
                      }}
                      className="w-14 text-center text-sm"
                      min={0}
                    />
                    <Input
                      type="number"
                      value={item.quantity_6}
                      onChange={(e) => {
                        const newInventory = [...settings.inventory];
                        newInventory[index] = { ...newInventory[index], quantity_6: parseInt(e.target.value) || 0 };
                        setSettings({ ...settings, inventory: newInventory });
                      }}
                      className="w-14 text-center text-sm"
                      min={0}
                    />
                    <Input
                      value={item.name_da}
                      onChange={(e) => {
                        const newInventory = [...settings.inventory];
                        newInventory[index] = { ...newInventory[index], name_da: e.target.value };
                        setSettings({ ...settings, inventory: newInventory });
                      }}
                      placeholder="Dansk"
                      className="flex-1 text-sm"
                    />
                    <Input
                      value={item.name_en}
                      onChange={(e) => {
                        const newInventory = [...settings.inventory];
                        newInventory[index] = { ...newInventory[index], name_en: e.target.value };
                        setSettings({ ...settings, inventory: newInventory });
                      }}
                      placeholder="English"
                      className="flex-1 text-sm"
                    />
                    <Input
                      value={item.name_de}
                      onChange={(e) => {
                        const newInventory = [...settings.inventory];
                        newInventory[index] = { ...newInventory[index], name_de: e.target.value };
                        setSettings({ ...settings, inventory: newInventory });
                      }}
                      placeholder="Deutsch"
                      className="flex-1 text-sm"
                    />
                    <Button variant="ghost" size="sm" onClick={() => {
                      setSettings({
                        ...settings,
                        inventory: settings.inventory.filter((_, i) => i !== index)
                      });
                    }} className="text-red-500 hover:text-red-700 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={() => {
                  setSettings({
                    ...settings,
                    inventory: [...(settings.inventory || []), { 
                      id: Date.now().toString(), 
                      quantity_4: 1,
                      quantity_6: 1,
                      name_da: '', name_en: '', name_de: ''
                    }]
                  });
                }} className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Tilføj inventar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCabin;
