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
        };
        
        const fetchChecklist = async () => {
            setIsLoading(true);
            try {
                const data = await getChecklist(id);
                // Security check: ensure the fetched checklist belongs to the logged-in user
                if (data && data.userId === user?.uid) {
                    setChecklist(data);
                } else {
                    setChecklist(null); // Or set an error for unauthorized access
                }
            } catch (err) {
                setError("Não foi possível carregar o checklist.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) { // Only fetch if user is logged in
            fetchChecklist();
        }
    }, [id, user]);

    const handleCheckItem = async (itemId: string, checked: boolean) => {
        if (id && checklist) {
            try {
                const updatedCategories = checklist.categories.map(category => ({
                    ...category,
                    items: category.items.map(item => 
                        item.id === itemId ? { ...item, checked } : item
                    ),
                }));
                
                // Optimistic update for better UX
                setChecklist({ ...checklist, categories: updatedCategories });
                
                // Persist change to Firestore
                await updateChecklistItemStatus(id, updatedCategories);
                
            } catch (err) {
                // Optional: revert optimistic update and show an error
                console.error("Failed to update item status:", err);
                // Re-fetch or revert state here if needed
            }
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
        // This will trigger if the checklist doesn't exist or doesn't belong to the user
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
                    ></div>
                </div>
                <p className="text-right text-sm text-slate-400 mt-1">{progress}% concluído ({checkedItems} de {totalItems})</p>
            </div>
            <ChecklistDisplay checklist={checklist} onCheckItem={handleCheckItem} />
        </div>
    );
};

export default ViewChecklistPage;