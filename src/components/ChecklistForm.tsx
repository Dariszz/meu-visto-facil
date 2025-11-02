import React from 'react';
import type { VisaOption } from '../types';

interface ChecklistFormProps {
  destinationCountry: string;
  setDestinationCountry: (value: string) => void;
  visaType: string;
  setVisaType: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isFetchingVisas: boolean;
  visaOptions: VisaOption[];
}

const commonInputClasses = "w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out bg-slate-700 text-slate-200 placeholder:text-slate-500";

const FormInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={label} className="block text-sm font-medium text-slate-300 mb-1">
            {label}
        </label>
        <input
            type="text"
            id={label}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={commonInputClasses}
        />
    </div>
);


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
  const isVisaSelectDisabled = !destinationCountry;

  const getVisaSelectPlaceholder = () => {
    if (isFetchingVisas) return "Buscando vistos...";
    if (isVisaSelectDisabled) return "Digite um país primeiro";
    if (visaOptions.length === 0) return "Nenhum visto encontrado";
    return "Selecione um visto";
  };

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg border border-slate-700 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <FormInput 
            label="País de Destino"
            value={destinationCountry}
            onChange={(e) => setDestinationCountry(e.target.value)}
            placeholder="Ex: Portugal ou Irlanda"
        />
        
        <div>
            <label htmlFor="visaType" className="block text-sm font-medium text-slate-300 mb-1">
                Tipo de Visto
            </label>
            <select
                id="visaType"
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                disabled={isVisaSelectDisabled || isFetchingVisas || visaOptions.length === 0}
                className={`${commonInputClasses} ${isVisaSelectDisabled || isFetchingVisas ? 'bg-slate-800 cursor-not-allowed' : ''}`}
            >
                <option value="" disabled>
                  {getVisaSelectPlaceholder()}
                </option>
                {visaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={onGenerate}
          disabled={isLoading || isFetchingVisas}
          className="w-full md:w-auto inline-flex justify-center items-center px-12 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {isLoading ? 'Gerando...' : 'Gerar Checklist'}
        </button>
      </div>
    </div>
  );
};
