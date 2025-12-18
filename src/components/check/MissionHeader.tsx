/**
 * Mission Header Component
 * Displays mission information with inline editing capabilities
 * Following CLAUDE.md patterns: proper state management, error handling with toasts
 */

import { Building2, Calendar, Check, Loader2, Pencil, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CheckMission, Client } from '@/lib/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClientSelectCreate } from './ClientSelectCreate';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  OPEN: { label: 'Ouvert', variant: 'default' },
  CLOSED: { label: 'Clôturé', variant: 'outline' },
};

interface MissionHeaderProps {
  mission: CheckMission;
  client?: Client;
  onUpdate: (updatedMission: CheckMission) => void;
}

export function MissionHeader({ mission, client, onUpdate }: MissionHeaderProps) {
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editedTitle, setEditedTitle] = useState(mission.title);
  const [isSaving, setIsSaving] = useState(false);

  const statusConfig = statusLabels[mission.status] ?? statusLabels.DRAFT;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre ne peut pas être vide',
        variant: 'destructive',
      });
      return;
    }

    if (editedTitle === mission.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      setIsSaving(true);
      const { updateCheckMission } = await import('@/lib/services/checkAdminService');
      const updated = await updateCheckMission(mission.id, { title: editedTitle });

      toast({
        title: 'Succès',
        description: 'Titre mis à jour',
        variant: 'success',
      });

      onUpdate(updated);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update title:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le titre',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelTitle = () => {
    setEditedTitle(mission.title);
    setIsEditingTitle(false);
  };

  const handleClientChange = async (clientId: string) => {
    try {
      setIsSaving(true);
      const { updateCheckMission } = await import('@/lib/services/checkAdminService');
      const updated = await updateCheckMission(mission.id, { clientId });

      toast({
        title: 'Succès',
        description: 'Client mis à jour',
        variant: 'success',
      });

      onUpdate(updated);
      setIsEditingClient(false);
    } catch (error) {
      console.error('Failed to update client:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le client',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-xl font-semibold h-auto py-1"
                  disabled={isSaving}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelTitle();
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveTitle}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelTitle}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-semibold">{mission.title}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingTitle(true)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(mission.updatedAt)}
              </span>
            </div>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isEditingClient ? (
          <div className="space-y-2">
            <ClientSelectCreate
              selectedClientId={mission.clientId}
              onClientChange={handleClientChange}
              disabled={isSaving}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingClient(false)}
                disabled={isSaving}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : client ? (
          <div className="flex items-center gap-2">
            <Link
              to={`/dashboard/admin/client/${client.id}`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Building2 className="h-4 w-4" />
              {client.name}
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingClient(true)}
              className="h-6 w-6 p-0"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditingClient(true)}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Ajouter un client
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
