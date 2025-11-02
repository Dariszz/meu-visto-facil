import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type { Checklist } from '../types';

/**
 * Referência da coleção no Firestore
 */
const checklistsCollection = collection(db, 'checklists');

/**
 * Cria um novo checklist para o usuário autenticado.
 * Garante que userId e createdAt sejam gravados (compatível com as regras do Firestore).
 */
export const addChecklist = async (userId: string, checklist: Checklist): Promise<string> => {
  if (!userId) throw new Error('Usuário não autenticado.');
  // Evita sobrescrever id/createdAt ou enviar chaves indefinidas
  const { id, createdAt, userId: _ignoredUserId, ...rest } = checklist as any;

  const payload = {
    ...rest,
    userId,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(checklistsCollection, payload);
  return docRef.id;
};

/**
 * Retorna todos os checklists do usuário, ordenados por createdAt desc.
 */
export const getUserChecklists = async (userId: string): Promise<Checklist[]> => {
  if (!userId) return [];

  const baseQuery = query(checklistsCollection, where('userId', '==', userId));

  try {
    // tentativa com orderBy (mais eficiente, mas pode exigir índice composto)
    const q = query(baseQuery, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    return snap.docs.map(d => {
      const data = d.data() as any;
      return {
        ...(data as Checklist),
        id: d.id,
        createdAt:
          (data.createdAt && typeof (data.createdAt as any).toDate === 'function')
            ? (data.createdAt as any).toDate().toISOString()
            : data.createdAt ?? null,
        userId: data.userId,
      } as any;
    });
  } catch (err: any) {
    // se faltar índice, refaz sem orderBy e ordena no cliente
    if (err?.code === 'failed-precondition') {
      const snap = await getDocs(baseQuery);
      const items = snap.docs.map(d => {
        const data = d.data() as any;
        const createdIso =
          (data.createdAt && typeof (data.createdAt as any).toDate === 'function')
            ? (data.createdAt as any).toDate().toISOString()
            : data.createdAt ?? null;

        return {
          ...(data as Checklist),
          id: d.id,
          createdAt: createdIso,
          userId: data.userId,
        } as any;
      });

      // ordena no cliente por createdAt desc, nulos por último
      return items.sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : -Infinity;
        const tb = b.createdAt ? Date.parse(b.createdAt) : -Infinity;
        return tb - ta;
      });
    }

    // outras falhas (ex.: permission-denied) propagam
    throw err;
  }
};

/**
 * Lê um checklist pelo id.
 */
export const getChecklist = async (checklistId: string): Promise<Checklist | null> => {
  const ref = doc(db, 'checklists', checklistId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as any;
  return {
    ...(data as Checklist),
    id: snap.id,
    createdAt:
      (data.createdAt && typeof (data.createdAt as any).toDate === 'function')
        ? (data.createdAt as any).toDate().toISOString()
        : data.createdAt ?? null,
    userId: data.userId,
  } as any;
};

/**
 * Atualiza o status (checked) de um item do checklist
 * regravando o array de categorias de forma imutável.
 */
export const updateChecklistItemStatus = async (
  checklistId: string,
  categoryIndex: number,
  itemIndex: number,
  checked: boolean
): Promise<void> => {
  const ref = doc(db, 'checklists', checklistId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Checklist não encontrado.');

  const data = snap.data() as any;
  const categories = Array.isArray(data.categories) ? [...data.categories] : [];

  if (!categories[categoryIndex] || !categories[categoryIndex].items?.[itemIndex]) {
    throw new Error('Item inválido.');
  }

  const newCategories = categories.map((cat: any, i: number) => {
    if (i !== categoryIndex) return cat;
    const items = cat.items.map((it: any, j: number) => (j === itemIndex ? { ...it, checked } : it));
    return { ...cat, items };
  });

  await updateDoc(ref, { categories: newCategories });
};

/**
 * Exclui um checklist pelo id.
 */
export const deleteUserChecklist = async (checklistId: string): Promise<void> => {
  const ref = doc(db, 'checklists', checklistId);
  await deleteDoc(ref);
};
