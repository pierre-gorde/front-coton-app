/**
 * Criteria Management Page
 * Admin page to manage Domains, Expertises, and Criterion Templates
 */

import { useState, useEffect } from 'react';
import { AppBreadcrumb } from '@/components/common/AppBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Domain, Expertise, CriterionTemplate } from '@/lib/types';
import * as scorecardApi from '@/lib/api/scorecardTemplates';

export default function CriteriaManagementPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [templates, setTemplates] = useState<CriterionTemplate[]>([]);

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
          <Tabs defaultValue="domains" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="domains">
                Domaines ({domains.length})
              </TabsTrigger>
              <TabsTrigger value="expertises">
                Expertises ({expertises.length})
              </TabsTrigger>
              <TabsTrigger value="templates">
                Templates de critères ({templates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="domains" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Les domaines techniques (Frontend, Backend, DevOps, etc.)
                </p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un domaine
                </Button>
              </div>

              <div className="grid gap-4">
                {domains.map((domain) => (
                  <Card key={domain.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{domain.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {expertises.filter(e => e.domainId === domain.id).length} expertises
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="expertises" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Les expertises liées à chaque domaine (React, Node.js, etc.)
                </p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une expertise
                </Button>
              </div>

              <div className="grid gap-4">
                {expertises.map((expertise) => {
                  const domain = domains.find(d => d.id === expertise.domainId);
                  return (
                    <Card key={expertise.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{expertise.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Domaine: {domain?.name || 'Inconnu'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Les templates de critères organisés par domaine et niveau
                </p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un template
                </Button>
              </div>

              <div className="space-y-6">
                {domains.map((domain) => {
                  const domainTemplates = templates.filter(t => t.domainId === domain.id);
                  if (domainTemplates.length === 0) return null;

                  // Group by minLevel
                  const templatesByLevel = domainTemplates.reduce((acc, template) => {
                    if (!acc[template.minLevel]) {
                      acc[template.minLevel] = [];
                    }
                    acc[template.minLevel].push(template);
                    return acc;
                  }, {} as Record<string, CriterionTemplate[]>);

                  const levels = ['JUNIOR', 'MEDIOR', 'SENIOR', 'EXPERT'];

                  return (
                    <Card key={domain.id} className="overflow-hidden">
                      {/* Domain Header */}
                      <div className="bg-muted/50 px-4 py-3 border-b">
                        <h3 className="font-semibold text-lg">{domain.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {domainTemplates.length} critères au total
                        </p>
                      </div>

                      {/* Levels */}
                      <div className="divide-y">
                        {levels.map((level) => {
                          const levelTemplates = templatesByLevel[level];
                          if (!levelTemplates || levelTemplates.length === 0) return null;

                          return (
                            <div key={level} className="p-4">
                              {/* Level Header */}
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm font-semibold text-primary uppercase">
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
                                    <Button variant="ghost" size="sm" className="shrink-0">
                                      Modifier
                                    </Button>
                                  </div>
                                ))}
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
    </div>
  );
}
