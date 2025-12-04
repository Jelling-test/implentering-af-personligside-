import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, MapPin } from "lucide-react";

interface Spot {
  id: string;
  spot_number: string;
  spot_type: string | null;
  customer_type: string | null;
  map_x: number | null;
  map_y: number | null;
  map_locked: boolean;
  created_at: string;
}

const SPOT_TYPES = ["standard", "premium", "seasonal", "tent"];
const CUSTOMER_TYPES = ["camping", "seasonal", "permanent"];

const AdminPladser = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [formData, setFormData] = useState({
    spot_number: "",
    spot_type: "standard",
    customer_type: "",
  });

  useEffect(() => {
    fetchSpots();
  }, []);

  useEffect(() => {
    filterSpots();
  }, [spots, searchTerm]);

  const fetchSpots = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("map_spots")
        .select("*")
        .order("spot_number", { ascending: true });

      if (error) throw error;

      // Sort numerically where possible
      const sorted = (data || []).sort((a: Spot, b: Spot) => {
        const numA = parseInt(a.spot_number) || 0;
        const numB = parseInt(b.spot_number) || 0;
        if (numA !== 0 && numB !== 0) return numA - numB;
        return a.spot_number.localeCompare(b.spot_number);
      });

      setSpots(sorted);
    } catch (error) {
      console.error("Error fetching spots:", error);
      toast.error("Fejl ved hentning af pladser");
    } finally {
      setLoading(false);
    }
  };

  const filterSpots = () => {
    if (!searchTerm) {
      setFilteredSpots(spots);
      return;
    }

    const filtered = spots.filter(
      (s) =>
        s.spot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.spot_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customer_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSpots(filtered);
  };

  const handleAdd = () => {
    setFormData({
      spot_number: "",
      spot_type: "standard",
      customer_type: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (spot: Spot) => {
    setEditingSpot(spot);
    setFormData({
      spot_number: spot.spot_number,
      spot_type: spot.spot_type || "standard",
      customer_type: spot.customer_type || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = (spot: Spot) => {
    setEditingSpot(spot);
    setShowDeleteDialog(true);
  };

  const handleSaveNew = async () => {
    if (!formData.spot_number) {
      toast.error("Plads nummer er påkrævet");
      return;
    }

    try {
      const { error } = await (supabase as any).from("map_spots").insert({
        spot_number: formData.spot_number,
        spot_type: formData.spot_type || "standard",
        customer_type: formData.customer_type || null,
      });

      if (error) throw error;

      toast.success(`Plads ${formData.spot_number} oprettet`);
      setShowAddModal(false);
      fetchSpots();
    } catch (error: any) {
      console.error("Error creating spot:", error);
      if (error.code === "23505") {
        toast.error("Plads nummer findes allerede");
      } else {
        toast.error("Fejl ved oprettelse af plads");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSpot) return;

    try {
      const { error } = await (supabase as any)
        .from("map_spots")
        .update({
          spot_number: formData.spot_number,
          spot_type: formData.spot_type || "standard",
          customer_type: formData.customer_type || null,
        })
        .eq("id", editingSpot.id);

      if (error) throw error;

      toast.success(`Plads ${formData.spot_number} opdateret`);
      setShowEditModal(false);
      setEditingSpot(null);
      fetchSpots();
    } catch (error: any) {
      console.error("Error updating spot:", error);
      if (error.code === "23505") {
        toast.error("Plads nummer findes allerede");
      } else {
        toast.error("Fejl ved opdatering af plads");
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingSpot) return;

    try {
      const { error } = await (supabase as any)
        .from("map_spots")
        .delete()
        .eq("id", editingSpot.id);

      if (error) throw error;

      toast.success(`Plads ${editingSpot.spot_number} slettet`);
      setShowDeleteDialog(false);
      setEditingSpot(null);
      fetchSpots();
    } catch (error) {
      console.error("Error deleting spot:", error);
      toast.error("Fejl ved sletning af plads");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold">Pladser</h1>
                <p className="text-muted-foreground">
                  Administrer campingpladser
                </p>
              </div>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Tilføj plads
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total pladser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{spots.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Placeret på kort
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {spots.filter((s) => s.map_x !== null).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sæsonpladser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {spots.filter((s) => s.customer_type === "seasonal").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Faste pladser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {spots.filter((s) => s.customer_type === "permanent").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Søg efter plads nummer, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">
                  Indlæser...
                </p>
              ) : filteredSpots.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Ingen pladser fundet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plads nr.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Kundetype</TableHead>
                      <TableHead>På kort</TableHead>
                      <TableHead className="w-[100px]">Handlinger</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSpots.map((spot) => (
                      <TableRow key={spot.id}>
                        <TableCell className="font-medium">
                          {spot.spot_number}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {spot.spot_type || "standard"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {spot.customer_type ? (
                            <Badge variant="secondary">
                              {spot.customer_type}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {spot.map_x !== null ? (
                            <Badge className="bg-green-100 text-green-800">
                              <MapPin className="h-3 w-3 mr-1" />
                              Placeret
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Ikke placeret</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(spot)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(spot)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Add Modal */}
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tilføj ny plads</DialogTitle>
                <DialogDescription>
                  Opret en ny campingplads
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="spot_number">Plads nummer *</Label>
                  <Input
                    id="spot_number"
                    placeholder="f.eks. 101, 102..."
                    value={formData.spot_number}
                    onChange={(e) =>
                      setFormData({ ...formData, spot_number: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spot_type">Type</Label>
                  <Select
                    value={formData.spot_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, spot_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SPOT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_type">Kundetype</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, customer_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg kundetype..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen (almindelig)</SelectItem>
                      {CUSTOMER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Annuller
                </Button>
                <Button onClick={handleSaveNew}>Opret plads</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Modal */}
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rediger plads</DialogTitle>
                <DialogDescription>
                  Rediger plads {editingSpot?.spot_number}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_spot_number">Plads nummer *</Label>
                  <Input
                    id="edit_spot_number"
                    value={formData.spot_number}
                    onChange={(e) =>
                      setFormData({ ...formData, spot_number: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_spot_type">Type</Label>
                  <Select
                    value={formData.spot_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, spot_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SPOT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_customer_type">Kundetype</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, customer_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg kundetype..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen (almindelig)</SelectItem>
                      {CUSTOMER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Annuller
                </Button>
                <Button onClick={handleSaveEdit}>Gem ændringer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Slet plads?</AlertDialogTitle>
                <AlertDialogDescription>
                  Er du sikker på du vil slette plads {editingSpot?.spot_number}? 
                  Denne handling kan ikke fortrydes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuller</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Slet
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminPladser;
