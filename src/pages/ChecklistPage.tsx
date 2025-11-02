import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChecklistForm } from '../components/ChecklistForm';
import { ChecklistDisplay } from '../components/ChecklistDisplay';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { generateChecklist, fetchVisasForCountry, fetchVisaSummary } from '../services/geminiService';
import { addChecklist } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import type { Checklist, VisaOption, VisaSummary } from '../types';
import { VisaSummaryDisplay } from '../components/VisaSummaryDisplay';

const ChecklistPage: React.FC = () => {
  const [destinationCountry, setDestinationCountry] = useState('');
  const [visaType, setVisaType] = useState('');
  const [checklist, setChecklist] = useState<Checklist | null>(null);

  const [isLoading, setIsLoading] = useState(false);         // gerar checklist
  const [isSaving, setIsSaving] = useState(false);           // salvar checklist
  const [error, setError] = useState<string | null>(null);

  const [visaOptions, setVisaOptions] = useState<VisaOption[]>([]);
  const [isFetchingVisas, setIsFetchingVisas] = useState(false);

  const [visaSummary, setVisaSummary] = useState<VisaSummary | null>(null);
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);

  const debounceTimeout = useRef<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Carregar opções de vistos conforme o país (com debounce)
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    setChecklist(null);
    setVisaSummary(null);

    if (destinationCountry.trim().length > 3) {
      setIsFetchingVisas(true);
      setVisaOptions([]);
      setVisaType('');
      setError(null);

      debounceTimeout.current = window.setTimeout(async () => {
        try {
          const options = await fetchVisasForCountry(destinationCountry);
          setVisaOptions(options);
        } catch (err: any) {
          setError(err?.message || 'Falha ao buscar tipos de visto.');
          setVisaOptions([]);
        } finally {
          setIsFetchingVisas(false);
        }
      }, 500);
    } else {
      setVisaOptions([]);
      setVisaType('');
    }

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [destinationCountry]);

  // Buscar resumo do visto selecionado
  useEffect(() => {
    const getSummary = async () => {
      if (!visaType || !destinationCountry) return;

      setIsFetchingSummary(true);
      setVisaSummary(null);
      setError(null);
      setChecklist(null);

      try {
        const summary = await fetchVisaSummary(destinationCountry, visaType);
        setVisaSummary(summary);
      } catch (err: any) {
        setError(err?.message || 'Falha ao carregar o resumo do visto.');
      } finally {
        setIsFetchingSummary(false);
      }
    };

    getSummary();
  }, [visaType, destinationCountry]);

  const handleGenerateChecklist = async () => {
    if (!destinationCountry || !visaType) {
      setError('Por favor, preencha todos os campos do formulário.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setChecklist(null);

    try {
      const generated = await generateChecklist(destinationCountry, visaType);
      setChecklist(generated);
    } catch (err: any) {
      setError((err as Error).message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndRedirect = async () => {
    if (!checklist || !user) return;
    setIsSaving(true);
    try {
      const newId = await addChecklist(user.uid, checklist);
      navigate(`/checklists/${newId}`);
    } catch {
      setError('Falha ao salvar o checklist. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-3 tracking-tight">
          Gerador de Checklist de Imigração
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          Preencha os campos abaixo para criar um guia personalizado para sua jornada.
        </p>
      </div>

      <ChecklistForm
        destinationCountry={destinationCountry}
        setDestinationCountry={setDestinationCountry}
        visaType={visaType}
        setVisaType={setVisaType}
        onGenerate={handleGenerateChecklist}
        isLoading={isLoading}
        isFetchingVisas={isFetchingVisas}
        visaOptions={visaOptions}
      />

      {/* Bloco de informações do visto: só aparece após selecionar um tipo */}
      {visaType && (
        <div
          className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mt-8"
          aria-busy={isFetchingSummary ? 'true' : 'false'}
        >
          {isFetchingSummary && (
            <div className="flex flex-col gap-2 mb-4">
              <LoadingSpinner />
              <p className="text-slate-400 text-sm">
                Carregando informações sobre o visto escolhido… Buscando fontes oficiais e atualizadas.
              </p>
            </div>
          )}

          {error && !isLoading && !isFetchingSummary && <ErrorDisplay message={error} />}

          {/* Só renderiza conteúdo quando existir dado ou estiver carregando */}
          {(visaSummary || isFetchingSummary) && (
            <VisaSummaryDisplay summary={visaSummary} isLoading={isFetchingSummary} />
          )}
        </div>
      )}

      {/* Bloco do checklist: só aparece ao gerar (loading) ou quando já existir */}
      {(isLoading || checklist) && (
        <div
          className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mt-8"
          aria-busy={isLoading ? 'true' : 'false'}
        >
          {isLoading && (
            <div className="flex flex-col gap-2 mb-4">
              <LoadingSpinner />
              <p className="text-slate-400 text-sm">
                Gerando checklist personalizado com base no país e tipo de visto selecionados…
              </p>
              <p className="text-slate-500 text-xs">
                Incluiremos links oficiais sempre que possível. Isso pode levar alguns segundos.
              </p>
            </div>
          )}

          {error && !isFetchingSummary && !isLoading && <ErrorDisplay message={error} />}

          {checklist && (
            <>
              <div className="text-center my-6">
                <button
                  onClick={handleSaveAndRedirect}
                  disabled={isSaving}
                  className="w-full md:w-auto inline-flex justify-center items-center px-12 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-slate-400"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Checklist e Começar'}
                </button>
              </div>

              <ChecklistDisplay checklist={checklist} onCheckItem={() => {}} isViewOnly />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChecklistPage;
