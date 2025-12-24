/**
 * Criteria Management Page
 * Admin page to manage Domains, Expertises, and Criterion Templates
 */

import { useState, useEffect } from 'react';
import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Domain, Expertise, CriterionTemplate } from '@/lib/types';
import * as scorecardApi from '@/lib/api/scorecardTemplates';
import { DomainDialog } from '@/components/check/DomainDialog';
import { ExpertiseDialog } from '@/components/check/ExpertiseDialog';
import { CriterionTemplateDialog } from '@/components/check/CriterionTemplateDialog';

export default function CriteriaManagementPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [templates, setTemplates] = useState<CriterionTemplate[]>([]);

  // Dialog states
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [expertiseDialogOpen, setExpertiseDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | undefined>();
  const [editingExpertise, setEditingExpertise] = useState<Expertise | undefined>();
  const [editingTemplate, setEditingTemplate] = useState<CriterionTemplate | undefined>();

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'domain' | 'expertise' | 'template';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'COTON Check', href: '/dashboard/admin/check/missions' },
    { label: 'Gestion des critères', isCurrent: true },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [domainsData, expertisesData, templatesData] = await Promise.all([
        scorecardApi.listDomains(),
        scorecardApi.listExpertises(),
        scorecardApi.listCriterionTemplates(),
      ]);

      setDomains(domainsData);
      setExpertises(expertisesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleAddDomain = () => {
    setEditingDomain(undefined);
    setDomainDialogOpen(true);
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setDomainDialogOpen(true);
  };

  const handleDeleteDomain = (domain: Domain) => {
    const expertiseCount = expertises.filter(e => e.domainId === domain.id).length;
    // Count templates through expertises
    const templateCount = templates.filter(t => {
      const expertise = expertises.find(e => e.id === t.expertiseId);
      return expertise?.domainId === domain.id;
    }).length;

    if (expertiseCount > 0 || templateCount > 0) {
      toast({
        title: 'Impossible de supprimer',
        description: `Ce domaine contient ${expertiseCount} expertise(s) et ${templateCount} template(s). Supprimez-les d'abord.`,
        variant: 'destructive',
      });
      return;
    }

    setDeleteTarget({ type: 'domain', id: domain.id, name: domain.name });
    setDeleteDialogOpen(true);
  };

  const handleAddExpertise = () => {
    setEditingExpertise(undefined);
    setExpertiseDialogOpen(true);
  };

  const handleEditExpertise = (expertise: Expertise) => {
    setEditingExpertise(expertise);
    setExpertiseDialogOpen(true);
  };

  const handleDeleteExpertise = (expertise: Expertise) => {
    const templateCount = templates.filter(t => t.expertiseId === expertise.id).length;

    if (templateCount > 0) {
      toast({
        title: 'Impossible de supprimer',
        description: `Cette expertise contient ${templateCount} template(s). Supprimez-les d'abord.`,
        variant: 'destructive',
      });
      return;
    }

    setDeleteTarget({ type: 'expertise', id: expertise.id, name: expertise.name });
    setDeleteDialogOpen(true);
  };

  const handleAddTemplate = () => {
    setEditingTemplate(undefined);
    setTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: CriterionTemplate) => {
    setEditingTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = (template: CriterionTemplate) => {
    setDeleteTarget({ type: 'template', id: template.id, name: template.label });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);

      switch (deleteTarget.type) {
        case 'domain':
          await scorecardApi.deleteDomain(deleteTarget.id);
          toast({
            title: 'Succès',
            description: 'Domaine supprimé avec succès',
          });
          break;
        case 'expertise':
          await scorecardApi.deleteExpertise(deleteTarget.id);
          toast({
            title: 'Succès',
            description: 'Expertise supprimée avec succès',
          });
          break;
        case 'template':
          await scorecardApi.deleteCriterionTemplate(deleteTarget.id);
          toast({
            title: 'Succès',
            description: 'Template supprimé avec succès',
          });
          break;
      }

      await loadData();
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer ${deleteTarget.type === 'domain' ? 'le domaine' : deleteTarget.type === 'expertise' ? "l'expertise" : 'le template'}`,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AppBreadcrumb items={breadcrumbItems} />
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={breadcrumbItems} />

      <Card className="rounded-xl shadow-sm">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-xl font-semibold">
            Gestion des critères d'évaluation
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez les domaines, expertises et templates de critères utilisés pour générer les scorecards
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">
                Templates de critères ({templates.length})
              </TabsTrigger>
              <TabsTrigger value="domains">
                Domaines ({domains.length})
              </TabsTrigger>
              <TabsTrigger value="expertises">
                Expertises ({expertises.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="domains" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Les domaines techniques (Frontend, Backend, DevOps, etc.)
                </p>
                <Button size="sm" onClick={handleAddDomain}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un domaine
                </Button>
              </div>

              <div className="grid gap-4">
                {domains.map((domain) => {
                  const domainExpertises = expertises.filter(e => e.domainId === domain.id);
                  const templateCount = templates.filter(t => {
                    const expertise = expertises.find(e => e.id === t.expertiseId);
                    return expertise?.domainId === domain.id;
                  }).length;

                  return (
                    <Card key={domain.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{domain.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {domainExpertises.length} expertises,{' '}
                            {templateCount} templates
                          </p>
                        </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditDomain(domain)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDomain(domain)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="expertises" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Les expertises liées à chaque domaine (React, Node.js, etc.)
                </p>
                <Button size="sm" onClick={handleAddExpertise}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une expertise
                </Button>
              </div>

              <div className="grid gap-4">
                {expertises.map((expertise) => {
                  const domain = domains.find(d => d.id === expertise.domainId);
                  const templateCount = templates.filter(t => t.expertiseId === expertise.id).length;

                  return (
                    <Card key={expertise.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{expertise.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Domaine: {domain?.name || 'Inconnu'} • {templateCount} templates
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditExpertise(expertise)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpertise(expertise)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Les templates de critères organisés par domaine, expertise et niveau
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleAddDomain}>
                    <Plus className="h-4 w-4 mr-2" />
                    Domaine
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleAddExpertise}>
                    <Plus className="h-4 w-4 mr-2" />
                    Expertise
                  </Button>
                  <Button size="sm" onClick={handleAddTemplate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {domains.map((domain) => {
                  const domainExpertises = expertises.filter(e => e.domainId === domain.id);
                  const domainTemplates = templates.filter(t => {
                    const expertise = expertises.find(e => e.id === t.expertiseId);
                    return expertise?.domainId === domain.id;
                  });
                  if (domainTemplates.length === 0) return null;

                  const levels = ['JUNIOR', 'MEDIOR', 'SENIOR', 'EXPERT'];

                  return (
                    <Card key={domain.id} className="overflow-hidden">
                      {/* Domain Header */}
                      <div className="bg-muted/50 px-4 py-3 border-b">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{domain.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {domainExpertises.length} expertises • {domainTemplates.length} critères au total
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditDomain(domain)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDomain(domain)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expertises */}
                      <div className="divide-y">
                        {domainExpertises.map((expertise) => {
                          const expertiseTemplates = templates.filter(t => t.expertiseId === expertise.id);
                          if (expertiseTemplates.length === 0) return null;

                          // Group by minLevel
                          const templatesByLevel = expertiseTemplates.reduce((acc, template) => {
                            if (!acc[template.minLevel]) {
                              acc[template.minLevel] = [];
                            }
                            acc[template.minLevel].push(template);
                            return acc;
                          }, {} as Record<string, CriterionTemplate[]>);

                          return (
                            <div key={expertise.id} className="p-4">
                              {/* Expertise Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-semibold">{expertise.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({expertiseTemplates.length} critères)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditExpertise(expertise)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteExpertise(expertise)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Levels */}
                              <div className="space-y-3 ml-4">
                                {levels.map((level) => {
                                  const levelTemplates = templatesByLevel[level];
                                  if (!levelTemplates || levelTemplates.length === 0) return null;

                                  return (
                                    <div key={level}>
                                      {/* Level Header */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold text-primary uppercase">
                                          {level}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          ({levelTemplates.length} critères)
                                        </span>
                                      </div>

                                      {/* Criteria */}
                                      <div className="space-y-2 ml-4">
                                        {levelTemplates.map((template) => (
                                          <div
                                            key={template.id}
                                            className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                          >
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-medium text-sm">{template.label}</h4>
                                                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                                                  {template.group}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                  Poids: {template.weightPercentage}%
                                                </span>
                                              </div>
                                              {template.description && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  {template.description}
                                                </p>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(template)}>
                                                <Pencil className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteTemplate(template)}
                                                className="text-destructive hover:text-destructive"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}

                {templates.length === 0 && (
                  <Card className="p-8">
                    <p className="text-center text-muted-foreground">
                      Aucun template de critère configuré
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DomainDialog
        open={domainDialogOpen}
        onOpenChange={setDomainDialogOpen}
        domain={editingDomain}
        onSuccess={loadData}
      />

      <ExpertiseDialog
        open={expertiseDialogOpen}
        onOpenChange={setExpertiseDialogOpen}
        expertise={editingExpertise}
        domains={domains}
        onSuccess={loadData}
      />

      <CriterionTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        template={editingTemplate}
        domains={domains}
        expertises={expertises}
        onSuccess={loadData}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              <strong>{deleteTarget?.name}</strong> ?
              {deleteTarget?.type === 'domain' && (
                <span className="block mt-2 text-destructive">
                  Vous devez d'abord supprimer toutes les expertises et templates liés à ce domaine.
                </span>
              )}
              {deleteTarget && deleteTarget.type !== 'domain' && (
                <span className="block mt-2">Cette action est irréversible.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
