// src/components/CountrySelect.tsx
import React from 'react';
import { SUPPORTED_COUNTRIES, SupportedCountry } from '../constants/countries';

interface CountrySelectProps {
  value: string;
  onChange: (v: SupportedCountry | '') => void;
  disabled?: boolean;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="country" className="text-sm font-medium text-slate-300">
        País de destino
      </label>
      <select
        id="country"
        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
        value={value}
        onChange={(e) => onChange((e.target.value || '') as SupportedCountry | '')}
        disabled={disabled}
      >
        <option value="">Selecione um país</option>
        {SUPPORTED_COUNTRIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-400">
        Suporte atual: Portugal, Irlanda, Alemanha e Austrália.
      </p>
    </div>
  );
};
