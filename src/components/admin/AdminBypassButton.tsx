import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

interface AdminBypassButtonProps {
  meterId: string;
  hasBypass: boolean;
  onUpdate?: () => void;
}

export function AdminBypassButton({ meterId, hasBypass, onUpdate }: AdminBypassButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleBypass = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Du skal være logget ind');
        return;
      }

      const action = hasBypass ? 'disable' : 'enable';
      
      const response = await supabase.functions.invoke('admin-bypass-meter', {
        body: {
          meter_id: meterId,
          action,
          reason: reason || (hasBypass ? 'Bypass deaktiveret' : 'Admin bypass aktiveret')
        }
      });

      if (response.error) throw response.error;

      toast.success(hasBypass 
        ? `Bypass deaktiveret for ${meterId}` 
        : `Bypass aktiveret for ${meterId}`
      );
      
      setOpen(false);
      setReason('');
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling bypass:', error);
      toast.error('Kunne ikke ændre bypass');
    } finally {
      setLoading(false);
    }
  };

  if (hasBypass) {
    // Simpel knap til at deaktivere
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleBypass}
        disabled={loading}
        className="text-amber-600 border-amber-300 hover:bg-amber-50"
      >
        <ShieldOff className="h-4 w-4 mr-2" />
        Fjern Admin Bypass
      </Button>
    );
  }

  // Dialog til at aktivere med grund
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-amber-600 border-amber-300 hover:bg-amber-50"
        >
          <Shield className="h-4 w-4 mr-2" />
          Aktiver Admin Bypass
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Aktiver Admin Bypass
          </DialogTitle>
          <DialogDescription>
            Dette tillader måler <strong>{meterId}</strong> at være tændt uden kunde eller pakke.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Grund (valgfrit)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="F.eks. Test af måler, Reparation..."
            />
          </div>
          <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md">
            <strong>OBS:</strong> Bypass udløber ikke automatisk. Husk at deaktivere når det ikke længere er nødvendigt.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuller
          </Button>
          <Button onClick={handleToggleBypass} disabled={loading}>
            {loading ? 'Aktiverer...' : 'Aktiver Bypass'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
