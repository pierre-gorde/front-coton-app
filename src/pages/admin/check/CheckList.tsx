import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMissions, getClients } from '@/lib/api/mockClient';
import type { CheckMission, CheckMissionStatus, Client } from '@/lib/types';
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
} from 'lucide-react';

const statusConfig: Record<CheckMissionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  OPEN: { label: 'Ouvert', variant: 'default' },
  CLOSED: { label: 'Fermé', variant: 'destructive' },
};

export default function CheckListPage() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<CheckMission[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([getMissions(), getClients()]).then(([missionsData, clientsData]) => {
      setMissions(missionsData);
      setClients(clientsData);
      setLoading(false);
    });
  }, []);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || '-';
  };

  const filteredMissions = missions.filter(mission => {
    const clientName = getClientName(mission.clientId);
    const matchesSearch = mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mission.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (missionId: string) => {
    navigate(`/dashboard/admin/check/${missionId}`);
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
        <Button className="gradient-accent text-accent-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau poste
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="py-4">
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
      <Card className="shadow-card">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">
            Postes ({filteredMissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMissions.map((mission) => (
                    <TableRow 
                      key={mission.id} 
                      className="hover:bg-muted/30 cursor-pointer"
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
                          <Building2 className="h-4 w-4" />
                          <span>{getClientName(mission.clientId)}</span>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
