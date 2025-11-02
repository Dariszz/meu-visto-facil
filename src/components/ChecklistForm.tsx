// src/components/ChecklistForm.tsx
import React from 'react';
import { CountrySelect } from './CountrySelect';
import type { VisaOption } from '../types';

interface ChecklistFormProps {
  destinationCountry: string;
  setDestinationCountry: (v: string) => void;
  visaType: string;
  setVisaType: (v: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isFetchingVisas: boolean;
  visaOptions: VisaOption[];
}

export const ChecklistForm: React.FC<ChecklistFormProps> = ({
  destinationCountry,
  setDestinationCountry,
  visaType,
  setVisaType,
  onGenerate,
  isLoading,
  isFetchingVisas,
  visaOptions,
}) => {
  const disableVisaSelect = !destinationCountry || isFetchingVisas;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* País de destino (Select fixo) */}
        <CountrySelect
          value={destinationCountry}
          onChange={(v) => {
            setDestinationCountry(v || '');
            if (visaType) setVisaType('');
          }}
          disabled={isLoading}
        />

        {/* Tipo de visto */}
        <div className="flex flex-col gap-2">
          <label htmlFor="visaType" className="text-sm font-medium text-slate-300">
            Tipo de visto
          </label>
          <select
            id="visaType"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
            disabled={disableVisaSelect || isLoading}
          >
            <option value="">
              {isFetchingVisas ? 'Carregando opções…' : 'Selecione o tipo de visto'}
            </option>
            {visaOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.name}
              </option>
            ))}
          </select>
          {!destinationCountry && (
            <p className="text-xs text-slate-400">Selecione um país para listar os tipos de visto.</p>
          )}
        </div>
      </div>

      {/* Botão centralizado e responsivo */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={onGenerate}
          disabled={!destinationCountry || !visaType || isLoading}
          className="w-full sm:w-auto inline-flex justify-center items-center px-8 md:px-10 py-3 text-base md:text-lg rounded-full bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Gerando…' : 'Gerar checklist'}
        </button>
      </div>
    </div>
  );
};
