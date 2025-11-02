// api/generate-checklist.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGenAI, extractText, stripFences, errorRes } from './_gemini.js';
import { guardLinkIfOfficial } from './_link-guard.js';

const jsonShape = `
Responda APENAS com um JSON válido, sem cercas, no formato:
{
  "title": "string",
  "introduction": "string",
  "categories": [
    {
      "category": "string",
      "items": [
        { "id": "kebab-case", "task": "string", "details": "string", "link": "string (opcional)" }
      ]
    }
  ],
  "disclaimer": "string"
}
`;

function getContextForCountry(countryName: string): string {
  const c = countryName.toLowerCase();
  if (c.includes('portugal')) return `- Lei nº 61/2025 extinguiu "manifestação de interesse". - Visto de procura de trabalho qualificado aguarda regulação. - EES em vigor.`;
  if (c.includes('irlanda')) return `- 28/04/2025: Employment Permits no novo portal DETE. - Obter Employment Permit antes do visto. - Agendamento online para registro em Dublin.`;
  if (c.includes('alemanha')) return `- Fachkräfteeinwanderungsgesetz implementada. - Chancenkarte desde 01/06/2024. - Anerkennung e piso do EU Blue Card.`;
  if (c.includes('austrália') || c.includes('australia')) return `- SkillSelect (pontos). - Skills Assessment comum. - Foco em áreas regionais.`;
  return '';
}

// Sanitiza os links do checklist para apenas manter oficiais válidos
async function sanitizeChecklistLinks(countryName: string, checklist: any): Promise<any> {
  if (!Array.isArray(checklist?.categories)) return checklist;
  const cats = await Promise.all(
    checklist.categories.map(async (cat: any) => {
      if (!Array.isArray(cat?.items)) return cat;
      const items = await Promise.all(
        cat.items.map(async (it: any) => {
          if (!it?.link) return it;
          const safe = await guardLinkIfOfficial(countryName, it.link);
          // Se não for oficial/ok, removemos o link (evita 404 ou phishing)
          return { ...it, link: safe || undefined };
        })
      );
      return { ...cat, items };
    })
  );
  return { ...checklist, categories: cats };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return errorRes(res, 405, 'Use POST');
    const { destinationCountry, visaType } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!destinationCountry || !visaType) return errorRes(res, 400, 'Parâmetros "destinationCountry" e "visaType" são obrigatórios.');

    const context = getContextForCountry(destinationCountry);
    const prompt = `
Aja como consultor de imigração e gere um checklist (pt-BR) para "${visaType}" em "${destinationCountry}".

Contexto:
${context}

Regras:
1) Inclua links oficiais diretos quando necessário (campo "link").
2) Apenas JSON válido, seguindo o formato abaixo.

${jsonShape}
`;

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const resp = await model.generateContent(prompt);
    const text = stripFences(extractText(resp));

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return errorRes(res, 502, 'Falha ao parsear o JSON retornado pelo modelo.');
    }

    // adiciona checked:false
    let checklist = {
      ...parsed,
      categories: Array.isArray(parsed.categories)
        ? parsed.categories.map((cat: any) => ({
            ...cat,
            items: Array.isArray(cat.items)
              ? cat.items.map((it: any) => ({ ...it, checked: false }))
              : [],
          }))
        : [],
    };

    // HIGIENIZAÇÃO: remove/ajusta links que não sejam oficiais e válidos
    checklist = await sanitizeChecklistLinks(destinationCountry, checklist);

    return res.status(200).json({ checklist });
  } catch (e: any) {
    return errorRes(res, 500, e?.message || 'Erro interno');
  }
}
