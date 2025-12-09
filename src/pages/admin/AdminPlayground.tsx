import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, TreePine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// Edge function URL - TEST projekt
const API_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4';

const apiHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ANON_KEY}`
};

interface PlaygroundSettings {
  dinocar_title: string;
  dinocar_text_da: string;
  dinocar_text_en: string;
  dinocar_text_de: string;
  hoppepude_title: string;
  hoppepude_text_da: string;
  hoppepude_text_en: string;
  hoppepude_text_de: string;
  minigolf_title: string;
  minigolf_text_da: string;
  minigolf_text_en: string;
  minigolf_text_de: string;
  open_text_da: string;
  open_text_en: string;
  open_text_de: string;
}

const defaultSettings: PlaygroundSettings = {
  dinocar_title: 'Dino Cars',
  dinocar_text_da: '',
  dinocar_text_en: '',
  dinocar_text_de: '',
  hoppepude_title: 'Hoppepude',
  hoppepude_text_da: '',
  hoppepude_text_en: '',
  hoppepude_text_de: '',
  minigolf_title: 'Minigolf',
  minigolf_text_da: '',
  minigolf_text_en: '',
  minigolf_text_de: '',
  open_text_da: '',
  open_text_en: '',
  open_text_de: ''
};

const AdminPlayground = () => {
  const [settings, setSettings] = useState<PlaygroundSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}?action=get-facility-settings&facility=playground`, { headers: apiHeaders });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (error) {
      console.error('Error fetching playground settings:', error);
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
        body: JSON.stringify({ facility: 'playground', settings })
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

  const updateField = (field: keyof PlaygroundSettings, value: string) => {
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
              <TreePine className="h-6 w-6 text-green-600" />
              <h1 className="text-xl font-bold">Legeplads Administration</h1>
            </div>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Gemmer...' : 'Gem ændringer'}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Åbningstider tekst */}
        <Card>
          <CardHeader>
            <CardTitle>Åbningstider tekst</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="da">
              <TabsList>
                <TabsTrigger value="da">🇩🇰 Dansk</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
              </TabsList>
              <TabsContent value="da" className="mt-4">
                <Textarea value={settings.open_text_da} onChange={e => updateField('open_text_da', e.target.value)} rows={2} placeholder="Legepladsen er åben døgnet rundt..." />
              </TabsContent>
              <TabsContent value="en" className="mt-4">
                <Textarea value={settings.open_text_en} onChange={e => updateField('open_text_en', e.target.value)} rows={2} placeholder="The playground is open 24 hours..." />
              </TabsContent>
              <TabsContent value="de" className="mt-4">
                <Textarea value={settings.open_text_de} onChange={e => updateField('open_text_de', e.target.value)} rows={2} placeholder="Der Spielplatz ist rund um die Uhr geöffnet..." />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Dino Cars */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">🚗 Dino Cars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titel (alle sprog)</Label>
              <Input value={settings.dinocar_title} onChange={e => updateField('dinocar_title', e.target.value)} />
            </div>
            <Tabs defaultValue="da">
              <TabsList>
                <TabsTrigger value="da">🇩🇰 Dansk</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
              </TabsList>
              <TabsContent value="da" className="mt-4">
                <Textarea value={settings.dinocar_text_da} onChange={e => updateField('dinocar_text_da', e.target.value)} rows={3} />
              </TabsContent>
              <TabsContent value="en" className="mt-4">
                <Textarea value={settings.dinocar_text_en} onChange={e => updateField('dinocar_text_en', e.target.value)} rows={3} />
              </TabsContent>
              <TabsContent value="de" className="mt-4">
                <Textarea value={settings.dinocar_text_de} onChange={e => updateField('dinocar_text_de', e.target.value)} rows={3} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Hoppepude */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">🎈 Hoppepude</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titel (alle sprog)</Label>
              <Input value={settings.hoppepude_title} onChange={e => updateField('hoppepude_title', e.target.value)} />
            </div>
            <Tabs defaultValue="da">
              <TabsList>
                <TabsTrigger value="da">🇩🇰 Dansk</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
              </TabsList>
              <TabsContent value="da" className="mt-4">
                <Textarea value={settings.hoppepude_text_da} onChange={e => updateField('hoppepude_text_da', e.target.value)} rows={3} />
              </TabsContent>
              <TabsContent value="en" className="mt-4">
                <Textarea value={settings.hoppepude_text_en} onChange={e => updateField('hoppepude_text_en', e.target.value)} rows={3} />
              </TabsContent>
              <TabsContent value="de" className="mt-4">
                <Textarea value={settings.hoppepude_text_de} onChange={e => updateField('hoppepude_text_de', e.target.value)} rows={3} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Minigolf */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">⛳ Minigolf</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titel (alle sprog)</Label>
              <Input value={settings.minigolf_title} onChange={e => updateField('minigolf_title', e.target.value)} />
            </div>
            <Tabs defaultValue="da">
              <TabsList>
                <TabsTrigger value="da">🇩🇰 Dansk</TabsTrigger>
                <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
              </TabsList>
              <TabsContent value="da" className="mt-4">
                <Textarea value={settings.minigolf_text_da} onChange={e => updateField('minigolf_text_da', e.target.value)} rows={3} />
              </TabsContent>
              <TabsContent value="en" className="mt-4">
                <Textarea value={settings.minigolf_text_en} onChange={e => updateField('minigolf_text_en', e.target.value)} rows={3} />
              </TabsContent>
              <TabsContent value="de" className="mt-4">
                <Textarea value={settings.minigolf_text_de} onChange={e => updateField('minigolf_text_de', e.target.value)} rows={3} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminPlayground;
