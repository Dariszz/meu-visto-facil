import React from 'react';
import { Link } from 'react-router-dom';
import type { Country } from '../content/countryInfo';

interface CountryInfoSectionProps {
    data: Country;
}

export const CountryInfoSection: React.FC<CountryInfoSectionProps> = ({ data }) => {
    return (
        <article className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg border border-slate-700 h-full flex flex-col">
            <div className="flex items-center border-b border-slate-700 pb-4 mb-6">
                <span className="text-5xl mr-5">{data.flag}</span>
                <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-50">{data.title}</h3>
                    <p className="text-slate-400">{data.subtitle}</p>
                </div>
            </div>

            <div className="prose prose-invert max-w-none prose-h4:text-sky-400 prose-a:text-sky-400 flex-grow prose-p:leading-relaxed prose-p:mb-6">
                <p>{data.introduction}</p>

                <h4>Principais Tipos de Visto</h4>
                <ul>
                    {data.visas.map(visa => (
                        <li key={visa.name}>
                            <strong>{visa.name}:</strong> {visa.description}
                        </li>
                    ))}
                </ul>

                <h4>Qualidade de Vida</h4>
                <p>{data.qualityOfLife}</p>
                
                {data.latestNews && (
                    <div className="mt-6 p-4 rounded-lg bg-amber-900/20 border border-amber-800">
                        <h4 className="!text-amber-400 !mt-0">{data.latestNews.title}</h4>
                        <p className="text-amber-300 text-sm">{data.latestNews.content}</p>
                    </div>
                )}

                <h4 className="mt-6">Links Oficiais</h4>
                <ul>
                    {data.officialLinks.map(link => (
                         <li key={link.name}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a></li>
                    ))}
                </ul>
            </div>
        </article>
    );
};
