import { useEffect, useState } from 'react';

// Edge function URL og auth - TEST projekt
const API_URL = 'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-api';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZXN6aGJhcXN6Z2l5eXJreGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MjY4NzIsImV4cCI6MjA4MDUwMjg3Mn0.t3QXUuOT7QAK3byOR1Ygujgdo5QyY4UAPDu1UxQnAe4';

const apiHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ANON_KEY}`
};
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Pencil, Trash2, Clock, Loader2, X, Check, 
  Settings, Package, ShoppingBasket, BarChart3,
  Printer, Download, GripVertical, Image as ImageIcon,
  Calendar, AlertCircle, CheckCircle2, Mail
} from 'lucide-react';
import { toast } from 'sonner';

// ==================== INTERFACES ====================

interface BakerySettings {
  order_open_time: string;
  order_close_time: string;
  pickup_start_time: string;
  pickup_end_time: string;
  is_closed: boolean;
  closed_until: string | null;
  closed_message_da: string;
  closed_message_en: string;
  closed_message_de: string;
  notification_email: string;
  pickup_location_da: string;
  pickup_location_en: string;
  pickup_location_de: string;
}

interface BakeryProduct {
  id: string;
  ref_id: string;
  sort_order: number;
  is_active: boolean;
  name_da: string;
  name_en: string;
  name_de: string;
  description_da: string;
  description_en: string;
  description_de: string;
  price: number;
  max_per_order: number;
  image_url: string;
}

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface BakeryOrder {
  id: string;
  ref_id: string;
  booking_id: number;
  booking_nummer: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  pickup_date: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'cancelled' | 'collected';
  created_at: string;
  cancelled_at?: string;
}

const defaultSettings: BakerySettings = {
  order_open_time: '10:00',
  order_close_time: '22:00',
  pickup_start_time: '08:00',
  pickup_end_time: '10:00',
  is_closed: false,
  closed_until: null,
  closed_message_da: 'Bageriet er midlertidigt lukket',
  closed_message_en: 'The bakery is temporarily closed',
  closed_message_de: 'Die Bäckerei ist vorübergehend geschlossen',
  notification_email: 'reception@jellingcamping.dk',
  pickup_location_da: 'Receptionen',
  pickup_location_en: 'The reception',
  pickup_location_de: 'Die Rezeption',
};

const emptyProduct: Omit<BakeryProduct, 'id' | 'ref_id'> = {
  sort_order: 99,
  is_active: true,
  name_da: '',
  name_en: '',
  name_de: '',
  description_da: '',
  description_en: '',
  description_de: '',
  price: 0,
  max_per_order: 10,
  image_url: '',
};

// ==================== MAIN COMPONENT ====================

const AdminBakery = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data
  const [settings, setSettings] = useState<BakerySettings>(defaultSettings);
  const [products, setProducts] = useState<BakeryProduct[]>([]);
  const [orders, setOrders] = useState<BakeryOrder[]>([]);
  
  // Edit states
  const [editingProduct, setEditingProduct] = useState<Partial<BakeryProduct> | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
  // Filter
  const [selectedDate, setSelectedDate] = useState(getTomorrowDate());

  // ==================== DATA FETCHING (via Edge Function) ====================

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchSettings(), fetchProducts(), fetchOrders()]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}?action=get-settings`, { headers: apiHeaders });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (err) {
      console.error('Fejl ved hentning af indstillinger:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}?action=admin-get-products`, { headers: apiHeaders });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Fejl ved hentning af produkter:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}?action=admin-get-orders`, { headers: apiHeaders });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Fejl ved hentning af ordrer:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ==================== SETTINGS HANDLERS ====================

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}?action=admin-save-settings`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Indstillinger gemt');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Fejl ved gemning:', err);
      toast.error('Kunne ikke gemme indstillinger');
    } finally {
      setSaving(false);
    }
  };

  // ==================== PRODUCT HANDLERS ====================

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    
    setSaving(true);
    try {
      const productData = {
        id: isCreatingProduct ? undefined : editingProduct.id,
        sort_order: editingProduct.sort_order || 99,
        is_active: editingProduct.is_active ?? true,
        name_da: editingProduct.name_da || '',
        name_en: editingProduct.name_en || '',
        name_de: editingProduct.name_de || '',
        description_da: editingProduct.description_da || '',
        description_en: editingProduct.description_en || '',
        description_de: editingProduct.description_de || '',
        price: editingProduct.price || 0,
        max_per_order: editingProduct.max_per_order || 10,
        image_url: editingProduct.image_url || '',
      };

      const res = await fetch(`${API_URL}?action=admin-save-product`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(productData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isCreatingProduct ? 'Produkt oprettet' : 'Produkt opdateret');
        await fetchProducts();
        setEditingProduct(null);
        setIsCreatingProduct(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Fejl ved gemning:', err);
      toast.error('Kunne ikke gemme produkt');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette produkt?')) return;
    
    try {
      const res = await fetch(`${API_URL}?action=admin-delete-product`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ id })
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Produkt slettet');
        await fetchProducts();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Fejl ved sletning:', err);
      toast.error('Kunne ikke slette produkt');
    }
  };

  // ==================== ORDER HANDLERS ====================

  const handleUpdateOrderStatus = async (orderId: string, status: 'pending' | 'cancelled' | 'collected') => {
    try {
      const res = await fetch(`${API_URL}?action=admin-update-order`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ id: orderId, status })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(status === 'collected' ? 'Markeret som afhentet' : status === 'cancelled' ? 'Ordre annulleret' : 'Status opdateret');
        await fetchOrders();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Fejl ved opdatering:', err);
      toast.error('Kunne ikke opdatere status');
    }
  };

  // ==================== HELPERS ====================

  function getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  const filteredOrders = orders.filter(o => o.pickup_date === selectedDate);
  
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
  const collectedOrders = filteredOrders.filter(o => o.status === 'collected');
  const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');

  // Aggregate items for baking list
  const bakingList = pendingOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.name]) {
        acc[item.name] = 0;
      }
      acc[item.name] += item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  // ==================== EXPORT CSV ====================

  const exportCSV = () => {
    const headers = ['Booking', 'Navn', 'Email', 'Telefon', 'Varer', 'Total', 'Status', 'Oprettet'];
    const rows = filteredOrders.map(o => [
      o.booking_nummer,
      o.guest_name,
      o.guest_email,
      o.guest_phone,
      o.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
      o.total + ' kr',
      o.status,
      new Date(o.created_at).toLocaleString('da-DK')
    ]);

    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bageri-bestillinger-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==================== PRINT FUNCTIONS ====================

  const printBakingList = () => {
    const content = `
      <html>
      <head>
        <title>Bage-liste ${selectedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background: #f5f5f5; }
          .total { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <h1>🥐 Bage-liste til ${new Date(selectedDate).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
        <table>
          <thead>
            <tr><th>Produkt</th><th>Antal</th></tr>
          </thead>
          <tbody>
            ${Object.entries(bakingList).map(([name, qty]) => `
              <tr><td>${name}</td><td class="total">${qty}</td></tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666;">Udskrevet: ${new Date().toLocaleString('da-DK')}</p>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(content);
    win?.document.close();
    win?.print();
  };

  const printCustomerList = () => {
    const content = `
      <html>
      <head>
        <title>Kundeliste ${selectedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { margin-bottom: 20px; }
          .order { border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .booking { font-weight: bold; font-size: 16px; }
          .items { margin-left: 20px; }
          .status { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
          .pending { background: #fef3c7; color: #92400e; }
          .collected { background: #d1fae5; color: #065f46; }
        </style>
      </head>
      <body>
        <h1>📋 Kundeliste til ${new Date(selectedDate).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
        ${pendingOrders.map(o => `
          <div class="order">
            <div class="header">
              <span class="booking">Booking #${o.booking_nummer} - ${o.guest_name}</span>
              <span class="status pending">Afventer</span>
            </div>
            <div class="items">
              ${o.items.map(i => `<div>• ${i.quantity}x ${i.name} (${i.quantity * i.price} kr)</div>`).join('')}
            </div>
            <div style="margin-top: 10px; font-weight: bold;">Total: ${o.total} kr</div>
          </div>
        `).join('')}
        <p style="margin-top: 20px; color: #666;">Udskrevet: ${new Date().toLocaleString('da-DK')}</p>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(content);
    win?.document.close();
    win?.print();
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🥐 Bageri Administration</h1>
        <p className="text-gray-500">Administrer produkter, bestillinger og indstillinger</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingBasket className="h-4 w-4" />
            Bestillinger
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Produkter
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Indstillinger
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistik
          </TabsTrigger>
        </TabsList>

        {/* ==================== ORDERS TAB ==================== */}
        <TabsContent value="orders" className="space-y-6">
          {/* Date selector and actions */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-44"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(getTodayDate())}>
                  I dag
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(getTomorrowDate())}>
                  I morgen
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={printBakingList} disabled={pendingOrders.length === 0}>
                <Printer className="h-4 w-4 mr-2" />
                Print bage-liste
              </Button>
              <Button variant="outline" onClick={printCustomerList} disabled={pendingOrders.length === 0}>
                <Printer className="h-4 w-4 mr-2" />
                Print kundeliste
              </Button>
              <Button variant="outline" onClick={exportCSV} disabled={filteredOrders.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-amber-600">{pendingOrders.length}</div>
                <p className="text-sm text-gray-500">Afventer afhentning</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{collectedOrders.length}</div>
                <p className="text-sm text-gray-500">Afhentet</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{cancelledOrders.length}</div>
                <p className="text-sm text-gray-500">Annulleret</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-teal-600">
                  {pendingOrders.reduce((sum, o) => sum + o.total, 0)} kr
                </div>
                <p className="text-sm text-gray-500">Forventet omsætning</p>
              </CardContent>
            </Card>
          </div>

          {/* Baking summary */}
          {Object.keys(bakingList).length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  🥖 Bage-oversigt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(bakingList).map(([name, qty]) => (
                    <Badge key={name} variant="secondary" className="text-base py-1 px-3">
                      {qty}x {name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders list */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <ShoppingBasket className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Ingen bestillinger til denne dato</p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className={order.status === 'cancelled' ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold">#{order.booking_nummer}</span>
                          <span className="font-semibold">{order.guest_name}</span>
                          <Badge variant={
                            order.status === 'collected' ? 'default' :
                            order.status === 'cancelled' ? 'destructive' : 'secondary'
                          }>
                            {order.status === 'pending' ? 'Afventer' :
                             order.status === 'collected' ? 'Afhentet' : 'Annulleret'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {order.guest_email} • {order.guest_phone}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, i) => (
                            <span key={i} className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-teal-600 mb-2">{order.total} kr</div>
                        {order.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateOrderStatus(order.id, 'collected')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Afhentet
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Annuller
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ==================== PRODUCTS TAB ==================== */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Produkter ({products.length})</h2>
            <Button onClick={() => { setEditingProduct(emptyProduct); setIsCreatingProduct(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tilføj produkt
            </Button>
          </div>

          {/* Product edit modal */}
          {editingProduct && (
            <Card className="border-teal-200 bg-teal-50">
              <CardHeader>
                <CardTitle>{isCreatingProduct ? 'Nyt produkt' : 'Rediger produkt'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Navn (dansk)</Label>
                    <Input
                      value={editingProduct.name_da || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name_da: e.target.value })}
                      placeholder="Rundstykker"
                    />
                  </div>
                  <div>
                    <Label>Navn (engelsk)</Label>
                    <Input
                      value={editingProduct.name_en || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                      placeholder="Bread rolls"
                    />
                  </div>
                  <div>
                    <Label>Navn (tysk)</Label>
                    <Input
                      value={editingProduct.name_de || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name_de: e.target.value })}
                      placeholder="Brötchen"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Beskrivelse (dansk)</Label>
                    <Textarea
                      value={editingProduct.description_da || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description_da: e.target.value })}
                      placeholder="Friske morgenbrød"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Beskrivelse (engelsk)</Label>
                    <Textarea
                      value={editingProduct.description_en || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                      placeholder="Fresh morning rolls"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Beskrivelse (tysk)</Label>
                    <Textarea
                      value={editingProduct.description_de || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description_de: e.target.value })}
                      placeholder="Frische Morgenbrötchen"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Pris (DKK)</Label>
                    <Input
                      type="number"
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Max pr. ordre</Label>
                    <Input
                      type="number"
                      value={editingProduct.max_per_order || 10}
                      onChange={(e) => setEditingProduct({ ...editingProduct, max_per_order: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                  <div>
                    <Label>Sortering</Label>
                    <Input
                      type="number"
                      value={editingProduct.sort_order || 99}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sort_order: parseInt(e.target.value) || 99 })}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingProduct.is_active ?? true}
                        onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_active: checked })}
                      />
                      <Label>Aktiv</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Billede</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editingProduct.image_url || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                      placeholder="URL eller upload billede..."
                      className="flex-1"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            toast.info('Uploader billede...');
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            const res = await fetch(`${API_URL}?action=upload-image`, {
                              method: 'POST',
                              body: formData
                            });
                            const data = await res.json();
                            
                            if (data.success) {
                              setEditingProduct({ ...editingProduct, image_url: data.url });
                              toast.success('Billede uploadet!');
                            } else {
                              toast.error(data.error || 'Upload fejlede');
                            }
                          } catch (err) {
                            toast.error('Fejl ved upload');
                          }
                        }}
                      />
                      <Button type="button" variant="outline">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                  {editingProduct.image_url && (
                    <img 
                      src={editingProduct.image_url} 
                      alt="Preview" 
                      className="mt-2 h-24 w-36 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProduct} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Gem
                  </Button>
                  <Button variant="outline" onClick={() => { setEditingProduct(null); setIsCreatingProduct(false); }}>
                    <X className="h-4 w-4 mr-2" />
                    Annuller
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products list */}
          <div className="space-y-3">
            {products.map((product) => (
              <Card key={product.id} className={!product.is_active ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-gray-300 cursor-grab" />
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name_da} className="h-16 w-24 object-cover rounded-lg" />
                    ) : (
                      <div className="h-16 w-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{product.name_da}</span>
                        {!product.is_active && <Badge variant="secondary">Inaktiv</Badge>}
                      </div>
                      <p className="text-sm text-gray-500">{product.description_da}</p>
                      <p className="text-sm text-gray-400">
                        EN: {product.name_en} • DE: {product.name_de}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-teal-600">{product.price} kr</div>
                      <p className="text-xs text-gray-400">Max {product.max_per_order} pr. ordre</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => { setEditingProduct(product); setIsCreatingProduct(false); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ==================== SETTINGS TAB ==================== */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Åbningstider
              </CardTitle>
              <CardDescription>Hvornår kan gæster bestille?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Bestilling åbner</Label>
                  <Input
                    type="time"
                    value={settings.order_open_time}
                    onChange={(e) => setSettings({ ...settings, order_open_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Bestilling lukker</Label>
                  <Input
                    type="time"
                    value={settings.order_close_time}
                    onChange={(e) => setSettings({ ...settings, order_close_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Afhentning fra</Label>
                  <Input
                    type="time"
                    value={settings.pickup_start_time}
                    onChange={(e) => setSettings({ ...settings, pickup_start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Afhentning til</Label>
                  <Input
                    type="time"
                    value={settings.pickup_end_time}
                    onChange={(e) => setSettings({ ...settings, pickup_end_time: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Lukket
              </CardTitle>
              <CardDescription>Midlertidig lukning af bageriet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Switch
                  checked={settings.is_closed}
                  onCheckedChange={(checked) => setSettings({ ...settings, is_closed: checked })}
                />
                <Label>Bageri er lukket</Label>
              </div>
              {settings.is_closed && (
                <>
                  <div>
                    <Label>Åbner igen (valgfrit)</Label>
                    <Input
                      type="date"
                      value={settings.closed_until || ''}
                      onChange={(e) => setSettings({ ...settings, closed_until: e.target.value || null })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Lukke-besked (dansk)</Label>
                      <Textarea
                        value={settings.closed_message_da}
                        onChange={(e) => setSettings({ ...settings, closed_message_da: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Lukke-besked (engelsk)</Label>
                      <Textarea
                        value={settings.closed_message_en}
                        onChange={(e) => setSettings({ ...settings, closed_message_en: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Lukke-besked (tysk)</Label>
                      <Textarea
                        value={settings.closed_message_de}
                        onChange={(e) => setSettings({ ...settings, closed_message_de: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notifikationer
              </CardTitle>
              <CardDescription>Email sendes 10 min efter lukketid med oversigt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email til daglig oversigt</Label>
                <Input
                  type="email"
                  value={settings.notification_email}
                  onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                  placeholder="reception@jellingcamping.dk"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    toast.info('Sender test email...');
                    const res = await fetch(
                      'https://ljeszhbaqszgiyyrkxep.supabase.co/functions/v1/bakery-daily-summary',
                      { method: 'POST' }
                    );
                    const data = await res.json();
                    if (data.success) {
                      toast.success(`Email genereret! ${data.orders_count} ordrer fundet.`);
                    } else {
                      toast.error(data.error || 'Kunne ikke sende email');
                    }
                  } catch (err) {
                    toast.error('Fejl ved afsendelse');
                  }
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Test daglig email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Afhentningssted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Sted (dansk)</Label>
                  <Input
                    value={settings.pickup_location_da}
                    onChange={(e) => setSettings({ ...settings, pickup_location_da: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Sted (engelsk)</Label>
                  <Input
                    value={settings.pickup_location_en}
                    onChange={(e) => setSettings({ ...settings, pickup_location_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Sted (tysk)</Label>
                  <Input
                    value={settings.pickup_location_de}
                    onChange={(e) => setSettings({ ...settings, pickup_location_de: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveSettings} disabled={saving} className="w-full md:w-auto">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Gem indstillinger
          </Button>
        </TabsContent>

        {/* ==================== STATS TAB ==================== */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistik (seneste 18 måneder)</CardTitle>
              <CardDescription>Oversigt over salg og populære produkter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-teal-50 rounded-lg">
                  <div className="text-3xl font-bold text-teal-600">{orders.length}</div>
                  <p className="text-gray-500">Totale ordrer</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'collected').reduce((sum, o) => sum + o.total, 0)} kr
                  </div>
                  <p className="text-gray-500">Total omsætning</p>
                </div>
                <div className="text-center p-6 bg-amber-50 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">
                    {orders.length > 0 
                      ? Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length) 
                      : 0} kr
                  </div>
                  <p className="text-gray-500">Gns. ordreværdi</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-4">Populære produkter</h3>
                {/* TODO: Implement product popularity chart */}
                <p className="text-gray-500 text-center py-8">
                  Kommer snart: Graf over populære produkter
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBakery;
