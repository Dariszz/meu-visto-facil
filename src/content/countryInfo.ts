export interface Visa {
    name: string;
    description: string;
}

export interface OfficialLink {
    name: string;
    url: string;
}

export interface Country {
    title: string;
    subtitle: string;
    flag: string;
    introduction: string;
    visas: Visa[];
    qualityOfLife: string;
    officialLinks: OfficialLink[];
    latestNews?: {
        title: string;
        content: string;
    }
}

interface CountryData {
    portugal: Country;
    irlanda: Country;
    alemanha: Country;
    australia: Country;
}

export const countryData: CountryData = {
    portugal: {
        title: "Guia de Imigração para Portugal",
        subtitle: "O seu portal para morar na terra de Camões.",
        flag: "🇵🇹",
        introduction: "Portugal tem se destacado como um dos destinos mais atraentes. **Atenção:** Em Outubro de 2025, a Lei nº 61/2025 alterou significativamente os processos, revogando os procedimentos baseados em 'manifestação de interesse' e dando lugar a um sistema mais estruturado com base em contratos ou promessas de trabalho.",
        visas: [
            { name: "Visto D7 (Rendimentos Próprios)", description: "Ideal para aposentados, pensionistas e titulares de rendimentos próprios (como aluguéis, investimentos) que desejam residir em Portugal." },
            { name: "Visto de Nômade Digital", description: "Destinado a profissionais que trabalham remotamente para empresas fora de Portugal, permitindo que residam no país enquanto mantêm seu emprego." },
            { name: "Visto D2 (Empreendedores)", description: "Para quem deseja abrir uma empresa em Portugal ou já possui um negócio no Brasil e quer abrir uma filial. Requer um plano de negócios sólido." },
            { name: "Visto para Procura de Trabalho Qualificado", description: "Substitui o antigo 'Visto de Procura de Trabalho'. Este novo visto, estabelecido pela Lei 61/2025, é destinado a profissionais qualificados e ainda aguarda regulamentação detalhada para sua implementação." },
        ],
        qualityOfLife: "Portugal é consistentemente classificado como um dos países mais seguros do mundo, com um sistema de saúde público de qualidade e um ritmo de vida mais tranquilo, especialmente fora das grandes metrópoles como Lisboa e Porto.",
        latestNews: {
            title: "Atenção: Novo Sistema de Entrada/Saída (EES) da Europa",
            content: "Desde Outubro de 2025, o Sistema de Entrada/Saída (EES) da União Europeia está em vigor. Ele substitui o carimbo manual de passaporte por um registro eletrônico. Na sua primeira entrada no Espaço Schengen (que inclui Portugal), seus dados biométricos (impressões digitais e imagem facial) serão coletados. Prepare-se para este novo procedimento na fronteira."
        },
        officialLinks: [
            { name: "VFS Global - Centro de Solicitação de Vistos", url: "https://www.vfsglobal.com/portugal/brazil/" },
            { name: "Portal das Comunidades Portuguesas (MNE)", url: "https://vistos.mne.gov.pt/pt/" },
            { name: "AIMA - Agência para a Integração, Migrações e Asilo", url: "https://aima.gov.pt/" },
        ]
    },
    irlanda: {
        title: "Guia de Imigração para Irlanda",
        subtitle: "Descubra as oportunidades na Ilha Esmeralda.",
        flag: "🇮🇪",
        introduction: "A Irlanda é um centro de tecnologia e inovação na Europa. **Atualização de 2025:** O processo de solicitação de permissões de trabalho (Employment Permits) foi modernizado com um novo sistema online lançado pelo DETE (Department of Enterprise, Trade and Employment), tornando o processo mais ágil. O princípio fundamental permanece: obter a permissão de trabalho antes de solicitar o visto.",
        visas: [
            { name: "Stamp 2 (Visto de Estudante)", description: "Permite que estudantes de cursos reconhecidos (como inglês ou ensino superior) trabalhem por meio período (20h/semana) durante as aulas e período integral (40h/semana) nas férias." },
            { name: "Critical Skills Employment Permit", description: "Um visto de trabalho para profissionais de áreas com escassez de mão de obra na Irlanda (como TI, engenharia, saúde). É um caminho direto para a residência permanente (Stamp 4)." },
            { name: "General Employment Permit", description: "Visto de trabalho para profissões que não se enquadram na lista de 'Critical Skills'. O empregador precisa provar que não encontrou um candidato adequado na UE." },
            { name: "Stamp 1G (Graduate Scheme)", description: "Permite que estudantes não-europeus que concluíram o ensino superior na Irlanda permaneçam no país por até 24 meses para procurar emprego na sua área." },
        ],
        qualityOfLife: "A Irlanda oferece excelentes salários, um sistema educacional de ponta e um ambiente multicultural. As cidades são vibrantes e seguras, embora o custo de vida, especialmente a moradia em Dublin, seja um dos mais altos da Europa.",
        officialLinks: [
            { name: "Immigration Service Delivery (ISD)", url: "https://www.irishimmigration.ie/" },
            { name: "Employment Permits Online System (DETE)", url: "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/employment-permit-online-system/" },
        ]
    },
    alemanha: {
        title: "Guia de Imigração para Alemanha",
        subtitle: "Oportunidades no coração econômico da Europa.",
        flag: "🇩🇪",
        introduction: "A Alemanha é uma potência industrial com alta demanda por profissionais qualificados. **Importante:** A nova Lei de Imigração Qualificada (Fachkräfteeinwanderungsgesetz), com fases implementadas entre 2023 e 2024, simplificou as regras, introduzindo o 'Cartão de Oportunidade' (Chancenkarte), um sistema de pontos para busca de emprego, e facilitando o reconhecimento de diplomas estrangeiros.",
        visas: [
            { name: "Visto de Trabalho Qualificado", description: "Para profissionais com diploma universitário ou formação técnica/vocacional reconhecida na Alemanha e uma oferta de emprego." },
            { name: "Cartão Azul da UE (Blue Card)", description: "Destinado a profissionais altamente qualificados com diploma universitário e um contrato de trabalho com salário acima do mínimo estipulado." },
            { name: "Visto de Procura de Emprego", description: "Permite que profissionais qualificados permaneçam na Alemanha por até seis meses para procurar uma vaga de trabalho em sua área." },
            { name: "Cartão de Oportunidade (Chancenkarte)", description: "Um novo visto baseado em um sistema de pontos (qualificação, experiência, idade, etc.) que permite a busca por emprego na Alemanha por até um ano." },
        ],
        qualityOfLife: "A Alemanha oferece um padrão de vida excepcional, com segurança, infraestrutura de ponta, sistema de saúde público eficiente e um forte equilíbrio entre vida profissional e pessoal. A burocracia, no entanto, pode ser um desafio inicial.",
        officialLinks: [
            { name: "Make it in Germany", url: "https://www.make-it-in-germany.com/pt/" },
            { name: "Missões Diplomáticas Alemãs no Brasil", url: "https://brasil.diplo.de/br-pt/servicos/visto" },
            { name: "Portal de Reconhecimento de Qualificações", url: "https://www.anerkennung-in-deutschland.de/html/pt/index.php" },
        ]
    },
    australia: {
        title: "Guia de Imigração para Austrália",
        subtitle: "Construa seu futuro na 'Terra Lá de Baixo'.",
        flag: "🇦🇺",
        introduction: "A Austrália é conhecida por sua alta qualidade de vida e economia robusta, atraindo talentos globais através de um sistema de imigração bem estruturado. O processo é majoritariamente baseado em pontos (SkillSelect), que avaliam idade, proficiência em inglês, experiência profissional e qualificações. A validação de diplomas (skills assessment) é uma etapa crucial e obrigatória para a maioria dos vistos qualificados.",
        visas: [
            { name: "Skilled Independent visa (subclass 189)", description: "Visto para trabalhadores qualificados que não possuem patrocínio de um empregador ou indicação de um estado. A seleção é baseada em um sistema de pontos." },
            { name: "Skilled Nominated visa (subclass 190)", description: "Exige a nomeação por um governo estadual ou territorial australiano, concedendo pontos adicionais ao candidato." },
            { name: "Temporary Skill Shortage visa (subclass 482)", description: "Visto de trabalho patrocinado por um empregador australiano para suprir a falta de mão de obra em ocupações específicas." },
            { name: "Student visa (subclass 500)", description: "Para estudantes matriculados em um curso de tempo integral em uma instituição de ensino australiana reconhecida." },
        ],
        qualityOfLife: "Com cidades vibrantes como Sydney e Melbourne, praias mundialmente famosas e uma natureza exuberante, a Austrália oferece um estilo de vida descontraído e seguro. O custo de vida é elevado, especialmente nas grandes cidades, mas os salários são compatíveis.",
        officialLinks: [
            { name: "Department of Home Affairs", url: "https://immi.homeaffairs.gov.au/" },
            { name: "SkillSelect - Expression of Interest", url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" },
        ]
    }
};
