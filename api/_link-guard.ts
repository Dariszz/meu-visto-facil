// api/_link-guard.ts
// Utilitários para normalizar, validar e escolher links oficiais

export type DomainAllowlist = Record<string, string[]>;

export const COUNTRY_ALLOWLIST: DomainAllowlist = {
  portugal: ['vistos.mne.gov.pt', 'aima.gov.pt', 'www.vfsglobal.com'],
  irlanda: ['www.irishimmigration.ie', 'irishimmigration.ie', 'enterprise.gov.ie'],
  alemanha: ['www.make-it-in-germany.com', 'make-it-in-germany.com', 'brasil.diplo.de', 'www.auswaertiges-amt.de', 'auswaertiges-amt.de'],
  austrália: ['immi.homeaffairs.gov.au', 'www.homeaffairs.gov.au', 'homeaffairs.gov.au'],
  australia: ['immi.homeaffairs.gov.au', 'www.homeaffairs.gov.au', 'homeaffairs.gov.au'],
};

// Páginas-âncora seguras por país (fallback quando o link sugerido está inválido)
export const COUNTRY_FALLBACK: Record<string, string> = {
  portugal: 'https://vistos.mne.gov.pt/pt/vistos-nacionais/como-pedir',
  irlanda: 'https://www.irishimmigration.ie/',
  alemanha: 'https://www.make-it-in-germany.com/en/visa-residence',
  austrália: 'https://immi.homeaffairs.gov.au/visas',
  australia: 'https://immi.homeaffairs.gov.au/visas',
};

// Retorna true se hostname pertencer à allowlist (suporta subdomínios)
export function isAllowedHost(hostname: string, allowed: string[]): boolean {
  const h = hostname.toLowerCase();
  return allowed.some((d) => h === d || h.endsWith(`.${d}`));
}

// Normaliza a URL e garante https
export function normalizeUrl(raw?: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let urlStr = raw.trim();
  if (!/^https?:\/\//i.test(urlStr)) urlStr = `https://${urlStr}`;
  try {
    const u = new URL(urlStr);
    // remove fragmentos e query desnecessária
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

// HEAD com fallback GET para confirmar status 200/OK, seguindo redirects
export async function validateReachable(url: string, timeoutMs = 8000): Promise<{ ok: boolean; finalUrl?: string; title?: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // Tenta HEAD
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal as any });
    if (!r.ok || (r.status >= 400)) {
      // Fallback GET leve para tentar extrair título e confirmar 200
      r = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal as any });
    }
    clearTimeout(t);
    if (!r.ok || (r.status >= 400)) return { ok: false };
    const finalUrl = r.url || url;

    // Extrai título de forma barata quando for HTML
    let title: string | undefined;
    const ct = r.headers.get('content-type') || '';
    if (/text\/html/i.test(ct)) {
      const text = await r.text();
      const m = text.match(/<title>(.*?)<\/title>/i);
      if (m && m[1]) title = m[1].trim();
    }
    return { ok: true, finalUrl, title };
  } catch {
    clearTimeout(t);
    return { ok: false };
  }
}

// Valida e retorna um link oficial confiável, com fallback seguro
export async function guardOfficialLink(countryName: string, candidate?: string): Promise<{ url: string; verified: boolean; title?: string }> {
  const key = countryName.toLowerCase();
  const allow = COUNTRY_ALLOWLIST[key] || [];
  const fallback = COUNTRY_FALLBACK[key];

  // 1) normaliza
  const norm = normalizeUrl(candidate || '');
  if (norm) {
    try {
      const u = new URL(norm);
      if (isAllowedHost(u.hostname, allow)) {
        const vr = await validateReachable(norm);
        if (vr.ok) return { url: vr.finalUrl || norm, verified: true, title: vr.title };
      }
    } catch {
      // segue para fallback
    }
  }

  // 2) fallback garantido
  const safe = normalizeUrl(fallback);
  if (safe) {
    const vr = await validateReachable(safe);
    return { url: vr.ok ? (vr.finalUrl || safe) : safe, verified: vr.ok, title: vr.title };
  }

  // 3) se até o fallback falhar, retorna candidate normalizado sem verificação
  return { url: norm || (candidate || ''), verified: false };
}

// Para listas: corrige apenas links oficiais válidos e veta domínios fora da allowlist
export async function guardLinkIfOfficial(countryName: string, link?: string): Promise<string | undefined> {
  const key = countryName.toLowerCase();
  const allow = COUNTRY_ALLOWLIST[key] || [];
  const norm = normalizeUrl(link || '');
  if (!norm) return undefined;
  try {
    const u = new URL(norm);
    if (!isAllowedHost(u.hostname, allow)) return undefined;
    const vr = await validateReachable(norm);
    return vr.ok ? (vr.finalUrl || norm) : undefined;
  } catch {
    return undefined;
  }
}
