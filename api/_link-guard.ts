// api/_link-guard.ts
export type DomainAllowlist = Record<string, string[]>;

export const COUNTRY_ALLOWLIST: DomainAllowlist = {
  portugal: [
    'vistos.mne.gov.pt',
    'aima.gov.pt',
    'www.vfsglobal.com',
    'portaldasfinancas.gov.pt',
    'www.portaldasfinancas.gov.pt',
    'www.seg-social.pt',
    'seg-social.pt',
  ],
  irlanda: [
    'www.irishimmigration.ie',
    'irishimmigration.ie',
    'enterprise.gov.ie',
    'www.enterprise.gov.ie',
    'www.mywelfare.ie',
    'mywelfare.ie',
    'www.revenue.ie',
    'revenue.ie',
  ],
  alemanha: [
    'www.make-it-in-germany.com',
    'make-it-in-germany.com',
    'brasil.diplo.de',
    'www.auswaertiges-amt.de',
    'auswaertiges-amt.de',
    'www.bzst.de',
    'bzst.de',
  ],
  austrália: [
    'immi.homeaffairs.gov.au',
    'www.homeaffairs.gov.au',
    'homeaffairs.gov.au',
    'www.ato.gov.au',
    'ato.gov.au',
    'www.servicesaustralia.gov.au',
    'servicesaustralia.gov.au',
    'my.gov.au',
    'www.my.gov.au',
  ],
  australia: [
    'immi.homeaffairs.gov.au',
    'www.homeaffairs.gov.au',
    'homeaffairs.gov.au',
    'www.ato.gov.au',
    'ato.gov.au',
    'www.servicesaustralia.gov.au',
    'servicesaustralia.gov.au',
    'my.gov.au',
    'www.my.gov.au',
  ],
};

// allowlist global (Brasil: certidão PF via gov.br)
export const GLOBAL_ALLOWLIST = ['www.gov.br', 'gov.br', 'pf.gov.br', 'www.pf.gov.br'];

export const COUNTRY_FALLBACK: Record<string, string> = {
  portugal: 'https://vistos.mne.gov.pt/pt/vistos-nacionais/como-pedir',
  irlanda: 'https://www.irishimmigration.ie/',
  alemanha: 'https://www.make-it-in-germany.com/en/visa-residence',
  austrália: 'https://immi.homeaffairs.gov.au/visas',
  australia: 'https://immi.homeaffairs.gov.au/visas',
};

export function isAllowedHost(hostname: string, allowed: string[]): boolean {
  const h = hostname.toLowerCase();
  return allowed.some((d) => h === d || h.endsWith(`.${d}`));
}

export function normalizeUrl(raw?: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let urlStr = raw.trim();
  if (!/^https?:\/\//i.test(urlStr)) urlStr = `https://${urlStr}`;
  try {
    const u = new URL(urlStr);
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

export async function validateReachable(
  url: string,
  timeoutMs = 8000
): Promise<{ ok: boolean; finalUrl?: string; title?: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal as any });
    if (!r.ok || r.status >= 400) {
      r = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal as any });
    }
    clearTimeout(t);
    if (!r.ok || r.status >= 400) return { ok: false };
    const finalUrl = r.url || url;

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

export async function guardOfficialLink(
  countryName: string,
  candidate?: string
): Promise<{ url: string; verified: boolean; title?: string }> {
  const key = countryName.toLowerCase();
  const allow = [...(COUNTRY_ALLOWLIST[key] || []), ...GLOBAL_ALLOWLIST];
  const fallback = COUNTRY_FALLBACK[key];

  const norm = normalizeUrl(candidate || '');
  if (norm) {
    try {
      const u = new URL(norm);
      if (isAllowedHost(u.hostname, allow)) {
        const vr = await validateReachable(norm);
        if (vr.ok) return { url: vr.finalUrl || norm, verified: true, title: vr.title };
      }
    } catch {}
  }

  const safe = normalizeUrl(fallback);
  if (safe) {
    const vr = await validateReachable(safe);
    return { url: vr.ok ? (vr.finalUrl || safe) : safe, verified: vr.ok, title: vr.title };
  }

  return { url: norm || (candidate || ''), verified: false };
}

export async function guardLinkIfOfficial(countryName: string, link?: string): Promise<string | undefined> {
  const key = countryName.toLowerCase();
  const allow = [...(COUNTRY_ALLOWLIST[key] || []), ...GLOBAL_ALLOWLIST];
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
