import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listCheckMissions, listClients, type CheckMissionWithClient } from '@/lib/services/checkAdminService';
import type { CheckMissionStatus, Client } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  Building2,
  Users,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MissionCreateDialog } from '@/components/check/MissionCreateDialog';

const statusConfig: Record<CheckMissionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  OPEN: { label: 'Ouvert', variant: 'default' },
  CLOSED: { label: 'Fermé', variant: 'destructive' },
};

export default function CheckListPage() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<CheckMissionWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      listCheckMissions(),
      listClients(),
    ]).then(([missionsData, clientsData]) => {
      setMissions(missionsData);
      setClients(clientsData);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleMissionCreated = async () => {
    // Refresh missions list
    const missionsData = await listCheckMissions();
    setMissions(missionsData);
  };

  const filteredMissions = missions.filter(mission => {
    const clientName = mission.client?.name || '';
    const matchesSearch = mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (missionId: string) => {
    navigate(`/dashboard/admin/check/${missionId}`);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">COTON Check</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des postes et des candidatures
          </p>
        </div>
        <Button
          className="gradient-accent text-accent-foreground"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau poste
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, client ou référence..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-lg">
            Postes ({filteredMissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredMissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun poste trouvé</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Référence</TableHead>
                    <TableHead className="font-semibold">Poste</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold text-center">Candidats</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Mis à jour</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMissions.map((mission) => (
                    <TableRow 
                      key={mission.id} 
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(mission.id)}
                    >
                      <TableCell>
                        <span className="font-mono text-sm text-muted-foreground">
                          {mission.reference}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">
                          {mission.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4 shrink-0" />
                          <span>{mission.client?.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{mission.candidateIds.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[mission.status].variant}>
                          {statusConfig[mission.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>{formatDate(mission.updatedAt)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Mission Dialog */}
      <MissionCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        clients={clients}
        onSuccess={handleMissionCreated}
      />
    </div>
  );
}
