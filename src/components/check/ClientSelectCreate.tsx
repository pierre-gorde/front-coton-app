/**
 * Client Select/Create Component
 * Combobox that allows selecting existing client or creating new one
 * Following CLAUDE.md patterns: proper state management, error handling with toasts
 */

import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Client } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ClientSelectCreateProps {
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
  disabled?: boolean;
}

export function ClientSelectCreate({
  selectedClientId,
  onClientChange,
  disabled = false,
}: ClientSelectCreateProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { listClients } = await import('@/lib/services/checkAdminService');
      const data = await listClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des clients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du client est requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);
      const { listClients } = await import('@/lib/services/checkAdminService');
      const { api } = await import('@/lib/api/client');

      // Create client with minimal data
      const newClient = await api.post<Client>('/admin/clients', {
        name: newClientName.trim(),
      });

      toast({
        title: 'Succès',
        description: 'Client créé avec succès',
        variant: 'success',
      });

      // Refresh clients list
      const data = await listClients();
      setClients(data);

      // Select the new client
      onClientChange(newClient.id);

      // Close dialogs and reset form
      setCreateDialogOpen(false);
      setOpen(false);
      setNewClientName('');
    } catch (error) {
      console.error('Failed to create client:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le client',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            {selectedClient ? selectedClient.name : 'Sélectionner un client...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Rechercher un client..." />
            <CommandList>
              <CommandEmpty>Aucun client trouvé.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => {
                      onClientChange(client.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedClientId === client.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {client.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setCreateDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un nouveau client
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Client Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
            <DialogDescription>
              Créer un nouveau client avec un nom. Vous pourrez compléter les informations plus tard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">
                Nom du client <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clientName"
                placeholder="Ex: Acme Corporation"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                disabled={isCreating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateClient();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setNewClientName('');
              }}
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateClient}
              disabled={isCreating}
              className="gradient-accent text-accent-foreground"
            >
              {isCreating ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                  Création...
                </>
              ) : (
                'Créer le client'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
