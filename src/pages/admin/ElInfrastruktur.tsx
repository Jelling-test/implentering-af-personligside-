import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  Zap,
  CircuitBoard,
  Cable,
  Shield,
  Link2,
  Search,
  ArrowRight,
  MapPin,
} from "lucide-react";

// ============ TYPER ============

interface MainBoard {
  id: string;
  name: string;
  description: string | null;
  map_x: number | null;
  map_y: number | null;
  map_locked: boolean;
  color: string;
  created_at: string;
  distribution_boards_count?: number;
}

interface DistributionBoard {
  id: string;
  main_board_id: string | null;
  name: string;
  board_number: number | null;
  location: string | null;
  map_x: number | null;
  map_y: number | null;
  map_locked: boolean;
  color: string;
  created_at: string;
  main_board_name?: string;
  fuse_groups_count?: number;
}

interface FuseGroup {
  id: string;
  board_id: string;
  group_number: number;
  name: string | null;
  fuse_rating: string | null;
  description: string | null;
  created_at: string;
  board_name?: string;
  stands_count?: number;
}

interface BoardConnection {
  id: string;
  from_board_id: string;
  to_board_id: string;
  connection_type: string;
  color: string;
  from_board_name?: string;
  to_board_name?: string;
}

interface Meter {
  id: string;
  meter_number: string;
  is_online: boolean;
  stand_id: string | null;
}

interface Stand {
  id: string;
  name: string;
  fuse_group_id: string | null;
  meters: Meter[];
}

interface PowerPath {
  meter: Meter | null;
  stand: Stand | null;
  fuseGroup: FuseGroup | null;
  distBoard: DistributionBoard | null;
  mainBoard: MainBoard | null;
}

// Farvepalette (uden grøn)
const COLOR_PALETTE = [
  { name: "Blå", value: "#3B82F6" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Rød", value: "#EF4444" },
  { name: "Lilla", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Gul", value: "#EAB308" },
];

const ElInfrastruktur = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hovedtavler");
  
  // Data
  const [mainBoards, setMainBoards] = useState<MainBoard[]>([]);
  const [distributionBoards, setDistributionBoards] = useState<DistributionBoard[]>([]);
  const [fuseGroups, setFuseGroups] = useState<FuseGroup[]>([]);
  const [boardConnections, setBoardConnections] = useState<BoardConnection[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [stands, setStands] = useState<Stand[]>([]);
  
  // Strømsti søgning
  const [selectedMeter, setSelectedMeter] = useState<string>("");
  const [powerPath, setPowerPath] = useState<PowerPath | null>(null);
  
  // Dialog states
  const [mainBoardDialogOpen, setMainBoardDialogOpen] = useState(false);
  const [distBoardDialogOpen, setDistBoardDialogOpen] = useState(false);
  const [fuseGroupDialogOpen, setFuseGroupDialogOpen] = useState(false);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  
  // Edit states
  const [editingMainBoard, setEditingMainBoard] = useState<MainBoard | null>(null);
  const [editingDistBoard, setEditingDistBoard] = useState<DistributionBoard | null>(null);
  const [editingFuseGroup, setEditingFuseGroup] = useState<FuseGroup | null>(null);
  
  // Form states
  const [mainBoardForm, setMainBoardForm] = useState({ name: "", description: "", color: "#3B82F6" });
  const [distBoardForm, setDistBoardForm] = useState({ name: "", board_number: "", main_board_id: "", location: "", color: "#F59E0B" });
  const [fuseGroupForm, setFuseGroupForm] = useState({ board_id: "", group_number: "", name: "", fuse_rating: "", description: "" });
  const [connectionForm, setConnectionForm] = useState({ from_board_id: "", to_board_id: "", color: "#666666" });
  
  // Filter for sikringsgrupper
  const [selectedBoardFilter, setSelectedBoardFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Hent hovedtavler
      const { data: mainBoardsData, error: mainError } = await (supabase as any)
        .from("main_boards")
        .select("*")
        .order("name");
      if (mainError) throw mainError;

      // Hent undertavler
      const { data: distBoardsData, error: distError } = await (supabase as any)
        .from("distribution_boards")
        .select("*")
        .order("board_number");
      if (distError) throw distError;

      // Hent sikringsgrupper
      const { data: fuseGroupsData, error: fuseError } = await (supabase as any)
        .from("fuse_groups")
        .select("*")
        .order("group_number");
      if (fuseError) throw fuseError;

      // Hent standere for at tælle
      const { data: standsData } = await (supabase as any)
        .from("power_stands")
        .select("id, fuse_group_id");

      // Berig data med counts
      const mainBoardsWithCounts = (mainBoardsData || []).map((mb: MainBoard) => ({
        ...mb,
        distribution_boards_count: (distBoardsData || []).filter((db: DistributionBoard) => db.main_board_id === mb.id).length
      }));

      const distBoardsWithCounts = (distBoardsData || []).map((db: DistributionBoard) => {
        const mainBoard = (mainBoardsData || []).find((mb: MainBoard) => mb.id === db.main_board_id);
        return {
          ...db,
          main_board_name: mainBoard?.name || "Ikke tilknyttet",
          fuse_groups_count: (fuseGroupsData || []).filter((fg: FuseGroup) => fg.board_id === db.id).length
        };
      });

      const fuseGroupsWithCounts = (fuseGroupsData || []).map((fg: FuseGroup) => {
        const board = (distBoardsData || []).find((db: DistributionBoard) => db.id === fg.board_id);
        return {
          ...fg,
          board_name: board?.name || "Ukendt",
          stands_count: (standsData || []).filter((s: any) => s.fuse_group_id === fg.id).length
        };
      });

      // Hent tavle-forbindelser
      const { data: connectionsData } = await (supabase as any)
        .from("board_connections")
        .select("*");

      const connectionsWithNames = (connectionsData || []).map((conn: BoardConnection) => {
        const fromBoard = (distBoardsData || []).find((db: DistributionBoard) => db.id === conn.from_board_id);
        const toBoard = (distBoardsData || []).find((db: DistributionBoard) => db.id === conn.to_board_id);
        return {
          ...conn,
          from_board_name: fromBoard?.name || "Ukendt",
          to_board_name: toBoard?.name || "Ukendt"
        };
      });

      // Hent målere og standere til strømsti-søgning
      const { data: metersData } = await (supabase as any)
        .from("power_meters")
        .select("id, meter_number, is_online, stand_id")
        .order("meter_number");

      const { data: powerStandsData } = await (supabase as any)
        .from("power_stands")
        .select("id, name, fuse_group_id")
        .order("name");

      // Berig standere med tilknyttede målere
      const standsWithMeters = (powerStandsData || []).map((stand: any) => ({
        ...stand,
        meters: (metersData || []).filter((m: any) => m.stand_id === stand.id)
      }));

      setMainBoards(mainBoardsWithCounts);
      setDistributionBoards(distBoardsWithCounts);
      setFuseGroups(fuseGroupsWithCounts);
      setBoardConnections(connectionsWithNames);
      setMeters(metersData || []);
      setStands(standsWithMeters);
    } catch (error) {
      console.error("Fejl ved hentning:", error);
      toast.error("Kunne ikke hente data");
    } finally {
      setLoading(false);
    }
  };

  // ============ STRØMSTI SØGNING ============

  const findPowerPath = (meterId: string) => {
    if (!meterId) {
      setPowerPath(null);
      return;
    }

    const meter = meters.find(m => m.id === meterId);
    if (!meter) {
      setPowerPath(null);
      return;
    }

    // Find stander via målerens stand_id
    const stand = meter.stand_id ? stands.find(s => s.id === meter.stand_id) : null;
    
    // Find sikringsgruppe
    const fuseGroup = stand ? fuseGroups.find(fg => fg.id === stand.fuse_group_id) : null;
    
    // Find undertavle
    const distBoard = fuseGroup ? distributionBoards.find(db => db.id === fuseGroup.board_id) : null;
    
    // Find hovedtavle
    const mainBoard = distBoard ? mainBoards.find(mb => mb.id === distBoard.main_board_id) : null;

    setPowerPath({
      meter,
      stand: stand || null,
      fuseGroup: fuseGroup || null,
      distBoard: distBoard || null,
      mainBoard: mainBoard || null
    });
  };

  // ============ HOVEDTAVLER ============

  const openMainBoardDialog = (board?: MainBoard) => {
    if (board) {
      setEditingMainBoard(board);
      setMainBoardForm({ 
        name: board.name, 
        description: board.description || "", 
        color: board.color 
      });
    } else {
      setEditingMainBoard(null);
      setMainBoardForm({ name: "", description: "", color: "#3B82F6" });
    }
    setMainBoardDialogOpen(true);
  };

  const saveMainBoard = async () => {
    if (!mainBoardForm.name.trim()) {
      toast.error("Navn er påkrævet");
      return;
    }

    try {
      if (editingMainBoard) {
        const { error } = await (supabase as any)
          .from("main_boards")
          .update({
            name: mainBoardForm.name,
            description: mainBoardForm.description || null,
            color: mainBoardForm.color,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingMainBoard.id);
        if (error) throw error;
        toast.success("Hovedtavle opdateret");
      } else {
        const { error } = await (supabase as any)
          .from("main_boards")
          .insert({
            name: mainBoardForm.name,
            description: mainBoardForm.description || null,
            color: mainBoardForm.color
          });
        if (error) throw error;
        toast.success("Hovedtavle oprettet");
      }
      setMainBoardDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Fejl:", error);
      toast.error("Kunne ikke gemme hovedtavle");
    }
  };

  const deleteMainBoard = async (id: string) => {
    if (!confirm("Er du sikker? Undertavler vil blive afkoblet.")) return;
    try {
      const { error } = await (supabase as any)
        .from("main_boards")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Hovedtavle slettet");
      fetchData();
    } catch (error) {
      console.error("Fejl:", error);
      toast.error("Kunne ikke slette hovedtavle");
    }
  };

  // ============ UNDERTAVLER ============

  const openDistBoardDialog = (board?: DistributionBoard) => {
    if (board) {
      setEditingDistBoard(board);
      setDistBoardForm({ 
        name: board.name, 
        board_number: board.board_number?.toString() || "",
        main_board_id: board.main_board_id || "",
        location: board.location || "",
        color: board.color
      });
    } else {
      setEditingDistBoard(null);
      setDistBoardForm({ name: "", board_number: "", main_board_id: "", location: "", color: "#F59E0B" });
    }
    setDistBoardDialogOpen(true);
  };

  const saveDistBoard = async () => {
    if (!distBoardForm.name.trim()) {
      toast.error("Navn er påkrævet");
      return;
    }

    try {
      const data = {
        name: distBoardForm.name,
        board_number: distBoardForm.board_number ? parseInt(distBoardForm.board_number) : null,
        main_board_id: distBoardForm.main_board_id && distBoardForm.main_board_id !== "none" ? distBoardForm.main_board_id : null,
        location: distBoardForm.location || null,
        color: distBoardForm.color,
        updated_at: new Date().toISOString()
      };

      if (editingDistBoard) {
        const { error } = await (supabase as any)
          .from("distribution_boards")
          .update(data)
          .eq("id", editingDistBoard.id);
        if (error) throw error;
        toast.success("Undertavle opdateret");
      } else {
        const { error } = await (supabase as any)
          .from("distribution_boards")
          .insert(data);
        if (error) throw error;
        toast.success("Undertavle oprettet");
      }
      setDistBoardDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Fejl:", error);
      toast.error("Kunne ikke gemme undertavle");
    }
  };

  const deleteDistBoard = async (id: string) => {
    if (!confirm("Er du sikker? Sikringsgrupper vil også blive slettet.")) return;
    try {
      const { error } = await (supabase as any)
        .from("distribution_boards")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Undertavle slettet");
      fetchData();
    } catch (error) {
      console.error("Fejl:", error);
      toast.error("Kunne ikke slette undertavle");
    }
  };

  // ============ SIKRINGSGRUPPER ============

  const openFuseGroupDialog = (group?: FuseGroup) => {
    if (group) {
      setEditingFuseGroup(group);
      setFuseGroupForm({ 
        board_id: group.board_id,
        group_number: group.group_number.toString(),
        name: group.name || "",
        fuse_rating: group.fuse_rating || "",
        description: group.description || ""
      });
    } else {
      setEditingFuseGroup(null);
      setFuseGroupForm({ 
        board_id: selectedBoardFilter !== "all" ? selectedBoardFilter : "", 
        group_number: "", 
        name: "", 
        fuse_rating: "", 
        description: "" 
      });
    }
    setFuseGroupDialogOpen(true);
  };

  const saveFuseGroup = async () => {
    if (!fuseGroupForm.board_id || !fuseGroupForm.group_number) {
      toast.error("Undertavle og gruppenummer er påkrævet");
      return;
    }

    try {
      const data = {
        board_id: fuseGroupForm.board_id,
        group_number: parseInt(fuseGroupForm.group_number),
        name: fuseGroupForm.name || null,
        fuse_rating: fuseGroupForm.fuse_rating || null,
        description: fuseGroupForm.description || null,
        updated_at: new Date().toISOString()
      };

      if (editingFuseGroup) {
        const { error } = await (supabase as any)
          .from("fuse_groups")
          .update(data)
          .eq("id", editingFuseGroup.id);
        if (error) throw error;
        toast.success("Sikringsgruppe opdateret");
      } else {
        const { error } = await (supabase as any)
          .from("fuse_groups")
          .insert(data);
        if (error) throw error;
        toast.success("Sikringsgruppe oprettet");
      }
      setFuseGroupDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Fejl:", error);
      if (error.code === "23505") {
        toast.error("Denne gruppe findes allerede i undertavlen");
      } else {
        toast.error("Kunne ikke gemme sikringsgruppe");
      }
    }
  };

  const deleteFuseGroup = async (id: string) => {
    if (!confirm("Er du sikker? Standere vil blive afkoblet fra gruppen.")) return;
    try {
      const { error } = await (supabase as any)
        .from("fuse_groups")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Sikringsgruppe slettet");
      fetchData();
    } catch (error) {
      console.error("Fejl:", error);
      toast.error("Kunne ikke slette sikringsgruppe");
    }
  };

  // ============ FORBINDELSER ============

  const openConnectionDialog = () => {
    setConnectionForm({ from_board_id: "", to_board_id: "", color: "#666666" });
    setConnectionDialogOpen(true);
  };

  const saveConnection = async () => {
    if (!connectionForm.from_board_id || !connectionForm.to_board_id) {
      toast.error("Vælg både fra- og til-tavle");
      return;
    }
    if (connectionForm.from_board_id === connectionForm.to_board_id) {
      toast.error("En tavle kan ikke forbindes til sig selv");
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from("board_connections")
        .insert({
          from_board_id: connectionForm.from_board_id,
          to_board_id: connectionForm.to_board_id,
          color: connectionForm.color
        });
      if (error) throw error;
      toast.success("Forbindelse oprettet");
      setConnectionDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Fejl:", error);
      if (error.code === "23505") {
        toast.error("Denne forbindelse findes allerede");
      } else {
        toast.error("Kunne ikke oprette forbindelse");
      }
    }
  };

  const deleteConnection = async (id: string) => {
    if (!confirm("Slet denne forbindelse?")) return;
    try {
      const { error } = await (supabase as any)
        .from("board_connections")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Forbindelse slettet");
      fetchData();
    } catch (error) {
      console.error("Fejl:", error);
      toast.error("Kunne ikke slette forbindelse");
    }
  };

  // Filtrer sikringsgrupper
  const filteredFuseGroups = selectedBoardFilter === "all" 
    ? fuseGroups 
    : fuseGroups.filter(fg => fg.board_id === selectedBoardFilter);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CircuitBoard className="h-6 w-6" />
                El-infrastruktur
              </h1>
              <p className="text-muted-foreground">Administrer hovedtavler, undertavler og sikringsgrupper</p>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchData}
              disabled={loading}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="hovedtavler" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Hovedtavler ({mainBoards.length})
              </TabsTrigger>
              <TabsTrigger value="undertavler" className="flex items-center gap-2">
                <Cable className="h-4 w-4" />
                Undertavler ({distributionBoards.length})
              </TabsTrigger>
              <TabsTrigger value="sikringsgrupper" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sikringsgrupper ({fuseGroups.length})
              </TabsTrigger>
              <TabsTrigger value="forbindelser" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Forbindelser ({boardConnections.length})
              </TabsTrigger>
              <TabsTrigger value="stromsti" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Find strømkilde
              </TabsTrigger>
            </TabsList>

            {/* HOVEDTAVLER TAB */}
            <TabsContent value="hovedtavler">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Hovedtavler</CardTitle>
                    <CardDescription>De primære strømtavler på campingpladsen</CardDescription>
                  </div>
                  <Button onClick={() => openMainBoardDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tilføj hovedtavle
                  </Button>
                </CardHeader>
                <CardContent>
                  {mainBoards.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Ingen hovedtavler oprettet endnu
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Farve</TableHead>
                          <TableHead>Navn</TableHead>
                          <TableHead>Beskrivelse</TableHead>
                          <TableHead>Undertavler</TableHead>
                          <TableHead>På kort</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mainBoards.map((board) => (
                          <TableRow key={board.id}>
                            <TableCell>
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-white shadow"
                                style={{ backgroundColor: board.color }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{board.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {board.description || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {board.distribution_boards_count} undertavler
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {board.map_x !== null ? (
                                <Badge variant="outline">Placeret</Badge>
                              ) : (
                                <Badge variant="destructive">Ikke placeret</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openMainBoardDialog(board)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Rediger
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteMainBoard(board.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Slet
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* UNDERTAVLER TAB */}
            <TabsContent value="undertavler">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Undertavler</CardTitle>
                    <CardDescription>Sekundære tavler fordelt på campingpladsen</CardDescription>
                  </div>
                  <Button onClick={() => openDistBoardDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tilføj undertavle
                  </Button>
                </CardHeader>
                <CardContent>
                  {distributionBoards.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Ingen undertavler oprettet endnu
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nr.</TableHead>
                          <TableHead>Navn</TableHead>
                          <TableHead>Hovedtavle</TableHead>
                          <TableHead>Placering</TableHead>
                          <TableHead>Sikringsgrupper</TableHead>
                          <TableHead>På kort</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {distributionBoards.map((board) => (
                          <TableRow key={board.id}>
                            <TableCell className="font-mono">
                              {board.board_number || "-"}
                            </TableCell>
                            <TableCell className="font-medium">{board.name}</TableCell>
                            <TableCell>{board.main_board_name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {board.location || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {board.fuse_groups_count} grupper
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {board.map_x !== null ? (
                                <Badge variant="outline">Placeret</Badge>
                              ) : (
                                <Badge variant="destructive">Ikke placeret</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openDistBoardDialog(board)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Rediger
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteDistBoard(board.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Slet
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SIKRINGSGRUPPER TAB */}
            <TabsContent value="sikringsgrupper">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Sikringsgrupper</CardTitle>
                    <CardDescription>Grupper af sikringer i undertavlerne</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedBoardFilter} onValueChange={setSelectedBoardFilter}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrer på undertavle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle undertavler</SelectItem>
                        {distributionBoards.map((board) => (
                          <SelectItem key={board.id} value={board.id}>
                            {board.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => openFuseGroupDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tilføj gruppe
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredFuseGroups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {selectedBoardFilter === "all" 
                        ? "Ingen sikringsgrupper oprettet endnu"
                        : "Ingen sikringsgrupper i denne undertavle"}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Gruppe nr.</TableHead>
                          <TableHead>Navn</TableHead>
                          <TableHead>Undertavle</TableHead>
                          <TableHead>Sikring</TableHead>
                          <TableHead>Standere</TableHead>
                          <TableHead>Beskrivelse</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFuseGroups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell className="font-mono font-bold">
                              {group.group_number}
                            </TableCell>
                            <TableCell className="font-medium">
                              {group.name || "-"}
                            </TableCell>
                            <TableCell>{group.board_name}</TableCell>
                            <TableCell>
                              {group.fuse_rating ? (
                                <Badge>{group.fuse_rating}</Badge>
                              ) : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {group.stands_count} standere
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                              {group.description || "-"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openFuseGroupDialog(group)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Rediger
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteFuseGroup(group.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Slet
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* FORBINDELSER TAB */}
            <TabsContent value="forbindelser">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tavle-forbindelser</CardTitle>
                    <CardDescription>Forbindelser mellem undertavler (vises som streger på kortet)</CardDescription>
                  </div>
                  <Button onClick={openConnectionDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tilføj forbindelse
                  </Button>
                </CardHeader>
                <CardContent>
                  {boardConnections.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Ingen forbindelser oprettet endnu
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fra tavle</TableHead>
                          <TableHead>Til tavle</TableHead>
                          <TableHead>Farve</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {boardConnections.map((conn) => (
                          <TableRow key={conn.id}>
                            <TableCell className="font-medium">{conn.from_board_name}</TableCell>
                            <TableCell className="font-medium">{conn.to_board_name}</TableCell>
                            <TableCell>
                              <div 
                                className="w-8 h-4 rounded" 
                                style={{ backgroundColor: conn.color }}
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteConnection(conn.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* STRØMSTI TAB */}
            <TabsContent value="stromsti">
              <Card>
                <CardHeader>
                  <CardTitle>Find strømkilde</CardTitle>
                  <CardDescription>Søg efter en måler for at se hele strømstien fra hovedtavle til måler</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="max-w-md">
                    <Label>Vælg måler</Label>
                    <Select 
                      value={selectedMeter} 
                      onValueChange={(v) => {
                        setSelectedMeter(v);
                        findPowerPath(v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Søg efter målernummer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {meters.map((meter) => (
                          <SelectItem key={meter.id} value={meter.id}>
                            {meter.meter_number} {meter.is_online ? "🟢" : "🔴"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {powerPath && (
                    <div className="bg-muted/50 rounded-lg p-6">
                      <h3 className="font-semibold mb-4">Strømsti for måler: {powerPath.meter?.meter_number}</h3>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Måler (start) */}
                        <div className="p-3 rounded-lg border-2 bg-blue-100 border-blue-500">
                          <div className="text-xs text-muted-foreground mb-1">Måler</div>
                          <div className="font-medium flex items-center gap-2">
                            <CircuitBoard className="h-4 w-4 text-blue-500" />
                            {powerPath.meter?.meter_number}
                            {powerPath.meter?.is_online ? " 🟢" : " 🔴"}
                          </div>
                        </div>

                        <ArrowRight className="h-5 w-5 text-muted-foreground" />

                        {/* Stander */}
                        <div className={`p-3 rounded-lg border-2 ${powerPath.stand ? "bg-green-100 border-green-500" : "bg-gray-100 border-gray-300"}`}>
                          <div className="text-xs text-muted-foreground mb-1">Stander</div>
                          <div className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            {powerPath.stand?.name || "Ikke tilknyttet"}
                          </div>
                        </div>

                        <ArrowRight className="h-5 w-5 text-muted-foreground" />

                        {/* Sikringsgruppe */}
                        <div className={`p-3 rounded-lg border-2 ${powerPath.fuseGroup ? "bg-purple-100 border-purple-500" : "bg-gray-100 border-gray-300"}`}>
                          <div className="text-xs text-muted-foreground mb-1">Sikringsgruppe</div>
                          <div className="font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-500" />
                            {powerPath.fuseGroup ? `Gr. ${powerPath.fuseGroup.group_number}${powerPath.fuseGroup.name ? ` (${powerPath.fuseGroup.name})` : ""}` : "Ikke tilknyttet"}
                          </div>
                          {powerPath.fuseGroup?.fuse_rating && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Sikring: {powerPath.fuseGroup.fuse_rating}
                            </div>
                          )}
                        </div>

                        <ArrowRight className="h-5 w-5 text-muted-foreground" />

                        {/* Undertavle */}
                        <div className={`p-3 rounded-lg border-2 ${powerPath.distBoard ? "bg-orange-100 border-orange-500" : "bg-gray-100 border-gray-300"}`}>
                          <div className="text-xs text-muted-foreground mb-1">Undertavle</div>
                          <div className="font-medium flex items-center gap-2">
                            <Cable className="h-4 w-4 text-orange-500" />
                            {powerPath.distBoard?.name || "Ikke tilknyttet"}
                          </div>
                        </div>

                        <ArrowRight className="h-5 w-5 text-muted-foreground" />

                        {/* Hovedtavle (strømkilde) */}
                        <div className={`p-3 rounded-lg border-2 ${powerPath.mainBoard ? "bg-red-100 border-red-500" : "bg-gray-100 border-gray-300"}`}>
                          <div className="text-xs text-muted-foreground mb-1">Hovedtavle</div>
                          <div className="font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4 text-red-500" />
                            {powerPath.mainBoard?.name || "Ikke tilknyttet"}
                          </div>
                        </div>
                      </div>

                      {/* Advarsler */}
                      {(!powerPath.stand || !powerPath.fuseGroup || !powerPath.distBoard || !powerPath.mainBoard) && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="text-sm text-yellow-800">
                            <strong>⚠️ Ufuldstændig strømsti:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {!powerPath.stand && <li>Måleren er ikke tilknyttet en stander</li>}
                              {!powerPath.fuseGroup && <li>Standeren mangler sikringsgruppe</li>}
                              {!powerPath.distBoard && <li>Sikringsgruppen mangler undertavle</li>}
                              {!powerPath.mainBoard && <li>Undertavlen mangler hovedtavle</li>}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!powerPath && selectedMeter && (
                    <div className="text-center py-8 text-muted-foreground">
                      Ingen data fundet for denne måler
                    </div>
                  )}

                  {!selectedMeter && (
                    <div className="text-center py-8 text-muted-foreground">
                      Vælg en måler for at se strømstien
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* FORBINDELSE DIALOG */}
          <Dialog open={connectionDialogOpen} onOpenChange={setConnectionDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Opret forbindelse</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Fra undertavle *</Label>
                  <Select 
                    value={connectionForm.from_board_id} 
                    onValueChange={(v) => setConnectionForm({ ...connectionForm, from_board_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg undertavle" />
                    </SelectTrigger>
                    <SelectContent>
                      {distributionBoards.map((board) => (
                        <SelectItem key={board.id} value={board.id}>
                          {board.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Til undertavle *</Label>
                  <Select 
                    value={connectionForm.to_board_id} 
                    onValueChange={(v) => setConnectionForm({ ...connectionForm, to_board_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg undertavle" />
                    </SelectTrigger>
                    <SelectContent>
                      {distributionBoards
                        .filter(b => b.id !== connectionForm.from_board_id)
                        .map((board) => (
                          <SelectItem key={board.id} value={board.id}>
                            {board.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Linje-farve</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      { name: "Grå", value: "#666666" },
                      { name: "Blå", value: "#3B82F6" },
                      { name: "Rød", value: "#EF4444" },
                      { name: "Grøn", value: "#22C55E" },
                      { name: "Orange", value: "#F59E0B" },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          connectionForm.color === color.value 
                            ? "border-primary scale-110" 
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setConnectionForm({ ...connectionForm, color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuller</Button>
                </DialogClose>
                <Button onClick={saveConnection}>Opret</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* HOVEDTAVLE DIALOG */}
          <Dialog open={mainBoardDialogOpen} onOpenChange={setMainBoardDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMainBoard ? "Rediger hovedtavle" : "Opret hovedtavle"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Navn *</Label>
                  <Input
                    value={mainBoardForm.name}
                    onChange={(e) => setMainBoardForm({ ...mainBoardForm, name: e.target.value })}
                    placeholder="F.eks. Hovedtavle 1"
                  />
                </div>
                <div>
                  <Label>Beskrivelse</Label>
                  <Input
                    value={mainBoardForm.description}
                    onChange={(e) => setMainBoardForm({ ...mainBoardForm, description: e.target.value })}
                    placeholder="Valgfri beskrivelse"
                  />
                </div>
                <div>
                  <Label>Farve</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          mainBoardForm.color === color.value 
                            ? "border-primary scale-110" 
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setMainBoardForm({ ...mainBoardForm, color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuller</Button>
                </DialogClose>
                <Button onClick={saveMainBoard}>
                  {editingMainBoard ? "Gem ændringer" : "Opret"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* UNDERTAVLE DIALOG */}
          <Dialog open={distBoardDialogOpen} onOpenChange={setDistBoardDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDistBoard ? "Rediger undertavle" : "Opret undertavle"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Navn *</Label>
                    <Input
                      value={distBoardForm.name}
                      onChange={(e) => setDistBoardForm({ ...distBoardForm, name: e.target.value })}
                      placeholder="F.eks. Tavle 3"
                    />
                  </div>
                  <div>
                    <Label>Tavle nr.</Label>
                    <Input
                      type="number"
                      value={distBoardForm.board_number}
                      onChange={(e) => setDistBoardForm({ ...distBoardForm, board_number: e.target.value })}
                      placeholder="F.eks. 3"
                    />
                  </div>
                </div>
                <div>
                  <Label>Forbinder til hovedtavle (direkte)</Label>
                  <Select 
                    value={distBoardForm.main_board_id} 
                    onValueChange={(v) => setDistBoardForm({ ...distBoardForm, main_board_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg hovedtavle (hvis direkte forbundet)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen (forbinder via anden undertavle)</SelectItem>
                      {mainBoards.map((board) => (
                        <SelectItem key={board.id} value={board.id}>
                          {board.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vælg kun hvis denne undertavle forbinder DIREKTE til hovedtavlen
                  </p>
                </div>
                <div>
                  <Label>Placering</Label>
                  <Input
                    value={distBoardForm.location}
                    onChange={(e) => setDistBoardForm({ ...distBoardForm, location: e.target.value })}
                    placeholder="F.eks. Ved toilet ved plads 120"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuller</Button>
                </DialogClose>
                <Button onClick={saveDistBoard}>
                  {editingDistBoard ? "Gem ændringer" : "Opret"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* SIKRINGSGRUPPE DIALOG */}
          <Dialog open={fuseGroupDialogOpen} onOpenChange={setFuseGroupDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFuseGroup ? "Rediger sikringsgruppe" : "Opret sikringsgruppe"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Undertavle *</Label>
                  <Select 
                    value={fuseGroupForm.board_id} 
                    onValueChange={(v) => setFuseGroupForm({ ...fuseGroupForm, board_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg undertavle" />
                    </SelectTrigger>
                    <SelectContent>
                      {distributionBoards.map((board) => (
                        <SelectItem key={board.id} value={board.id}>
                          {board.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Gruppe nr. *</Label>
                    <Input
                      type="number"
                      value={fuseGroupForm.group_number}
                      onChange={(e) => setFuseGroupForm({ ...fuseGroupForm, group_number: e.target.value })}
                      placeholder="F.eks. 4"
                    />
                  </div>
                  <div>
                    <Label>Sikring</Label>
                    <Select 
                      value={fuseGroupForm.fuse_rating} 
                      onValueChange={(v) => setFuseGroupForm({ ...fuseGroupForm, fuse_rating: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg størrelse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10A">10A</SelectItem>
                        <SelectItem value="16A">16A</SelectItem>
                        <SelectItem value="20A">20A</SelectItem>
                        <SelectItem value="25A">25A</SelectItem>
                        <SelectItem value="32A">32A</SelectItem>
                        <SelectItem value="40A">40A</SelectItem>
                        <SelectItem value="63A">63A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Navn (valgfrit)</Label>
                  <Input
                    value={fuseGroupForm.name}
                    onChange={(e) => setFuseGroupForm({ ...fuseGroupForm, name: e.target.value })}
                    placeholder="F.eks. Område A"
                  />
                </div>
                <div>
                  <Label>Beskrivelse</Label>
                  <Input
                    value={fuseGroupForm.description}
                    onChange={(e) => setFuseGroupForm({ ...fuseGroupForm, description: e.target.value })}
                    placeholder="Valgfri beskrivelse"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuller</Button>
                </DialogClose>
                <Button onClick={saveFuseGroup}>
                  {editingFuseGroup ? "Gem ændringer" : "Opret"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ElInfrastruktur;
