import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Loader2, Image, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4';

// Default billeder
const DEFAULT_IMAGES = {
  power: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  events: 'https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=800&q=80',
  attractions: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  practical: 'https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=800&q=80',
  cabin: 'https://ljeszhbaqszgiyyrkxep.supabase.co/storage/v1/object/public/playground-images/hytten.png',
  pool: 'https://ljeszhbaqszgiyyrkxep.supabase.co/storage/v1/object/public/playground-images/friluftsbad.png',
  playground: 'https://ljeszhbaqszgiyyrkxep.supabase.co/storage/v1/object/public/playground-images/IMG_7740.jpg',
};

interface SectionImages {
  power?: string;
  bakery?: string;
  events?: string;
  attractions?: string;
  cafe?: string;
  practical?: string;
  cabin?: string;
  pool?: string;
  playground?: string;
}

const SECTION_LABELS: Record<string, string> = {
  power: 'Strøm',
  bakery: 'Bageri',
  events: 'Events',
  attractions: 'Attraktioner',
  cafe: 'Café',
  practical: 'Praktisk Info',
  cabin: 'Din Hytte',
  pool: 'Friluftsbad',
  playground: 'Legeplads',
};

const AdminDashboardImages = () => {
  const [images, setImages] = useState<SectionImages>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch(`${API_URL}?action=get-dashboard-images`, {
        headers: { 'Authorization': `Bearer ${ANON_KEY}` }
      });
      const data = await res.json();
      if (data.success && data.images) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}?action=save-dashboard-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Billeder gemt!');
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

  const handleImageChange = (key: string, value: string) => {
    setImages(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefault = (key: string) => {
    setImages(prev => ({ ...prev, [key]: DEFAULT_IMAGES[key as keyof typeof DEFAULT_IMAGES] }));
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/guest/welcome" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Billeder</h1>
                <p className="text-sm text-gray-500">Administrer billeder på forsiden</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Gem alle
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(DEFAULT_IMAGES).map((key) => {
            const imageUrl = images[key as keyof SectionImages] || DEFAULT_IMAGES[key as keyof typeof DEFAULT_IMAGES];
            return (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="h-4 w-4 text-teal-600" />
                    {SECTION_LABELS[key]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Preview */}
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={imageUrl} 
                      alt={SECTION_LABELS[key]}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Billede+ikke+fundet';
                      }}
                    />
                  </div>
                  
                  {/* URL input */}
                  <div>
                    <Label className="text-xs text-gray-500">Billede URL</Label>
                    <Input
                      value={images[key as keyof SectionImages] || ''}
                      onChange={(e) => handleImageChange(key, e.target.value)}
                      placeholder={DEFAULT_IMAGES[key as keyof typeof DEFAULT_IMAGES]}
                      className="text-sm"
                    />
                  </div>

                  {/* Reset button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => resetToDefault(key)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Nulstil til standard
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Du kan bruge billeder fra Supabase Storage bucket. 
              Upload billeder til <code className="bg-blue-100 px-1 rounded">playground-images</code> bucket 
              og brug URL'en her.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardImages;
