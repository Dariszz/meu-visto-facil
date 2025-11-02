import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { CountryInfoSection } from '../components/CountryInfoSection';
import { countryData } from '../content/countryInfo';
import { TipsSection } from '../components/TipsSection';
import { tipsData } from '../content/tipsData';

const HomePage: React.FC = () => {
    const [selectedCountry, setSelectedCountry] = useState<keyof typeof countryData>('portugal');
    
    const countryOptions: { key: keyof typeof countryData; name: string; flag: string }[] = [
        { key: 'portugal', name: 'Portugal', flag: '🇵🇹' },
        { key: 'irlanda', name: 'Irlanda', flag: '🇮🇪' },
        { key: 'alemanha', name: 'Alemanha', flag: '🇩🇪' },
        { key: 'australia', name: 'Austrália', flag: '🇦🇺' },
    ];

    return (
        <div>
            <Hero />

            <div className="max-w-4xl mx-auto mb-12 text-center bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-xl font-bold text-sky-400 mb-3">Sobre o Projeto</h3>
                <p className="text-slate-300 leading-relaxed">
                    Este projeto é o TCC de Engenharia de Software e nasce de uma dor real de quem quer morar fora: falta de clareza, documentos espalhados e medo de perder prazos. Nossa proposta é construir uma plataforma de checklist de imigração para brasileiros com foco em Portugal, Irlanda, Alemanha e Austrália. O objetivo é transformar informação confiável em ações simples: o usuário entende o caminho, reúne documentos na ordem certa e monitora o progresso sem ansiedade.
                </p>
            </div>

            <div className="max-w-7xl mx-auto">
                 <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-200 mb-8">Informações sobre os Destinos</h2>
                
                <div className="flex justify-center flex-wrap gap-2 sm:gap-4 mb-8">
                    {countryOptions.map((country) => (
                        <button
                            key={country.key}
                            onClick={() => setSelectedCountry(country.key)}
                            className={`px-4 py-2 text-sm sm:text-base font-medium rounded-full transition-colors duration-200 flex items-center gap-2 ${
                                selectedCountry === country.key 
                                ? 'bg-sky-600 text-white shadow-md' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            <span className="text-lg">{country.flag}</span>
                            {country.name}
                        </button>
                    ))}
                </div>

                <div className="mt-8">
                    <CountryInfoSection data={countryData[selectedCountry]} />
                </div>

                <TipsSection tips={tipsData} />

                <div className="text-center mt-12 md:mt-16 py-12 px-4 bg-slate-800 rounded-xl border border-slate-700">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">Pronto para dar o próximo passo?</h3>
                    <p className="max-w-2xl mx-auto text-slate-400 mb-8 leading-relaxed">
                        Deixe nossa IA criar um guia detalhado e personalizado para sua jornada de imigração. Comece agora e planeje sua mudança com total confiança.
                    </p>
                    <Link 
                        to="/checklists/new" 
                        className="inline-flex justify-center items-center px-12 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105"
                    >
                        Gerar Checklist Personalizado
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
