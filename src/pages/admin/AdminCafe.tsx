import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft, Coffee, Plus, Trash2, UtensilsCrossed, Wine, PartyPopper, Phone, Clock, Upload, Loader2, Printer, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4';

const apiHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ANON_KEY}`
};

// Mock billeder
const MOCK_IMAGES = {
  food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  drinks: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  offer: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  party1: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
  party2: 'https://images.unsplash.com/photo-1529566652340-2c41a1eb6d93?w=400',
};

interface OpeningHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

interface MenuItem {
  id?: number;
  ref_id?: string;
  category: 'food' | 'drinks';
  name_da: string;
  name_en: string;
  name_de: string;
  description_da: string;
  description_en: string;
  description_de: string;
  price: number;
  image_url: string;
  active: boolean;
  sort_order: number;
}

interface Offer {
  id?: number;
  ref_id?: string;
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
  execution_date: string;
  order_deadline: string;
  cancel_deadline: string;
  active: boolean;
  sort_order: number;
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

interface CafeOrder {
  id: number;
  ref_id: string;
  order_number: string;
  booking_nummer: string;
  guest_name: string;
  guest_phone: string;
  offer_name: string;
  quantity: number;
  dining_option: 'eat_in' | 'takeaway';
  execution_date: string;
  total: number;
  status: string;
  created_at: string;
}

const defaultSettings: CafeSettings = {
  opening_hours: {
    mon: { open: '08:00', close: '17:00', closed: false },
    tue: { open: '08:00', close: '17:00', closed: false },
    wed: { open: '08:00', close: '17:00', closed: false },
    thu: { open: '08:00', close: '17:00', closed: false },
    fri: { open: '08:00', close: '17:00', closed: false },
    sat: { open: '09:00', close: '16:00', closed: false },
    sun: { open: '09:00', close: '16:00', closed: false },
  },
  header_image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f54?w=1200&q=80',
  reopening_date: '',
  contact_phone: '+45 75 87 16 53',
  contact_email: 'cafe@jellingcamping.dk',
  contact_text_da: 'Kontakt os for særlige arrangementer eller spørgsmål.',
  contact_text_en: 'Contact us for special events or questions.',
  contact_text_de: 'Kontaktieren Sie uns für besondere Veranstaltungen oder Fragen.',
  party_boxes: [
    { id: 1, title_da: '', title_en: '', title_de: '', text_da: '', text_en: '', text_de: '', image_url: '', active: false },
    { id: 2, title_da: '', title_en: '', title_de: '', text_da: '', text_en: '', text_de: '', image_url: '', active: false },
    { id: 3, title_da: '', title_en: '', title_de: '', text_da: '', text_en: '', text_de: '', image_url: '', active: false },
    { id: 4, title_da: '', title_en: '', title_de: '', text_da: '', text_en: '', text_de: '', image_url: '', active: false },
    { id: 5, title_da: '', title_en: '', title_de: '', text_da: '', text_en: '', text_de: '', image_url: '', active: false },
    { id: 6, title_da: '', title_en: '', title_de: '', text_da: '', text_en: '', text_de: '', image_url: '', active: false },
  ]
};

const defaultMenuItems: MenuItem[] = [
  { category: 'food', name_da: 'Toast med ost og skinke', name_en: 'Toast with cheese and ham', name_de: 'Toast mit Käse und Schinken', description_da: 'Klassisk toast med smeltet ost og skinke', description_en: 'Classic toast with melted cheese and ham', description_de: 'Klassischer Toast mit geschmolzenem Käse und Schinken', price: 45, image_url: MOCK_IMAGES.food, active: true, sort_order: 1 },
  { category: 'food', name_da: 'Sandwich', name_en: 'Sandwich', name_de: 'Sandwich', description_da: 'Frisk sandwich med salat og dressing', description_en: 'Fresh sandwich with salad and dressing', description_de: 'Frisches Sandwich mit Salat und Dressing', price: 55, image_url: MOCK_IMAGES.food, active: true, sort_order: 2 },
  { category: 'food', name_da: 'Pommes frites', name_en: 'French fries', name_de: 'Pommes Frites', description_da: 'Sprøde pommes frites', description_en: 'Crispy french fries', description_de: 'Knusprige Pommes Frites', price: 35, image_url: MOCK_IMAGES.food, active: true, sort_order: 3 },
  { category: 'drinks', name_da: 'Kaffe', name_en: 'Coffee', name_de: 'Kaffee', description_da: 'Friskbrygget kaffe', description_en: 'Freshly brewed coffee', description_de: 'Frisch gebrühter Kaffee', price: 25, image_url: MOCK_IMAGES.drinks, active: true, sort_order: 1 },
  { category: 'drinks', name_da: 'Sodavand', name_en: 'Soft drink', name_de: 'Softdrink', description_da: 'Coca-Cola, Fanta, Sprite', description_en: 'Coca-Cola, Fanta, Sprite', description_de: 'Coca-Cola, Fanta, Sprite', price: 20, image_url: MOCK_IMAGES.drinks, active: true, sort_order: 2 },
  { category: 'drinks', name_da: 'Øl', name_en: 'Beer', name_de: 'Bier', description_da: 'Fadøl eller flaske', description_en: 'Draft or bottle', description_de: 'Vom Fass oder Flasche', price: 35, image_url: MOCK_IMAGES.drinks, active: true, sort_order: 3 },
];

const dayNames: { [key: string]: string } = {
  mon: 'Mandag', tue: 'Tirsdag', wed: 'Onsdag', thu: 'Torsdag', fri: 'Fredag', sat: 'Lørdag', sun: 'Søndag'
};

const AdminCafe = () => {
  const [settings, setSettings] = useState<CafeSettings>(defaultSettings);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<CafeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hours');
  const [uploading, setUploading] = useState<string | null>(null); // Track which field is uploading
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set()); // Track expanded order groups

  // Upload billede til Supabase Storage
  const uploadImage = async (file: File, targetType: 'offer' | 'menu' | 'party', index: number) => {
    const uploadKey = `${targetType}_${index}`;
    setUploading(uploadKey);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_URL}?action=upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ANON_KEY}` },
        body: formData
      });
      
      const data = await res.json();
      
      if (data.success && data.url) {
        // Update the correct state based on target type
        if (targetType === 'offer') {
          const updated = [...offers];
          updated[index] = { ...updated[index], image_url: data.url };
          setOffers(updated);
        } else if (targetType === 'menu') {
          const updated = [...menuItems];
          updated[index] = { ...updated[index], image_url: data.url };
          setMenuItems(updated);
        } else if (targetType === 'party') {
          const updated = [...settings.party_boxes];
          updated[index] = { ...updated[index], image_url: data.url };
          setSettings({ ...settings, party_boxes: updated });
        }
        toast.success('Billede uploadet!');
      } else {
        toast.error(data.error || 'Upload fejlede');
      }
    } catch {
      toast.error('Fejl ved upload');
    } finally {
      setUploading(null);
    }
  };

  // Trigger file input click
  const triggerFileUpload = (targetType: 'offer' | 'menu' | 'party', index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadImage(file, targetType, index);
      }
    };
    input.click();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // Fetch settings
      const settingsRes = await fetch(`${API_URL}?action=cafe-get-settings`, { headers: apiHeaders });
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings && Object.keys(settingsData.settings).length > 0) {
        setSettings({ ...defaultSettings, ...settingsData.settings });
      }

      // Fetch menu
      const menuRes = await fetch(`${API_URL}?action=cafe-get-menu`, { headers: apiHeaders });
      const menuData = await menuRes.json();
      if (menuData.success && menuData.items.length > 0) {
        setMenuItems(menuData.items);
      } else {
        // Save default menu items
        for (const item of defaultMenuItems) {
          await fetch(`${API_URL}?action=cafe-save-menu-item`, {
            method: 'POST',
            headers: apiHeaders,
            body: JSON.stringify(item)
          });
        }
        setMenuItems(defaultMenuItems);
      }

      // Fetch offers
      const offersRes = await fetch(`${API_URL}?action=cafe-get-offers`, { headers: apiHeaders });
      const offersData = await offersRes.json();
      if (offersData.success) {
        setOffers(offersData.offers);
      }

      // Fetch orders
      const ordersRes = await fetch(`${API_URL}?action=cafe-get-orders`, { headers: apiHeaders });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
    } catch (error) {
      console.error('Error fetching café data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}?action=cafe-save-settings`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Indstillinger gemt!');
      } else {
        toast.error('Kunne ikke gemme');
      }
    } catch {
      toast.error('Fejl ved gemning');
    } finally {
      setSaving(false);
    }
  };

  const saveMenuItem = async (item: MenuItem) => {
    try {
      await fetch(`${API_URL}?action=cafe-save-menu-item`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(item)
      });
      toast.success('Menu item gemt!');
      fetchAll();
    } catch {
      toast.error('Fejl ved gemning');
    }
  };

  const deleteMenuItem = async (id: number) => {
    if (!confirm('Slet dette menu item?')) return;
    try {
      await fetch(`${API_URL}?action=cafe-delete-menu-item`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ id })
      });
      toast.success('Slettet!');
      fetchAll();
    } catch {
      toast.error('Fejl ved sletning');
    }
  };

  const saveOffer = async (offer: Offer) => {
    try {
      await fetch(`${API_URL}?action=cafe-save-offer`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(offer)
      });
      toast.success('Tilbud gemt!');
      fetchAll();
    } catch {
      toast.error('Fejl ved gemning');
    }
  };

  const deleteOffer = async (id: number) => {
    if (!confirm('Slet dette tilbud?')) return;
    try {
      await fetch(`${API_URL}?action=cafe-delete-offer`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ id })
      });
      toast.success('Slettet!');
      fetchAll();
    } catch {
      toast.error('Fejl ved sletning');
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API_URL}?action=cafe-update-order`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ id, status })
      });
      toast.success('Status opdateret!');
      fetchAll();
    } catch {
      toast.error('Fejl ved opdatering');
    }
  };

  const addNewMenuItem = (category: 'food' | 'drinks') => {
    const newItem: MenuItem = {
      category,
      name_da: '', name_en: '', name_de: '',
      description_da: '', description_en: '', description_de: '',
      price: 0,
      image_url: category === 'food' ? MOCK_IMAGES.food : MOCK_IMAGES.drinks,
      active: true,
      sort_order: menuItems.filter(m => m.category === category).length + 1
    };
    setMenuItems([...menuItems, newItem]);
  };

  const addNewOffer = () => {
    const newOffer: Offer = {
      name_da: '', name_en: '', name_de: '',
      description_da: '', description_en: '', description_de: '',
      price: 0,
      image_url: '',
      visible_from: '',
      visible_to: '',
      execution_date: '',
      order_deadline: '',
      cancel_deadline: '',
      active: false,
      sort_order: offers.length + 1
    };
    setOffers([...offers, newOffer]);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Indlæser...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-amber-600" />
              <h1 className="text-xl font-bold">Café Administration</h1>
            </div>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Gemmer...' : 'Gem ændringer'}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="hours" className="gap-2"><Clock className="h-4 w-4" /> Åbningstider</TabsTrigger>
            <TabsTrigger value="offers" className="gap-2"><UtensilsCrossed className="h-4 w-4" /> Tilbud</TabsTrigger>
            <TabsTrigger value="menu" className="gap-2"><Wine className="h-4 w-4" /> Menukort</TabsTrigger>
            <TabsTrigger value="party" className="gap-2"><PartyPopper className="h-4 w-4" /> Festmenuer</TabsTrigger>
            <TabsTrigger value="contact" className="gap-2"><Phone className="h-4 w-4" /> Kontakt</TabsTrigger>
            <TabsTrigger value="orders">Bestillinger ({orders.filter(o => o.status === 'pending').length})</TabsTrigger>
          </TabsList>

          {/* ÅBNINGSTIDER */}
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Åbningstider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.opening_hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <span className="w-24 font-medium">{dayNames[day]}</span>
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => {
                        setSettings({
                          ...settings,
                          opening_hours: {
                            ...settings.opening_hours,
                            [day]: { ...hours, closed: !checked }
                          }
                        });
                      }}
                    />
                    {!hours.closed ? (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              opening_hours: {
                                ...settings.opening_hours,
                                [day]: { ...hours, open: e.target.value }
                              }
                            });
                          }}
                          className="w-32"
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => {
                            setSettings({
                              ...settings,
                              opening_hours: {
                                ...settings.opening_hours,
                                [day]: { ...hours, close: e.target.value }
                              }
                            });
                          }}
                          className="w-32"
                        />
                      </>
                    ) : (
                      <span className="text-red-500 font-medium">Lukket</span>
                    )}
                  </div>
                ))}
                
                {/* Genåbningsdato */}
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Label className="font-medium text-amber-800">Genåbningsdato (vintersæson)</Label>
                  <p className="text-sm text-amber-600 mb-2">
                    Hvis alle dage er lukket, vises denne dato til kunderne
                  </p>
                  <Input 
                    type="date" 
                    value={settings.reopening_date || ''} 
                    onChange={e => setSettings({ ...settings, reopening_date: e.target.value })}
                    className="w-48"
                  />
                  {settings.reopening_date && (
                    <p className="text-sm text-amber-700 mt-2">
                      Vises som: "Åbner igen {new Date(settings.reopening_date).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}"
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TILBUD */}
          <TabsContent value="offers" className="space-y-4">
            {offers.map((offer, index) => (
              <Card key={offer.id || index} className={!offer.active ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {offer.name_da || 'Nyt tilbud'}
                      {offer.active && <Badge className="bg-green-500">Aktiv</Badge>}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={offer.active}
                        onCheckedChange={(checked) => {
                          const updated = [...offers];
                          updated[index] = { ...offer, active: checked };
                          setOffers(updated);
                        }}
                      />
                      <Button variant="ghost" size="sm" onClick={() => saveOffer(offer)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      {offer.id && (
                        <Button variant="ghost" size="sm" onClick={() => deleteOffer(offer.id!)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Navn (DA)</Label>
                      <Input value={offer.name_da} onChange={e => {
                        const updated = [...offers];
                        updated[index] = { ...offer, name_da: e.target.value };
                        setOffers(updated);
                      }} />
                    </div>
                    <div>
                      <Label>Navn (EN)</Label>
                      <Input value={offer.name_en} onChange={e => {
                        const updated = [...offers];
                        updated[index] = { ...offer, name_en: e.target.value };
                        setOffers(updated);
                      }} />
                    </div>
                    <div>
                      <Label>Navn (DE)</Label>
                      <Input value={offer.name_de} onChange={e => {
                        const updated = [...offers];
                        updated[index] = { ...offer, name_de: e.target.value };
                        setOffers(updated);
                      }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Beskrivelse (DA)</Label>
                      <Textarea value={offer.description_da} onChange={e => {
                        const updated = [...offers];
                        updated[index] = { ...offer, description_da: e.target.value };
                        setOffers(updated);
                      }} rows={2} />
                    </div>
                    <div>
                      <Label>Beskrivelse (EN)</Label>
                      <Textarea value={offer.description_en} onChange={e => {
                        const updated = [...offers];
                        updated[index] = { ...offer, description_en: e.target.value };
                        setOffers(updated);
                      }} rows={2} />
                    </div>
                    <div>
                      <Label>Beskrivelse (DE)</Label>
                      <Textarea value={offer.description_de} onChange={e => {
                        const updated = [...offers];
                        updated[index] = { ...offer, description_de: e.target.value };
                        setOffers(updated);
                      }} rows={2} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Pris (kr)</Label>
                      <Input type="number" value={offer.price} onChange={e => {
                        const updated = [...offers];
                        updated[index] = { ...offer, price: parseFloat(e.target.value) || 0 };
                        setOffers(updated);
                      }} />
                    </div>
                    <div className="col-span-2">
                      <Label>Billede (valgfrit)</Label>
                      <div className="flex gap-2 items-center">
                        <Input value={offer.image_url} onChange={e => {
                          const updated = [...offers];
                          updated[index] = { ...offer, image_url: e.target.value };
                          setOffers(updated);
                        }} placeholder="https://..." className="flex-1" />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => triggerFileUpload('offer', index)}
                          disabled={uploading === `offer_${index}`}
                        >
                          {uploading === `offer_${index}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                        {offer.image_url && (
                          <img src={offer.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                    <div>
                      <Label className="text-xs">Vises fra (tilbuddet bliver synligt)</Label>
                      <Input type="datetime-local" value={offer.visible_from} onChange={e => {
                        const updated = [...offers];
                        updated[index] = { ...offer, visible_from: e.target.value };
                        setOffers(updated);
                      }} className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs">Vises til (deadline for bestilling/afbestilling)</Label>
                      <Input type="datetime-local" value={offer.visible_to} onChange={e => {
                        const updated = [...offers];
                        updated[index] = { ...offer, visible_to: e.target.value };
                        setOffers(updated);
                      }} className="text-xs" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addNewOffer} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Tilføj nyt tilbud
            </Button>
          </TabsContent>

          {/* MENUKORT */}
          <TabsContent value="menu" className="space-y-6">
            {/* Mad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" /> Mad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {menuItems.filter(m => m.category === 'food').map((item, idx) => {
                  const index = menuItems.findIndex(m => m === item);
                  return (
                    <div key={item.id || idx} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.active}
                            onCheckedChange={(checked) => {
                              const updated = [...menuItems];
                              updated[index] = { ...item, active: checked };
                              setMenuItems(updated);
                            }}
                          />
                          <span className="font-medium">{item.name_da || 'Ny mad'}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => saveMenuItem(item)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          {item.id && (
                            <Button variant="ghost" size="sm" onClick={() => deleteMenuItem(item.id!)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <Input placeholder="Navn (DA)" value={item.name_da} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, name_da: e.target.value };
                          setMenuItems(updated);
                        }} />
                        <Input placeholder="Navn (EN)" value={item.name_en} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, name_en: e.target.value };
                          setMenuItems(updated);
                        }} />
                        <Input placeholder="Navn (DE)" value={item.name_de} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, name_de: e.target.value };
                          setMenuItems(updated);
                        }} />
                        <Input type="number" placeholder="Pris" value={item.price} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, price: parseFloat(e.target.value) || 0 };
                          setMenuItems(updated);
                        }} />
                      </div>
                      <div className="flex gap-3 items-center">
                        <Input placeholder="Billede URL" value={item.image_url} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, image_url: e.target.value };
                          setMenuItems(updated);
                        }} className="flex-1" />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => triggerFileUpload('menu', index)}
                          disabled={uploading === `menu_${index}`}
                        >
                          {uploading === `menu_${index}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                        {item.image_url && (
                          <img src={item.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                        )}
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" onClick={() => addNewMenuItem('food')} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Tilføj mad
                </Button>
              </CardContent>
            </Card>

            {/* Drikkevarer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wine className="h-5 w-5" /> Drikkevarer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {menuItems.filter(m => m.category === 'drinks').map((item, idx) => {
                  const index = menuItems.findIndex(m => m === item);
                  return (
                    <div key={item.id || idx} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.active}
                            onCheckedChange={(checked) => {
                              const updated = [...menuItems];
                              updated[index] = { ...item, active: checked };
                              setMenuItems(updated);
                            }}
                          />
                          <span className="font-medium">{item.name_da || 'Ny drikkevare'}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => saveMenuItem(item)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          {item.id && (
                            <Button variant="ghost" size="sm" onClick={() => deleteMenuItem(item.id!)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <Input placeholder="Navn (DA)" value={item.name_da} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, name_da: e.target.value };
                          setMenuItems(updated);
                        }} />
                        <Input placeholder="Navn (EN)" value={item.name_en} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, name_en: e.target.value };
                          setMenuItems(updated);
                        }} />
                        <Input placeholder="Navn (DE)" value={item.name_de} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, name_de: e.target.value };
                          setMenuItems(updated);
                        }} />
                        <Input type="number" placeholder="Pris" value={item.price} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, price: parseFloat(e.target.value) || 0 };
                          setMenuItems(updated);
                        }} />
                      </div>
                      <div className="flex gap-3 items-center">
                        <Input placeholder="Billede URL" value={item.image_url} onChange={e => {
                          const updated = [...menuItems];
                          updated[index] = { ...item, image_url: e.target.value };
                          setMenuItems(updated);
                        }} className="flex-1" />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => triggerFileUpload('menu', index)}
                          disabled={uploading === `menu_${index}`}
                        >
                          {uploading === `menu_${index}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                        {item.image_url && (
                          <img src={item.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                        )}
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" onClick={() => addNewMenuItem('drinks')} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Tilføj drikkevare
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FESTMENUER */}
          <TabsContent value="party" className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">Op til 6 kasser med festmenuer. Aktiver dem du vil vise på gæstesiden.</p>
            {settings.party_boxes.map((box, index) => (
              <Card key={box.id} className={!box.active ? 'opacity-50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Kasse {box.id}</CardTitle>
                    <Switch
                      checked={box.active}
                      onCheckedChange={(checked) => {
                        const updated = [...settings.party_boxes];
                        updated[index] = { ...box, active: checked };
                        setSettings({ ...settings, party_boxes: updated });
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="Titel (DA)" value={box.title_da} onChange={e => {
                      const updated = [...settings.party_boxes];
                      updated[index] = { ...box, title_da: e.target.value };
                      setSettings({ ...settings, party_boxes: updated });
                    }} />
                    <Input placeholder="Titel (EN)" value={box.title_en} onChange={e => {
                      const updated = [...settings.party_boxes];
                      updated[index] = { ...box, title_en: e.target.value };
                      setSettings({ ...settings, party_boxes: updated });
                    }} />
                    <Input placeholder="Titel (DE)" value={box.title_de} onChange={e => {
                      const updated = [...settings.party_boxes];
                      updated[index] = { ...box, title_de: e.target.value };
                      setSettings({ ...settings, party_boxes: updated });
                    }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Textarea placeholder="Tekst (DA)" value={box.text_da} onChange={e => {
                      const updated = [...settings.party_boxes];
                      updated[index] = { ...box, text_da: e.target.value };
                      setSettings({ ...settings, party_boxes: updated });
                    }} rows={2} />
                    <Textarea placeholder="Tekst (EN)" value={box.text_en} onChange={e => {
                      const updated = [...settings.party_boxes];
                      updated[index] = { ...box, text_en: e.target.value };
                      setSettings({ ...settings, party_boxes: updated });
                    }} rows={2} />
                    <Textarea placeholder="Tekst (DE)" value={box.text_de} onChange={e => {
                      const updated = [...settings.party_boxes];
                      updated[index] = { ...box, text_de: e.target.value };
                      setSettings({ ...settings, party_boxes: updated });
                    }} rows={2} />
                  </div>
                  <div className="flex gap-3 items-center">
                    <Input placeholder="Billede URL" value={box.image_url} onChange={e => {
                      const updated = [...settings.party_boxes];
                      updated[index] = { ...box, image_url: e.target.value };
                      setSettings({ ...settings, party_boxes: updated });
                    }} className="flex-1" />
                    {box.image_url && (
                      <img src={box.image_url} alt="" className="h-12 w-12 rounded object-cover" />
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => triggerFileUpload('party', index)}
                      disabled={uploading === `party_${index}`}
                    >
                      {uploading === `party_${index}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* KONTAKT */}
          <TabsContent value="contact">
            {/* Header billede */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Header billede</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 items-center">
                  <Input 
                    placeholder="Billede URL" 
                    value={settings.header_image || ''} 
                    onChange={e => setSettings({ ...settings, header_image: e.target.value })} 
                    className="flex-1" 
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          setUploading('header');
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await fetch(`${API_URL}?action=upload-image`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${ANON_KEY}` },
                              body: formData
                            });
                            const data = await res.json();
                            if (data.success && data.url) {
                              setSettings({ ...settings, header_image: data.url });
                              toast.success('Billede uploadet!');
                            }
                          } catch {
                            toast.error('Upload fejlede');
                          } finally {
                            setUploading(null);
                          }
                        }
                      };
                      input.click();
                    }}
                    disabled={uploading === 'header'}
                  >
                    {uploading === 'header' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {settings.header_image && (
                  <img src={settings.header_image} alt="" className="mt-3 h-24 w-full object-cover rounded" />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Kontakt information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Telefon</Label>
                    <Input value={settings.contact_phone} onChange={e => setSettings({ ...settings, contact_phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={settings.contact_email} onChange={e => setSettings({ ...settings, contact_email: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Tekst (DA)</Label>
                    <Textarea value={settings.contact_text_da} onChange={e => setSettings({ ...settings, contact_text_da: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <Label>Tekst (EN)</Label>
                    <Textarea value={settings.contact_text_en} onChange={e => setSettings({ ...settings, contact_text_en: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <Label>Tekst (DE)</Label>
                    <Textarea value={settings.contact_text_de} onChange={e => setSettings({ ...settings, contact_text_de: e.target.value })} rows={3} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BESTILLINGER */}
          <TabsContent value="orders">
            {/* Fjern udløbne knap */}
            <Button 
              variant="outline" 
              className="mb-4 text-red-600 border-red-300"
              onClick={async () => {
                const now = new Date();
                const expiredOrders = orders.filter(o => {
                  if (!o.execution_date) return false;
                  return new Date(o.execution_date) < now;
                });
                if (expiredOrders.length === 0) {
                  toast.info('Ingen udløbne bestillinger');
                  return;
                }
                if (!confirm(`Fjern ${expiredOrders.length} udløbne bestillinger?`)) return;
                for (const order of expiredOrders) {
                  await fetch(`${API_URL}?action=cafe-delete-order`, {
                    method: 'POST',
                    headers: apiHeaders,
                    body: JSON.stringify({ id: order.id })
                  });
                }
                toast.success(`${expiredOrders.length} bestillinger fjernet`);
                fetchAll();
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Fjern udløbne bestillinger
            </Button>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-gray-500 text-center">Ingen bestillinger endnu</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Grupper bestillinger efter tilbud + dato */}
                {(() => {
                  // Grupper efter offer_name + execution_date
                  const groups: { [key: string]: CafeOrder[] } = {};
                  orders.forEach(order => {
                    const key = `${order.offer_name}|${order.execution_date}`;
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(order);
                  });
                  
                  // Sortér grupper efter dato
                  const sortedKeys = Object.keys(groups).sort((a, b) => {
                    const dateA = groups[a][0]?.execution_date || '';
                    const dateB = groups[b][0]?.execution_date || '';
                    return dateA.localeCompare(dateB);
                  });
                  
                  return sortedKeys.map(key => {
                    const groupOrders = groups[key];
                    const [offerName, execDate] = key.split('|');
                    const isExpanded = expandedGroups.has(key);
                    const activeCount = groupOrders.filter(o => o.status !== 'cancelled').length;
                    const totalQty = groupOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.quantity, 0);
                    const isExpired = execDate && new Date(execDate) < new Date();
                    
                    return (
                      <Card key={key} className={isExpired ? 'opacity-60' : ''}>
                        <CardHeader 
                          className="pb-2 cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            const newSet = new Set(expandedGroups);
                            if (isExpanded) newSet.delete(key);
                            else newSet.add(key);
                            setExpandedGroups(newSet);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                              <CardTitle className="text-base">{offerName}</CardTitle>
                              <Badge variant="outline">{execDate}</Badge>
                              {isExpired && <Badge variant="destructive">Udløbet</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{activeCount} best. • {totalQty} stk</span>
                              {/* Print total for dette tilbud */}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                title="Udskriv total"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const activeGroupOrders = groupOrders.filter(o => o.status !== 'cancelled');
                                  const totalQtyPrint = activeGroupOrders.reduce((sum, o) => sum + o.quantity, 0);
                                  const printContent = `
                                    <html>
                                    <head><title>${offerName} - Total</title>
                                    <style>body{font-family:Arial;padding:30px}h1{margin-bottom:10px}h2{color:#666;margin-bottom:20px}.total{font-size:48px;font-weight:bold;margin:30px 0}</style>
                                    </head>
                                    <body>
                                    <h1>${offerName}</h1>
                                    <h2>${execDate}</h2>
                                    <div class="total">${totalQtyPrint} stk</div>
                                    <p>${activeGroupOrders.length} bestillinger</p>
                                    </body></html>
                                  `;
                                  const win = window.open('', '_blank');
                                  win?.document.write(printContent);
                                  win?.document.close();
                                  win?.print();
                                }}
                              >
                                <Printer className="h-4 w-4 text-blue-500" />
                              </Button>
                              {/* Print pr bestiller for dette tilbud */}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                title="Udskriv pr. bestiller"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const activeGroupOrders = groupOrders.filter(o => o.status !== 'cancelled');
                                  const printContent = `
                                    <html>
                                    <head><title>${offerName} - Bestillinger</title>
                                    <style>body{font-family:Arial;padding:20px}h1{margin-bottom:5px}h2{color:#666;margin-bottom:20px}.order{border:1px solid #ccc;padding:15px;margin-bottom:10px;page-break-inside:avoid}.name{font-weight:bold;font-size:16px}.info{color:#666;margin:3px 0}</style>
                                    </head>
                                    <body>
                                    <h1>${offerName}</h1>
                                    <h2>${execDate} • ${activeGroupOrders.reduce((s,o)=>s+o.quantity,0)} stk total</h2>
                                    ${activeGroupOrders.map(o => `
                                      <div class="order">
                                        <div class="name">${o.guest_name}</div>
                                        <div class="info">📞 ${o.guest_phone || '-'} • Booking: ${o.booking_nummer}</div>
                                        <div class="info">${o.dining_option === 'eat_in' ? '🍽️ Spise i café' : '📦 Tag med'}</div>
                                        <div style="font-size:18px;margin-top:8px"><strong>${o.quantity}×</strong> = ${o.total} kr</div>
                                      </div>
                                    `).join('')}
                                    </body></html>
                                  `;
                                  const win = window.open('', '_blank');
                                  win?.document.write(printContent);
                                  win?.document.close();
                                  win?.print();
                                }}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              {/* Slet gruppe */}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                title="Slet alle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!confirm(`Slet alle ${groupOrders.length} bestillinger for "${offerName}"?`)) return;
                                  groupOrders.forEach(async order => {
                                    await fetch(`${API_URL}?action=cafe-delete-order`, {
                                      method: 'POST',
                                      headers: apiHeaders,
                                      body: JSON.stringify({ id: order.id })
                                    });
                                  });
                                  toast.success('Bestillinger slettet');
                                  fetchAll();
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {isExpanded && (
                          <CardContent className="space-y-2 pt-0">
                            {groupOrders.map(order => (
                              <div key={order.id} className={`p-3 rounded-lg border ${
                                order.status === 'cancelled' ? 'bg-gray-100 border-gray-200 opacity-50' : 'bg-white border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{order.order_number}</span>
                                    <Badge variant={order.status === 'cancelled' ? 'outline' : 'default'}>
                                      {order.status === 'cancelled' ? 'Annulleret' : 'Aktiv'}
                                    </Badge>
                                    <Badge variant="outline">
                                      {order.dining_option === 'eat_in' ? '🍽️' : '📦'}
                                    </Badge>
                                  </div>
                                  {order.status !== 'cancelled' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-red-600"
                                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                    >
                                      Annuller
                                    </Button>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <p><strong>{order.guest_name}</strong> • {order.guest_phone} • Booking: {order.booking_nummer}</p>
                                  <p>{order.quantity}× = <strong>{order.total} kr</strong></p>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        )}
                      </Card>
                    );
                  });
                })()}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCafe;
