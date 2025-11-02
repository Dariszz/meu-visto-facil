import React from 'react';
import type { Checklist, ChecklistItem as ChecklistItemType } from '../types';

interface ChecklistDisplayProps {
  checklist: Checklist;
  onCheckItem: (itemId: string, checked: boolean) => void;
  isViewOnly?: boolean;
}

const ChecklistItem: React.FC<{ item: ChecklistItemType; onCheck: (id: string, checked: boolean) => void; isViewOnly?: boolean; }> = ({ item, onCheck, isViewOnly }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-slate-700 last:border-b-0">
        <input
            id={item.id}
            type="checkbox"
            checked={item.checked}
            onChange={(e) => !isViewOnly && onCheck(item.id, e.target.checked)}
            disabled={isViewOnly}
            className="mt-1 h-5 w-5 rounded border-slate-600 text-sky-600 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex-1">
            <label htmlFor={item.id} className={`font-semibold text-slate-200 ${isViewOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                {item.task}
            </label>
            <p className="text-sm text-slate-400 mt-3">
                {item.details}
            </p>
            {item.link && (
                <div className="mt-2">
                    <a 
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Acessar link oficial
                    </a>
                </div>
            )}
        </div>
    </div>
);

export const ChecklistDisplay: React.FC<ChecklistDisplayProps> = ({ checklist, onCheckItem, isViewOnly = false }) => {
    return (
        <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg border border-slate-700 mt-8">
            <header className="border-b border-slate-700 pb-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-50">{checklist.title}</h1>
                <p className="mt-3 text-slate-400 leading-relaxed">{checklist.introduction}</p>
            </header>
            
            <div className="space-y-8">
                {checklist.categories.map((category) => (
                    <section key={category.category}>
                        <h2 className="text-xl font-semibold text-sky-400 mb-4 pb-2 border-b-2 border-sky-800">
                            {category.category}
                        </h2>
                        <div>
                            {category.items.map((item) => (
                                <ChecklistItem key={item.id} item={item} onCheck={onCheckItem} isViewOnly={isViewOnly} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className="mt-8 pt-4 border-t border-slate-700">
                 <p className="text-sm text-slate-400 italic">
                    <strong>Aviso:</strong> {checklist.disclaimer}
                </p>
            </footer>
        </div>
    );
};
