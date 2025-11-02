import React from 'react';
import type { Tip } from '../content/tipsData';

interface TipsSectionProps {
  tips: Tip[];
}

export const TipsSection: React.FC<TipsSectionProps> = ({ tips }) => {
  return (
    <div className="max-w-7xl mx-auto mt-12 md:mt-16">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-200 mb-2">
          Dicas da Comunidade
        </h2>
        <p className="text-slate-400 mb-8 max-w-3xl mx-auto">
          <strong>Aviso:</strong> Estes são links para conteúdos de terceiros. Eles servem como inspiração e não representam conselhos oficiais de imigração.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tips.map((tip, index) => (
          <a 
            key={index} 
            href={tip.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group block bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-sky-500/80 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-sky-900/50"
          >
            <div className="relative">
                <img 
                    src={tip.thumbnailUrl} 
                    alt={tip.title} 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold text-sky-400 mb-1">{tip.channel}</p>
              <h3 className="text-lg font-bold text-slate-50 mb-2 group-hover:text-sky-300 transition-colors">{tip.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{tip.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
