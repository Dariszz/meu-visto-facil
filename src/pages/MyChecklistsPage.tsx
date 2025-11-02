import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserChecklists, deleteUserChecklist } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import type { Checklist } from '../types';
import { FirebaseError } from 'firebase/app';
import { ConfirmDialog } from '../components/ConfirmDialog';

const MyChecklistsPage: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const fetchChecklists = async () => {
      if (!user) {
        setIsLoading(false);
        setChecklists([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userChecklists = await getUserChecklists(user.uid);
        setChecklists(userChecklists || []);
      } catch (err: unknown) {
        const fbErr = err as FirebaseError | any;
        const code = fbErr?.code ?? '';
        const msg = fbErr?.message ?? '';
        const permissionDenied =
          code === 'permission-denied' ||
          /Missing or insufficient permissions/i.test(msg);

        if (permissionDenied) {
          setError(null);
          setChecklists([]);
        } else {
          setError('Falha ao carregar seus checklists.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklists();
  }, [user?.uid]);

  // abre modal
  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  // confirma exclusão
  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteUserChecklist(deletingId);
      setChecklists(prev => prev.filter(c => c.id !== deletingId));
      setConfirmOpen(false);
      setDeletingId(null);
    } catch {
      // feedback inline simples; pode trocar por um toast se quiser
      alert('Falha ao excluir o checklist. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Carregando seus checklists...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!checklists || checklists.length === 0) {
    return (
      <div className="text-center max-w-xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-slate-50 mb-4">Meus Checklists</h1>
        <p className="text-lg text-slate-400 mb-6">
          Você ainda não tem nenhum checklist.
        </p>
        <Link
          to="/checklists/new"
          className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105"
        >
          Gerar checklist
        </Link>

        {/* modal montado mesmo no estado vazio (fica fechado) */}
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Excluir checklist"
          message="Tem certeza de que deseja excluir este checklist? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
          loading={isDeleting}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-50">Meus Checklists</h1>
        <Link
          to="/checklists/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none"
        >
          + Novo Checklist
        </Link>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
        <ul className="divide-y divide-slate-700">
          {checklists.map(checklist => (
            <li
              key={checklist.id}
              className="p-4 sm:p-6 flex justify-between items-center hover:bg-slate-700/50 transition-colors"
            >
              <div>
                <Link to={`/checklists/${checklist.id}`} className="block">
                  <h2 className="text-lg font-semibold text-sky-400">
                    {checklist.title}
                  </h2>
                </Link>
                <p className="text-sm text-slate-400 mt-1">
                  {checklist.createdAt
                    ? `Criado em: ${new Date(checklist.createdAt).toLocaleDateString('pt-BR')}`
                    : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/checklists/${checklist.id}`}
                  className="text-sm font-medium text-sky-400 hover:text-sky-300"
                >
                  Ver
                </Link>
                <button
                  onClick={() => openDeleteDialog(checklist.id!)}
                  className="text-sm font-medium text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-red-900/20"
                  aria-label={`Excluir checklist ${checklist.title}`}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* modal de confirmação */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Excluir checklist"
        message="Tem certeza de que deseja excluir este checklist? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        loading={isDeleting}
      />
    </div>
  );
};

export default MyChecklistsPage;
