// ===========================================
// Scorecard Templates API Client
// ===========================================

import { api } from './client';
import type {
  Domain,
  Expertise,
  CriterionTemplate,
  GenerateCriteriaInput,
  ScorecardCriterion,
} from '@/lib/types';

// ----- Domains -----

export async function listDomains(): Promise<Domain[]> {
  return api.get<Domain[]>('/admin/domains');
}

export async function getDomainById(id: string): Promise<Domain> {
  return api.get<Domain>(`/admin/domains/${id}`);
}

export async function createDomain(name: string): Promise<Domain> {
  return api.post<Domain>('/admin/domains', { name });
}

export async function updateDomain(id: string, name: string): Promise<Domain> {
  return api.patch<Domain>(`/admin/domains/${id}`, { name });
}

export async function deleteDomain(id: string): Promise<void> {
  return api.delete(`/admin/domains/${id}`);
}

// ----- Expertises -----

export async function listExpertises(): Promise<Expertise[]> {
  return api.get<Expertise[]>('/admin/expertises');
}

export async function getExpertiseById(id: string): Promise<Expertise> {
  return api.get<Expertise>(`/admin/expertises/${id}`);
}

export async function getExpertisesByDomain(domainId: string): Promise<Expertise[]> {
  return api.get<Expertise[]>(`/admin/domains/${domainId}/expertises`);
}

export async function createExpertise(domainId: string, name: string): Promise<Expertise> {
  return api.post<Expertise>('/admin/expertises', { domainId, name });
}

export async function updateExpertise(id: string, name: string): Promise<Expertise> {
  return api.patch<Expertise>(`/admin/expertises/${id}`, { name });
}

export async function deleteExpertise(id: string): Promise<void> {
  return api.delete(`/admin/expertises/${id}`);
}

// ----- Criterion Templates -----

export async function listCriterionTemplates(): Promise<CriterionTemplate[]> {
  return api.get<CriterionTemplate[]>('/admin/criterion-templates');
}

export async function getCriterionTemplateById(id: string): Promise<CriterionTemplate> {
  return api.get<CriterionTemplate>(`/admin/criterion-templates/${id}`);
}

export async function getCriterionTemplatesByDomain(
  domainId: string,
  minLevel?: string
): Promise<CriterionTemplate[]> {
  const params = minLevel ? `?minLevel=${minLevel}` : '';
  return api.get<CriterionTemplate[]>(`/admin/domains/${domainId}/criterion-templates${params}`);
}

export async function createCriterionTemplate(data: {
  domainId: string;
  minLevel: string;
  label: string;
  group: string;
  weightPercentage: number;
  description?: string;
}): Promise<CriterionTemplate> {
  return api.post<CriterionTemplate>('/admin/criterion-templates', data);
}

export async function updateCriterionTemplate(
  id: string,
  data: Partial<{
    minLevel: string;
    label: string;
    group: string;
    weightPercentage: number;
    description: string;
  }>
): Promise<CriterionTemplate> {
  return api.patch<CriterionTemplate>(`/admin/criterion-templates/${id}`, data);
}

export async function deleteCriterionTemplate(id: string): Promise<void> {
  return api.delete(`/admin/criterion-templates/${id}`);
}

// ----- Generate Criteria (Most Important) -----

export async function generateScorecardCriteria(
  domainInputs: GenerateCriteriaInput[]
): Promise<ScorecardCriterion[]> {
  return api.post<ScorecardCriterion[]>('/admin/scorecards/generate-criteria', {
    domainInputs,
  });
}
