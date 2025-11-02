// src/constants/countries.ts
export type SupportedCountry = 'Portugal' | 'Irlanda' | 'Alemanha' | 'Austrália';

export const SUPPORTED_COUNTRIES: Array<{ label: SupportedCountry; value: SupportedCountry }> = [
  { label: 'Portugal',  value: 'Portugal'  },
  { label: 'Irlanda',   value: 'Irlanda'   },
  { label: 'Alemanha',  value: 'Alemanha'  },
  { label: 'Austrália', value: 'Austrália' },
];
