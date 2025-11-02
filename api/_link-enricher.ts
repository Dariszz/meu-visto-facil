// api/_link-enricher.ts
import { guardLinkIfOfficial } from './_link-guard.js';

type Rule = {
  match: RegExp;      // casa no id/task/details
  url: string;        // link oficial (validado/filtrado)
  cta?: string;       // rótulo opcional para UI (ex.: "Agendar", "Emitir certidão")
};

// Portugal
const PT_RULES: Rule[] = [
  // AIMA (agendamento/portal)
  { match: /(aima|agendamento|marcar atendimento|resid[eê]ncia|autorização)/i, url: 'https://aima.gov.pt/', cta: 'Acessar AIMA' },
  // NIF
  { match: /(nif|n[uú]mero de identifica[cç][aã]o fiscal|identifica[cç][aã]o fiscal)/i, url: 'https://www.portaldasfinancas.gov.pt/', cta: 'Solicitar NIF' },
  // NISS
  { match: /(niss|seguran[çc]a social)/i, url: 'https://www.seg-social.pt/', cta: 'Solicitar NISS' },
  // Visto via VFS (quando aplicável)
  { match: /(vfs|centro de solicita[cç][aã]o de visto)/i, url: 'https://www.vfsglobal.com/en/individuals/index.html', cta: 'VFS Global' },
];

// Irlanda
const IE_RULES: Rule[] = [
  // Registro (IRP)
  { match: /(irp|gnib|registration|registrar permiss[aã]o|registro de imigra[cç][aã]o)/i, url: 'https://www.irishimmigration.ie/registering-your-immigration-permission/', cta: 'Registrar IRP' },
  // Employment Permits (DETE)
  { match: /(employment permit|work permit|de[tp]e)/i, url: 'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/', cta: 'Employment Permits (DETE)' },
  // PPS Number
  { match: /(pps|ppsn|personal public service)/i, url: 'https://www.mywelfare.ie/', cta: 'Solicitar PPS Number' },
  // Revenue (tax)
  { match: /(revenue|impostos|tax|registro fiscal)/i, url: 'https://www.revenue.ie/', cta: 'Conta no Revenue' },
];

// Alemanha
const DE_RULES: Rule[] = [
  // Registro de residência (Anmeldung)
  { match: /(anmeldung|registro de resid[eê]ncia|registrar residência|bürgeramt)/i, url: 'https://www.make-it-in-germany.com/en/visa-residence/living-in-germany/registration', cta: 'Como registrar residência' },
  // Título de residência (Aufenthaltstitel)
  { match: /(aufenthaltstitel|t[ií]tulo de resid[eê]ncia|permiss[aã]o de resid[eê]ncia)/i, url: 'https://www.make-it-in-germany.com/en/visa-residence/living-in-germany/residence-title', cta: 'Sobre o título de residência' },
  // Identifikationsnummer (Tax ID) – BZSt
  { match: /(tax id|steueridentifikationsnummer|identifikationsnummer|steuer-id)/i, url: 'https://www.bzst.de/EN/Private_individuals/Identification_number/identification_number_node.html', cta: 'Sobre a Steuer-ID' },
];

// Austrália
const AU_RULES: Rule[] = [
  // ImmiAccount / aplicação de vistos
  { match: /(immi|visa application|apply online|immiaccount)/i, url: 'https://immi.homeaffairs.gov.au/', cta: 'Portal Immi' },
  // Tax File Number (ATO)
  { match: /(tfn|tax file number)/i, url: 'https://www.ato.gov.au/Individuals/Tax-file-number/', cta: 'Solicitar TFN' },
  // myGov / Services Australia
  { match: /(mygov|medicare|services australia)/i, url: 'https://my.gov.au/', cta: 'Acessar myGov' },
];

// Regras globais (Brasil – PF)
const GLOBAL_RULES: Rule[] = [
  { match: /(certid[aã]o|antecedentes|pol[ií]cia federal)/i, url: 'https://www.gov.br/pf/pt-br/servicos-pf/antecedentes-criminais', cta: 'Emitir certidão (PF)' },
];

const RULES_BY_COUNTRY: Record<string, Rule[]> = {
  portugal: PT_RULES,
  irlanda: IE_RULES,
  alemanha: DE_RULES,
  austrália: AU_RULES,
  australia: AU_RULES,
};

// Enriquecedor: só insere link quando fizer sentido e for oficial/200
export async function enrichChecklistLinks(countryName: string, checklist: any): Promise<any> {
  if (!Array.isArray(checklist?.categories)) return checklist;
  const key = countryName.toLowerCase();
  const countryRules = RULES_BY_COUNTRY[key] || [];

  const cats = await Promise.all(
    checklist.categories.map(async (cat: any) => {
      if (!Array.isArray(cat?.items)) return cat;

      const items = await Promise.all(
        cat.items.map(async (it: any) => {
          // já tem link? mantém (desde que saneado antes na pipeline)
          if (it?.link) return it;

          const blob = `${it?.id ?? ''} ${it?.task ?? ''} ${it?.details ?? ''}`;

          // 1) regras do país
          for (const rule of countryRules) {
            if (rule.match.test(blob)) {
              const safe = await guardLinkIfOfficial(countryName, rule.url);
              if (safe) return { ...it, link: safe, ctaLabel: rule.cta };
            }
          }

          // 2) regras globais (ex.: certidão PF)
          for (const rule of GLOBAL_RULES) {
            if (rule.match.test(blob)) {
              const safe = await guardLinkIfOfficial(countryName, rule.url);
              if (safe) return { ...it, link: safe, ctaLabel: rule.cta };
            }
          }

          // 3) continua sem link (ex.: currículo, carta, proficiência)
          return it;
        })
      );

      return { ...cat, items };
    })
  );

  return { ...checklist, categories: cats };
}
