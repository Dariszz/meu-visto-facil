// api/fetch-visas.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGenAI, extractText, stripFences, errorRes } from './_gemini';

const visaListSchemaHint = `
Responda APENAS em JSON válido no formato:
{
  "visas": [
    { "name": "string", "value": "string" }
  ]
}
Sem comentários, sem explicações fora do JSON.
`;

function getContextForCountry(countryName: string): string {
  const c = countryName.toLowerCase();
  if (c.includes('portugal')) {
    return `
- Lei nº 61/2025 extinguiu a "manifestação de interesse".
- Visto de procura de trabalho genérico substituído por "visto para procura de trabalho qualificado" (aguarda regulamentação).
- EES (Entrada/Saída UE) em vigor.`;
  }
  if (c.includes('irlanda')) {
    return `
- Desde 28/04/2025, Employment Permits via novo portal DETE.
- Obter Employment Permit antes do visto de longa duração.
- Registro inicial em Dublin exige agendamento online.`;
  }
  if (c.includes('alemanha')) {
    return `
- Fachkräfteeinwanderungsgesetz implementada.
- Chancenkarte (cartão de oportunidade) desde 01/06/2024.
- "Anerkennung" (reconhecimento de qualificação) continua essencial.
- Limites salariais do EU Blue Card ajustados anualmente.`;
  }
  if (c.includes('austrália') || c.includes('australia')) {
    return `
- Sistema de pontos SkillSelect; corte pode variar.
- Listas de ocupações em demanda são atualizadas.
- Skills Assessment é pré-requisito comum.
- Foco em vistos para áreas regionais.`;
  }
  return '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return errorRes(res, 405, 'Use POST');
    const { countryName } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!countryName) return errorRes(res, 400, 'Parâmetro "countryName" é obrigatório.');

    const context = getContextForCountry(countryName);
    const prompt = `
Aja como especialista em imigração com acesso às informações mais recentes.
Para "${countryName}", liste os principais vistos de longa duração para brasileiros.
Priorize trabalho (qualificado, nômade), empreendedorismo, estudo e rendimentos.

Contexto:
${context}

${visaListSchemaHint}
`;

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const resp = await model.generateContent(prompt);
    const text = stripFences(extractText(resp));

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return errorRes(res, 502, 'Falha ao parsear resposta do modelo para JSON.');
    }

    const visas = Array.isArray(parsed?.visas) ? parsed.visas : [];
    return res.status(200).json({ visas });
  } catch (e: any) {
    return errorRes(res, 500, e?.message || 'Erro interno');
  }
}
