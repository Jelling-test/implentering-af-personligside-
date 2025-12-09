import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Edge function URL - TEST projekt
const API_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4';

const apiHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ANON_KEY}`
};

interface PoolSettings {
  title_da: string;
  title_en: string;
  title_de: string;
  subtitle_da: string;
  subtitle_en: string;
  subtitle_de: string;
  access_title_da: string;
  access_title_en: string;
  access_title_de: string;
  access_text_da: string;
  access_text_en: string;
  access_text_de: string;
  season_start: string;
  season_end: string;
  morning_swim_time: string;
  period1_dates: string;
  period1_weekdays: string;
  period1_weekend: string;
  period2_dates: string;
  period2_everyday: string;
  period3_dates: string;
  period3_weekdays: string;
  period3_weekend: string;
  closed_date: string;
  location_address: string;
  location_text_da: string;
  location_text_en: string;
  location_text_de: string;
  external_url: string;
}

const defaultSettings: PoolSettings = {
  title_da: 'Jelling Friluftsbad',
  title_en: 'Jelling Outdoor Pool',
  title_de: 'Jelling Freibad',
  subtitle_da: 'Fri adgang for alle gæster',
  subtitle_en: 'Free access for all guests',
  subtitle_de: 'Freier Eintritt für alle Gäste',
  access_title_da: 'Fri adgang som gæst',
  access_title_en: 'Free access as guest',
  access_title_de: 'Freier Eintritt als Gast',
  access_text_da: '',
  access_text_en: '',
  access_text_de: '',
  season_start: '2025-06-07',
  season_end: '2025-08-31',
  morning_swim_time: '06:00-08:30',
  period1_dates: '7. juni - 27. juni',
  period1_weekdays: '15:00-19:00',
  period1_weekend: '12:00-20:00',
  period2_dates: '28. juni - 10. august',
  period2_everyday: '11:00-21:00',
  period3_dates: '11. august - 31. august',
  period3_weekdays: '15:00-19:00',
  period3_weekend: '12:00-20:00',
  closed_date: '',
  location_address: '',
  location_text_da: '',
  location_text_en: '',
  location_text_de: '',
  external_url: ''
};

const AdminPool = () => {
  const [settings, setSettings] = useState<PoolSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}?action=get-facility-settings&facility=pool`, { headers: apiHeaders });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (error) {
      console.error('Error fetching pool settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}?action=save-facility-settings`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ facility: 'pool', settings })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Indstillinger gemt!');
      } else {
        toast.error('Kunne ikke gemme indstillinger');
      }
    } catch (error) {
      toast.error('Fejl ved gemning');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PoolSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
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
            <Link to="/admin/bakery" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Waves className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Friluftsbad Administration</h1>
            </div>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Gemmer...' : 'Gem ændringer'}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Adgang tekster */}
        <Card>
          <CardHeader>
            <CardTitle>Fri adgang sektion</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="da">
              <TabsList>
                <TabsTrigger value="da">🇩🇰 Dansk</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
              </TabsList>
              <TabsContent value="da" className="space-y-4 mt-4">
                <div>
                  <Label>Titel</Label>
                  <Input value={settings.access_title_da} onChange={e => updateField('access_title_da', e.target.value)} />
                </div>
                <div>
                  <Label>Tekst</Label>
                  <Textarea value={settings.access_text_da} onChange={e => updateField('access_text_da', e.target.value)} rows={3} />
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input value={settings.access_title_en} onChange={e => updateField('access_title_en', e.target.value)} />
                </div>
                <div>
                  <Label>Text</Label>
                  <Textarea value={settings.access_text_en} onChange={e => updateField('access_text_en', e.target.value)} rows={3} />
                </div>
              </TabsContent>
              <TabsContent value="de" className="space-y-4 mt-4">
                <div>
                  <Label>Titel</Label>
                  <Input value={settings.access_title_de} onChange={e => updateField('access_title_de', e.target.value)} />
                </div>
                <div>
                  <Label>Text</Label>
                  <Textarea value={settings.access_text_de} onChange={e => updateField('access_text_de', e.target.value)} rows={3} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Åbningstider */}
        <Card>
          <CardHeader>
            <CardTitle>Åbningstider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sæson start</Label>
                <Input type="date" value={settings.season_start} onChange={e => updateField('season_start', e.target.value)} />
              </div>
              <div>
                <Label>Sæson slut</Label>
                <Input type="date" value={settings.season_end} onChange={e => updateField('season_end', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Morgensvømning tid</Label>
              <Input value={settings.morning_swim_time} onChange={e => updateField('morning_swim_time', e.target.value)} placeholder="06:00-08:30" />
            </div>
            <hr />
            <h4 className="font-medium">Periode 1 - Lavsæson (start)</h4>
            <div>
              <Label>Datoer</Label>
              <Input value={settings.period1_dates} onChange={e => updateField('period1_dates', e.target.value)} placeholder="7. juni - 27. juni" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hverdage</Label>
                <Input value={settings.period1_weekdays} onChange={e => updateField('period1_weekdays', e.target.value)} placeholder="15:00-19:00" />
              </div>
              <div>
                <Label>Weekend</Label>
                <Input value={settings.period1_weekend} onChange={e => updateField('period1_weekend', e.target.value)} placeholder="12:00-20:00" />
              </div>
            </div>
            <hr />
            <h4 className="font-medium">Periode 2 - Højsæson</h4>
            <div>
              <Label>Datoer</Label>
              <Input value={settings.period2_dates} onChange={e => updateField('period2_dates', e.target.value)} placeholder="28. juni - 10. august" />
            </div>
            <div>
              <Label>Alle dage</Label>
              <Input value={settings.period2_everyday} onChange={e => updateField('period2_everyday', e.target.value)} placeholder="11:00-21:00" />
            </div>
            <hr />
            <h4 className="font-medium">Periode 3 - Lavsæson (slut)</h4>
            <div>
              <Label>Datoer</Label>
              <Input value={settings.period3_dates} onChange={e => updateField('period3_dates', e.target.value)} placeholder="11. august - 31. august" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hverdage</Label>
                <Input value={settings.period3_weekdays} onChange={e => updateField('period3_weekdays', e.target.value)} placeholder="15:00-19:00" />
              </div>
              <div>
                <Label>Weekend</Label>
                <Input value={settings.period3_weekend} onChange={e => updateField('period3_weekend', e.target.value)} placeholder="12:00-20:00" />
              </div>
            </div>
            <hr />
            <div>
              <Label>Lukket dato (valgfri)</Label>
              <Input type="date" value={settings.closed_date} onChange={e => updateField('closed_date', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Placering */}
        <Card>
          <CardHeader>
            <CardTitle>Placering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Adresse</Label>
              <Input value={settings.location_address} onChange={e => updateField('location_address', e.target.value)} />
            </div>
            <div>
              <Label>Ekstern URL (vejle.dk)</Label>
              <Input value={settings.external_url} onChange={e => updateField('external_url', e.target.value)} />
            </div>
            <Tabs defaultValue="da">
              <TabsList>
                <TabsTrigger value="da">🇩🇰 Dansk</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
              </TabsList>
              <TabsContent value="da" className="mt-4">
                <Label>Beskrivelse</Label>
                <Textarea value={settings.location_text_da} onChange={e => updateField('location_text_da', e.target.value)} rows={2} />
              </TabsContent>
              <TabsContent value="en" className="mt-4">
                <Label>Description</Label>
                <Textarea value={settings.location_text_en} onChange={e => updateField('location_text_en', e.target.value)} rows={2} />
              </TabsContent>
              <TabsContent value="de" className="mt-4">
                <Label>Beschreibung</Label>
                <Textarea value={settings.location_text_de} onChange={e => updateField('location_text_de', e.target.value)} rows={2} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminPool;
