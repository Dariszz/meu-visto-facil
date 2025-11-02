// api/_gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não definido nas variáveis de ambiente.');
  return new GoogleGenerativeAI(apiKey);
}

// Extrai texto de respostas do SDK (compatível com variações)
export function extractText(r: any): string {
  try {
    if (!r) throw new Error('Resposta vazia do modelo.');
    // SDK recente: r.response.text()
    if (r.response && typeof r.response.text === 'function') {
      const t = r.response.text();
      if (typeof t === 'string' && t.trim()) return t;
    }
    // Variante: r.text() direto
    if (typeof r.text === 'function') {
      const t2 = r.text();
      if (typeof t2 === 'string' && t2.trim()) return t2;
    }
    // Variante: propriedade string
    if (typeof r.text === 'string' && r.text.trim()) {
      return r.text;
    }
    // Fallback em candidates
    const c = r?.candidates?.[0]?.content?.parts?.find((p: any) => p?.text)?.text;
    if (typeof c === 'string' && c.trim()) return c;
  } catch (e) {
    // continua para o throw abaixo
  }
  throw new Error('Não foi possível extrair texto da resposta do modelo.');
}

// Remove cercas ```json ... ``` caso o modelo envolva o JSON
export function stripFences(s: string) {
  let t = s.trim();
  if (t.startsWith('```json')) t = t.slice(7);
  if (t.startsWith('```')) t = t.slice(3);
  if (t.endsWith('```')) t = t.slice(0, -3);
  return t.trim();
}

// Helper para respostas padronizadas de erro
export function errorRes(res: any, status: number, message: string) {
  return res.status(status).json({ error: message });
}
