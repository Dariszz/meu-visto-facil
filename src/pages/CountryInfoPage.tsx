import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { countryData, Country } from '../content/countryInfo';

const CountryInfoPage: React.FC = () => {
    const { countryName } = useParams<{ countryName: string }>();

    // Type guard para garantir que countryName é uma chave válida de countryData
    const isCountryKey = (key: string): key is keyof typeof countryData => {
        return key === 'portugal' || key === 'irlanda';
    }

    if (!countryName || !isCountryKey(countryName)) {
        // Redireciona para a home se a URL do país for inválida
        return <Navigate to="/" replace />;
    }
    
    const data: Country = countryData[countryName];

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                <span className="text-5xl mr-5">{data.flag}</span>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{data.title}</h1>
                    <p className="text-slate-600 dark:text-slate-400">{data.subtitle}</p>
                </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none prose-h2:text-sky-700 dark:prose-h2:text-sky-400 prose-a:text-sky-600 dark:prose-a:text-sky-400">
                <p>{data.introduction}</p>

                <h2>Principais Tipos de Visto</h2>
                <ul>
                    {data.visas.map(visa => (
                        <li key={visa.name}>
                            <strong>{visa.name}:</strong> {visa.description}
                        </li>
                    ))}
                </ul>

                <h2>Qualidade de Vida</h2>
                <p>{data.qualityOfLife}</p>

                <h2>Links Oficiais</h2>
                <ul>
                    {data.officialLinks.map(link => (
                         <li key={link.name}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a></li>
                    ))}
                </ul>
            </div>
             <div className="mt-8 text-center">
                <Link to="/checklists/new" className="inline-flex justify-center items-center px-12 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105">
                    Gerar meu Checklist Personalizado
                </Link>
            </div>
        </div>
    );
};

export default CountryInfoPage;
