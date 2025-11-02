// src/services/geminiService.ts
import type { Checklist, VisaOption, VisaSummary } from '../types';

async function postJSON<T>(url: string, payload: any): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data && data.error) ? data.error : `Erro HTTP ${r.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function fetchVisasForCountry(countryName: string): Promise<VisaOption[]> {
  const data = await postJSON<{ visas: VisaOption[] }>('/api/fetch-visas', { countryName });
  return data.visas || [];
}

export async function fetchVisaSummary(countryName: string, visaType: string): Promise<VisaSummary> {
  const data = await postJSON<VisaSummary>('/api/visa-summary', { countryName, visaType });
  // Garantias mínimas
  return {
    sourceType: data.sourceType || 'Não Oficial',
    summary: data.summary || 'Não foi possível gerar um resumo. Verifique as fontes oficiais.',
    officialLink: data.officialLink || '',
  };
}

export async function generateChecklist(destinationCountry: string, visaType: string): Promise<Checklist> {
  const data = await postJSON<{ checklist: Checklist }>('/api/generate-checklist', {
    destinationCountry,
    visaType,
  });
  if (!data?.checklist) throw new Error('Checklist não retornado pelo servidor.');
  return data.checklist;
}
