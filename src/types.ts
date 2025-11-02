export interface ChecklistItem {
  id: string;
  task: string;
  details: string;
  checked: boolean;
  link?: string;
}

export interface ChecklistCategory {
  category: string;
  items: ChecklistItem[];
}

export interface Checklist {
  title: string;
  introduction: string;
  categories: ChecklistCategory[];
  disclaimer: string;
  id?: string;
  createdAt?: string;
  userId?: string;
}

export interface VisaOption {
  name: string;
  value: string;
}

export interface VisaSummary {
  summary: string;
  officialLink: string;
  sourceType: 'Oficial' | 'Não Oficial';
}