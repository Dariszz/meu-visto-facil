// api/visa-summary.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGenAI, extractText, errorRes } from './_gemini.js';

function officialDomains(countryName: string): string[] {
  const c = countryName.toLowerCase();
  if (c.includes('portugal')) return ['vistos.mne.gov.pt', 'aima.gov.pt', 'www.vfsglobal.com/portugal'];
  if (c.includes('irlanda')) return ['irishimmigration.ie', 'enterprise.gov.ie'];
  if (c.includes('alemanha')) return ['make-it-in-germany.com', 'brasil.diplo.de', 'auswaertiges-amt.de'];
  if (c.includes('austrália') || c.includes('australia')) return ['immi.homeaffairs.gov.au'];
  return [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return errorRes(res, 405, 'Use POST');
    const { countryName, visaType } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!countryName || !visaType) return errorRes(res, 400, 'Parâmetros "countryName" e "visaType" são obrigatórios.');

    const domains = officialDomains(countryName);
    const format = `
Formate exatamente assim (sem markdown, sem extra):
SourceType: [Oficial|Não Oficial]
Resumo: [texto]
Link: [url]
`;

    const prompt = `
Você é um consultor de imigração preciso e rigoroso.
Resuma o visto "${visaType}" de "${countryName}".

Regra 1: Busque PRIMEIRO nos domínios oficiais: ${domains.join(', ') || '(nenhum definido)'}.
Regra 2: Se e somente se não houver informação oficial, use outras fontes confiáveis.
Regra 3: Use o formato abaixo sem nada além dele:

${format}
`;

    const genAI = getGenAI();
    // Observação: a busca na web pode variar por plano/SDK. Mantemos o prompt orientado a fontes oficiais.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const resp = await model.generateContent(prompt);
    const text = extractText(resp).trim();

    // Extração simples via regex
    const sourceTypeMatch = text.match(/SourceType:\s*(Oficial|Não Oficial)/i);
    const summaryMatch = text.match(/Resumo:\s*([\s\S]*?)\s*Link:/i);
    const linkMatch = text.match(/Link:\s*(https?:\/\/\S+)/i);

    const sourceType = sourceTypeMatch ? (sourceTypeMatch[1].toLowerCase().startsWith('oficial') ? 'Oficial' : 'Não Oficial') : 'Não Oficial';
    const summary = summaryMatch ? summaryMatch[1].trim() : 'Não foi possível gerar um resumo. Verifique as fontes oficiais.';
    const officialLink = linkMatch ? linkMatch[1].trim() : '';

    return res.status(200).json({ sourceType, summary, officialLink });
  } catch (e: any) {
    return errorRes(res, 500, e?.message || 'Erro interno');
  }
}
