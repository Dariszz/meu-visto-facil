import { GoogleGenAI, Type } from '@google/genai';
import type { Checklist, VisaOption, VisaSummary } from '../types';

function responseText(r: any): string {
  try {
    const t = r?.text;
    if (typeof t === 'string') return t;
    if (typeof t === 'function') return t.call(r);
    const c = r?.candidates?.[0]?.content?.parts?.find((p:any)=>p?.text)?.text;
    if (typeof c === 'string') return c;
  } catch {}
  throw new Error('Resposta do modelo sem texto.');
}


const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey });

const visaListSchema = {
    type: Type.OBJECT,
    properties: {
        visas: {
            type: Type.ARRAY,
            description: "Uma lista de vistos de longa duração disponíveis.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: 'O nome comum ou oficial do visto. Exemplo: "Visto de Nômade Digital (D8)".'
                    },
                    value: {
                        type: Type.STRING,
                        description: 'Uma descrição um pouco mais detalhada para ser usada no prompt de geração do checklist. Exemplo: "Visto de Nômade Digital (D8) para trabalho remoto".'
                    }
                },
                required: ['name', 'value'],
            }
        }
    },
    required: ['visas'],
};

const getContextForCountry = (countryName: string): string => {
    const lowerCaseCountry = countryName.toLowerCase();
    if (lowerCaseCountry.includes('portugal')) {
        return `
            Contexto Importante para Portugal (Atualizações de 2025):
            - A Lei nº 61/2025, de 22 de Outubro de 2025, extinguiu os processos de residência baseados em "manifestação de interesse".
            - O visto de procura de trabalho genérico foi descontinuado e substituído pelo "visto para procura de trabalho qualificado", que ainda aguarda regulamentação detalhada para implementação.
            - O Sistema de Entrada/Saída (EES) da União Europeia está em vigor, exigindo registro biométrico na primeira entrada.
        `;
    }
    if (lowerCaseCountry.includes('irlanda')) {
        return `
            Contexto Importante para a Irlanda (Atualizações de 2025):
            - Desde 28 de Abril de 2025, as solicitações de permissão de trabalho (Employment Permits) são feitas através de um novo portal online do DETE (Department of Enterprise, Trade and Employment).
            - A lógica principal permanece: obter o 'Employment Permit' primeiro, antes de solicitar o visto de longa duração.
            - O registro inicial em Dublin (antigo GNIB) agora requer um agendamento prévio obrigatório através de um sistema online.
        `;
    }
    if (lowerCaseCountry.includes('alemanha')) {
        return `
            Contexto Importante para a Alemanha (Atualizações de 2024/2025):
            - A Lei de Imigração Qualificada (Fachkräfteeinwanderungsgesetz) foi totalmente implementada, facilitando a entrada de trabalhadores qualificados.
            - O "Cartão de Oportunidade" (Chancenkarte), um sistema de pontos para procurar emprego, está em vigor desde 1 de junho de 2024.
            - O reconhecimento da qualificação profissional ("Anerkennung") continua sendo um passo fundamental para muitos vistos de trabalho.
            - Os limites salariais para o Cartão Azul da UE são ajustados anualmente.
        `;
    }
    if (lowerCaseCountry.includes('austrália')) {
        return `
            Contexto Importante para a Austrália (Atualizações de 2024/2025):
            - O sistema de imigração é fortemente baseado no sistema de pontos "SkillSelect". A pontuação de corte pode variar.
            - O governo australiano frequentemente atualiza as listas de ocupações em demanda (Skilled Occupation Lists).
            - A avaliação de competências ("Skills Assessment") por um órgão autorizado é uma etapa obrigatória e pré-requisito para a maioria dos vistos qualificados.
            - Há um foco governamental crescente em vistos que incentivam a migração para áreas regionais.
        `;
    }
    return '';
};

export const fetchVisasForCountry = async (countryName: string): Promise<VisaOption[]> => {
    const contextualInfo = getContextForCountry(countryName);
    const prompt = `
        Aja como um especialista em imigração com acesso às informações mais recentes.
        Para o país "${countryName}", liste os principais tipos de visto de longa duração (residência) que estão atualmente disponíveis para cidadãos brasileiros.

        ${contextualInfo}

        Com base nesse contexto, priorize vistos de trabalho (qualificado, nômade digital, empreendedorismo) e outras categorias importantes como estudo ou rendimentos próprios.
        Sua resposta deve seguir estritamente o esquema JSON fornecido. Não adicione nenhuma explicação fora do JSON.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: visaListSchema,
            },
        });
        
        const text = responseText(response).trim();
        const parsedJson = JSON.parse(text);
        
        return parsedJson.visas || [];

    } catch (error) {
        console.error('Error fetching visa list from Gemini API:', error);
        throw new Error(`Falha ao buscar os vistos para ${countryName}.`);
    }
};

export const fetchVisaSummary = async (countryName: string, visaType: string): Promise<VisaSummary> => {
    let officialSitesList = '';
    const lowerCaseCountry = countryName.toLowerCase();

    if (lowerCaseCountry.includes('portugal')) {
        officialSitesList = '"vistos.mne.gov.pt", "aima.gov.pt", "vfsglobal.com/portugal/"';
    } else if (lowerCaseCountry.includes('irlanda')) {
        officialSitesList = '"irishimmigration.ie", "enterprise.gov.ie"';
    } else if (lowerCaseCountry.includes('alemanha')) {
        officialSitesList = '"make-it-in-germany.com/pt/", "brasil.diplo.de", "auswaertiges-amt.de"';
    } else if (lowerCaseCountry.includes('austrália')) {
        officialSitesList = '"immi.homeaffairs.gov.au"';
    }

    const prompt = `
        Aja como um consultor de imigração preciso e rigoroso. Sua tarefa é fornecer um resumo detalhado sobre o visto "${visaType}" para o país "${countryName}".
        Use a busca do Google para obter as informações mais recentes.

        Siga estas regras estritamente:

        1.  **Pesquisa Prioritária:** Primeiro, tente encontrar as informações EXCLUSIVAMENTE nos seguintes domínios oficiais: ${officialSitesList}. A sua prioridade máxima é usar estas fontes.

        2.  **Pesquisa Secundária (Contingência):** Se, e SOMENTE SE, você não encontrar absolutamente nenhuma informação relevante sobre este visto nos sites oficiais listados, você pode procurar em outras fontes confiáveis.

        3.  **Formato da Resposta:** Sua resposta DEVE seguir o formato exato abaixo, sem nenhuma explicação ou formatação adicional. Para destacar títulos de seções (ex: "Quem pode solicitar"), coloque-os em negrito usando asteriscos duplos (ex: **Requisitos Principais**). É crucial que você adicione uma linha em branco (resultando em um parágrafo vazio) entre o texto de uma seção e o título da seção seguinte para melhorar a legibilidade.

            SourceType: [Preencha com "Oficial" se a informação veio dos sites prioritários, ou "Não Oficial" se veio de outras fontes]
            Resumo: [Seu resumo detalhado aqui. Se a fonte for "Não Oficial", você DEVE começar o resumo com a seguinte frase: "AVISO: A informação a seguir não foi obtida de uma fonte oficial do governo, mas sim de fontes secundárias, e deve ser verificada."]
            Link: [URL da fonte principal que você usou]
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const text = responseText(response).trim();

        // Extrai os dados usando expressões regulares
        const sourceTypeMatch = text.match(/SourceType:\s*(Oficial|Não Oficial)/);
        const summaryMatch = text.match(/Resumo:\s*([\s\S]*?)\s*Link:/);
        const linkMatch = text.match(/Link:\s*(https?:\/\/[^\s]+)/);

        const sourceType = sourceTypeMatch ? (sourceTypeMatch[1] as 'Oficial' | 'Não Oficial') : 'Não Oficial';
        const summary = summaryMatch ? summaryMatch[1].trim() : 'Não foi possível gerar um resumo. Verifique as informações nos sites oficiais.';
        const officialLink = linkMatch ? linkMatch[1].trim() : '';
        
        if (!officialLink) {
             console.warn('Link not found in Gemini response for visa summary.');
        }

        return { summary, officialLink, sourceType };

    } catch (error) {
        console.error('Error fetching visa summary from Gemini API:', error);
        throw new Error(`Falha ao buscar o resumo para o visto selecionado.`);
    }
};


export const generateChecklist = async (
  destinationCountry: string,
  visaType: string
): Promise<Checklist> => {
  const contextualInfo = getContextForCountry(destinationCountry);
  const prompt = `
    Aja como um consultor de imigração especialista e assistente de pesquisa.
    Sua tarefa é gerar um checklist de imigração detalhado, passo a passo, em Português do Brasil (pt-BR), para um cidadão com nacionalidade Brasileira aplicando para um visto de ${visaType} para ${destinationCountry}.
    
    ${contextualInfo}

    **INSTRUÇÕES IMPORTANTES:**
    1.  **Use a Busca:** Utilize a ferramenta de busca do Google para encontrar as informações mais atuais e os links oficiais.
    2.  **Formato JSON:** Sua resposta DEVE ser um único bloco de código JSON, sem nenhum texto ou formatação antes ou depois (como \`\`\`json). O JSON deve ser válido.
    3.  **Links Oficiais:** Para cada tarefa que exija uma ação em um site externo (preencher um formulário, agendar, ler um guia oficial), você DEVE incluir o URL direto e oficial no campo "link". Se não houver link, omita o campo.
    
    **ESTRUTURA DO JSON (Siga estritamente):**
    {
      "title": "String // Título conciso. Ex: 'Checklist de Imigração: Visto de Nômade Digital para Portugal'",
      "introduction": "String // Breve parágrafo introdutório.",
      "categories": [
        {
          "category": "String // Nome da categoria. Ex: 'Documentos Pré-Aplicação'",
          "items": [
            {
              "id": "String // Identificador único em kebab-case. Ex: 'reunir-comprovante-financeiro'",
              "task": "String // A tarefa principal. Ex: 'Reunir Comprovação de Meios Financeiros'",
              "details": "String // Explicação detalhada da tarefa.",
              "link": "String? // URL oficial e direto (opcional)."
            }
          ]
        }
      ],
      "disclaimer": "String // Aviso padrão informando que fontes oficiais devem ser consultadas."
    }

    Com base no contexto crucial fornecido, gere o checklist no formato JSON especificado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    let text = responseText(response).trim();
    
    // O modelo pode envolver o JSON em ```json ... ```, então limpamos isso.
    if (text.startsWith('```json')) {
        text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
        text = text.substring(3, text.length - 3).trim();
    }

    const parsedJson = JSON.parse(text);

    // Adiciona a propriedade 'checked' a cada item, que não faz parte do esquema de geração da IA
    const checklistWithChecked = {
        ...parsedJson,
        categories: parsedJson.categories.map((category: any) => ({
            ...category,
            items: category.items.map((item: any) => ({
                ...item,
                checked: false,
            })),
        })),
    };
    
    return checklistWithChecked as Checklist;

  } catch (error) {
    console.error('Error generating checklist from Gemini API:', error);
    throw new Error('Falha ao gerar o checklist. Por favor, tente novamente mais tarde.');
  }
};