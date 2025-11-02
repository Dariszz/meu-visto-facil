import React from 'react';
import type { VisaSummary } from '../types';

interface VisaSummaryDisplayProps {
  summary: VisaSummary | null;
  isLoading: boolean;
}

const LoadingSkeleton: React.FC = () => (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 my-6 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            <div className="h-3 bg-slate-700 rounded w-4/6"></div>
        </div>
        <div className="h-3 bg-slate-700 rounded w-1/4 mt-4"></div>
    </div>
);

// Helper para converter texto com **negrito** em elementos React
const renderWithBold = (text: string) => {
    // Divide o texto pelos marcadores de negrito, mantendo os delimitadores
    const parts = text.split(/(\*\*.*?\*\*)/g);
    // Filtra partes vazias e mapeia para texto ou elementos <strong>
    return parts.filter(part => part).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Remove os asteriscos e renderiza o conteúdo em negrito
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

export const VisaSummaryDisplay: React.FC<VisaSummaryDisplayProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!summary) {
    return null;
  }

  // Remove o aviso gerado pela IA do texto, pois já temos um componente visual para isso.
  const cleanSummary = summary.summary.replace('AVISO: A informação a seguir não foi obtida de uma fonte oficial do governo, mas sim de fontes secundárias, e deve ser verificada.', '').trim();


  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg border border-slate-700 my-6 transition-opacity duration-500 ease-in-out">
        {summary.sourceType === 'Não Oficial' && (
             <div className="mb-4 p-4 rounded-lg bg-amber-900/20 border border-amber-800">
                <p className="text-sm text-amber-300">
                    <strong>Atenção:</strong> A informação abaixo não foi encontrada nos sites oficiais do governo. Ela foi obtida de fontes secundárias e deve ser usada como um guia preliminar. Sempre confirme os detalhes nos canais oficiais.
                </p>
            </div>
        )}
        <h2 className="text-xl font-semibold text-sky-400 mb-3">
            Sobre este Visto
        </h2>
        <div className="prose prose-sm prose-invert max-w-none text-slate-300 prose-p:my-4">
           {cleanSummary.split('\n').map((paragraph, index) => (
                <p key={index}>{renderWithBold(paragraph)}</p>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
             <a 
                href={summary.officialLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300"
            >
                🔗
                <span className="ml-2">{summary.sourceType === 'Oficial' ? 'Fonte Oficial' : 'Ver Fonte'}</span>
             </a>
        </div>
    </div>
  );
};
