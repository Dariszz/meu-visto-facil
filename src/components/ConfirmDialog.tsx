import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Confirmar ação',
  message = 'Tem certeza de que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // fecha com ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel]);

  // foca no “Cancelar” ao abrir (acessibilidade)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelBtnRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-live="assertive"
    >
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="relative z-10 w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-2xl"
      >
        <h2 id="confirm-title" className="text-xl font-semibold text-slate-50 mb-2">
          {title}
        </h2>
        <p id="confirm-message" className="text-slate-300 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
          >
            {loading ? 'Excluindo…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
