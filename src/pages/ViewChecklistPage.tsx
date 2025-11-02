import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { getChecklist, updateChecklistItemStatus } from '../services/firestoreService';
import { ChecklistDisplay } from '../components/ChecklistDisplay';
import { useAuth } from '../contexts/AuthContext';
import type { Checklist } from '../types';

const ViewChecklistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchChecklist = async () => {
      setIsLoading(true);
      try {
        const data = await getChecklist(id);
        // Garante que o checklist pertence ao usuário logado
        if (data && data.userId === user?.uid) {
          setChecklist(data);
        } else {
          setChecklist(null);
        }
      } catch {
        setError('Não foi possível carregar o checklist.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchChecklist();
    }
  }, [id, user]);

  // Atualiza item por itemId: encontra índices e chama o serviço (categoryIndex, itemIndex)
  const handleCheckItem = async (itemId: string, checked: boolean) => {
    if (!id || !checklist) return;

    // encontra índices do item
    const categoryIndex = checklist.categories.findIndex(cat =>
      cat.items.some(it => it.id === itemId)
    );
    if (categoryIndex === -1) return;

    const itemIndex = checklist.categories[categoryIndex].items.findIndex(it => it.id === itemId);
    if (itemIndex === -1) return;

    // otimista
    const prev = checklist;
    const nextCategories = checklist.categories.map((cat, ci) => {
      if (ci !== categoryIndex) return cat;
      return {
        ...cat,
        items: cat.items.map((it, ii) => (ii === itemIndex ? { ...it, checked } : it)),
      };
    });
    setChecklist({ ...checklist, categories: nextCategories });

    try {
      await updateChecklistItemStatus(id, categoryIndex, itemIndex, checked);
    } catch (e) {
      // reverte se falhar
      setChecklist(prev);
      setError('Falha ao atualizar o item. Tente novamente.');
      // opcional: limpar erro depois de alguns segundos
      setTimeout(() => setError(null), 4000);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Carregando checklist...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/checklists" className="text-sky-500 hover:underline">Voltar para Meus Checklists</Link>
      </div>
    );
  }

  if (!checklist) {
    // checklist inexistente ou não pertence ao usuário
    return <Navigate to="/checklists" replace />;
  }

  const totalItems = checklist.categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = checklist.categories.reduce((acc, cat) => acc + cat.items.filter(item => item.checked).length, 0);
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Progresso</h2>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className="bg-sky-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-sm text-slate-400 mt-1">
          {progress}% concluído ({checkedItems} de {totalItems})
        </p>
      </div>

      <ChecklistDisplay checklist={checklist} onCheckItem={handleCheckItem} />
    </div>
  );
};

export default ViewChecklistPage;
