// api/visa-summary.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGenAI, extractText, errorRes } from './_gemini.js';
import { guardOfficialLink, COUNTRY_ALLOWLIST } from './_link-guard.js';

function officialDomains(countryName: string): string[] {
  const key = countryName.toLowerCase();
  return COUNTRY_ALLOWLIST[key] || [];
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

Regra 1: Buscar PRIMEIRO nos domínios oficiais: ${domains.join(', ') || '(nenhum definido)'}.
Regra 2: Se e somente se não houver info oficial, use outras fontes confiáveis.
Regra 3: Use o formato abaixo, sem nada além dele:

${format}
`;

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const resp = await model.generateContent(prompt);
    const text = extractText(resp).trim();

    const sourceTypeMatch = text.match(/SourceType:\s*(Oficial|Não Oficial)/i);
    const summaryMatch = text.match(/Resumo:\s*([\s\S]*?)\s*Link:/i);
    const linkMatch = text.match(/Link:\s*(https?:\/\/\S+)/i);

    const sourceType = sourceTypeMatch ? (sourceTypeMatch[1].toLowerCase().startsWith('oficial') ? 'Oficial' : 'Não Oficial') : 'Não Oficial';
    const summary = summaryMatch ? summaryMatch[1].trim() : 'Não foi possível gerar um resumo. Verifique as fontes oficiais.';
    const candidate = linkMatch ? linkMatch[1].trim() : '';

    // Novo: validação e fallback seguro
    const guarded = await guardOfficialLink(countryName, candidate);

    return res.status(200).json({
      sourceType,
      summary,
      officialLink: guarded.url,
      linkVerified: guarded.verified,
      linkTitle: guarded.title || undefined,
    });
  } catch (e: any) {
    return errorRes(res, 500, e?.message || 'Erro interno');
  }
}
