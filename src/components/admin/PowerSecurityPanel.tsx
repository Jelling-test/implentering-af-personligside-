import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, ShieldOff, Power, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { toast } from 'sonner';

interface AdminBypassMeter {
  meter_number: string;
  admin_bypass_at: string;
  admin_bypass_reason: string;
  admin_bypass_by: string;
}

interface UnauthorizedAttempt {
  id: string;
  meter_number: string;
  detected_at: string;
  action_taken: string;
  had_customer: boolean;
  had_package: boolean;
  details: {
    reason: string;
    base_topic?: string;
    power?: number;
  };
}

export function PowerSecurityPanel() {
  const [bypassMeters, setBypassMeters] = useState<AdminBypassMeter[]>([]);
  const [unauthorizedAttempts, setUnauthorizedAttempts] = useState<UnauthorizedAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Hent målere med admin bypass
      const { data: bypassData, error: bypassError } = await supabase
        .from('power_meters')
        .select('meter_number, admin_bypass_at, admin_bypass_reason, admin_bypass_by')
        .eq('admin_bypass', true)
        .order('admin_bypass_at', { ascending: false });

      if (bypassError) throw bypassError;
      setBypassMeters(bypassData || []);

      // Hent seneste uautoriserede forsøg
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('unauthorized_power_attempts')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);

      if (attemptsError) throw attemptsError;
      setUnauthorizedAttempts(attemptsData || []);

    } catch (error) {
      console.error('Error fetching power security data:', error);
      toast.error('Kunne ikke hente sikkerhedsdata');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time subscription for unauthorized attempts
    const channel = supabase
      .channel('power-security')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'unauthorized_power_attempts'
      }, (payload) => {
        setUnauthorizedAttempts(prev => [payload.new as UnauthorizedAttempt, ...prev.slice(0, 9)]);
        toast.warning(`🚨 Uautoriseret tænding: ${(payload.new as UnauthorizedAttempt).meter_number}`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRemoveBypass = async (meterId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Du skal være logget ind');
        return;
      }

      const response = await supabase.functions.invoke('admin-bypass-meter', {
        body: {
          meter_id: meterId,
          action: 'disable',
          reason: 'Bypass fjernet fra dashboard'
        }
      });

      if (response.error) throw response.error;

      toast.success(`Bypass fjernet for ${meterId}`);
      fetchData();
    } catch (error) {
      console.error('Error removing bypass:', error);
      toast.error('Kunne ikke fjerne bypass');
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'no_customer': return 'Ingen kunde';
      case 'no_active_package': return 'Ingen aktiv pakke';
      case 'package_depleted': return 'Pakke opbrugt';
      default: return reason;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Admin Bypass Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Admin Bypass Målere
          </CardTitle>
          <Badge variant="outline">{bypassMeters.length}</Badge>
        </CardHeader>
        <CardContent>
          {bypassMeters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Ingen målere med admin bypass
            </p>
          ) : (
            <div className="space-y-2">
              {bypassMeters.map((meter) => (
                <div
                  key={meter.meter_number}
                  className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800"
                >
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <Power className="h-4 w-4 text-green-500" />
                      {meter.meter_number}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {meter.admin_bypass_reason}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {meter.admin_bypass_at && format(new Date(meter.admin_bypass_at), 'dd/MM HH:mm', { locale: da })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBypass(meter.meter_number)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <ShieldOff className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unauthorized Attempts Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Uautoriserede Forsøg
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {unauthorizedAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Ingen uautoriserede forsøg registreret
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {unauthorizedAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <Power className="h-4 w-4 text-red-500" />
                      {attempt.meter_number}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getReasonLabel(attempt.details?.reason || 'Ukendt')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(attempt.detected_at), 'dd/MM HH:mm:ss', { locale: da })}
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Slukket
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
