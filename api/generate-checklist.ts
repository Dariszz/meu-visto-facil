// api/generate-checklist.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGenAI, extractText, stripFences, errorRes } from './_gemini.js';

const jsonShape = `
Responda APENAS com um JSON válido, sem cercas de código, no formato:
{
  "title": "string",
  "introduction": "string",
  "categories": [
    {
      "category": "string",
      "items": [
        {
          "id": "kebab-case",
          "task": "string",
          "details": "string",
          "link": "string (opcional)"
        }
      ]
    }
  ],
  "disclaimer": "string"
}
`;

function getContextForCountry(countryName: string): string {
  const c = countryName.toLowerCase();
  if (c.includes('portugal')) {
    return `
- Lei nº 61/2025 extinguiu "manifestação de interesse".
- Procura de trabalho genérico substituída por visto para procura de trabalho qualificado (aguardando regulamentação).
- EES em vigor; registro biométrico na primeira entrada.`;
  }
  if (c.includes('irlanda')) {
    return `
- Desde 28/04/2025, Employment Permits no novo portal DETE.
- Obter Employment Permit antes do visto de longa duração.
- Registro inicial em Dublin exige agendamento online.`;
  }
  if (c.includes('alemanha')) {
    return `
- Fachkräfteeinwanderungsgesetz implementada.
- Chancenkarte (cartão de oportunidade) desde 01/06/2024.
- "Anerkennung" segue crucial; EU Blue Card tem piso salarial anual.`;
  }
  if (c.includes('austrália') || c.includes('australia')) {
    return `
- SkillSelect baseado em pontos; listas de ocupações variam.
- Skills Assessment exigido para muitos vistos.
- Ênfase em migração para áreas regionais.`;
  }
  return '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return errorRes(res, 405, 'Use POST');
    const { destinationCountry, visaType } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!destinationCountry || !visaType) return errorRes(res, 400, 'Parâmetros "destinationCountry" e "visaType" são obrigatórios.');

    const context = getContextForCountry(destinationCountry);
    const prompt = `
Aja como consultor de imigração especialista e gere um checklist passo a passo (pt-BR) para um brasileiro aplicando a "${visaType}" em "${destinationCountry}".

Contexto crítico:
${context}

Regras:
1) Inclua links oficiais diretos quando necessário (campo "link").
2) Responda apenas com JSON válido (sem markdown) seguindo o formato a seguir.
3) Seja claro e objetivo, mas completo.

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

    // adiciona checked:false em cada item (como no client)
    const checklist = {
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

    return res.status(200).json({ checklist });
  } catch (e: any) {
    return errorRes(res, 500, e?.message || 'Erro interno');
  }
}
