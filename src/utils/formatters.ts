import { Category, CategoryId, PaymentMethod } from '../types/finance';

export const CATEGORIES: Record<CategoryId, Category> = {
  salary: {
    id: 'salary',
    name: 'Salário & Prolabore',
    type: 'income',
    icon: 'Briefcase',
    color: '#10B981', // emerald
  },
  investments: {
    id: 'investments',
    name: 'Rendimentos & Dividendos',
    type: 'income',
    icon: 'TrendingUp',
    color: '#06B6D4', // cyan
  },
  freelance: {
    id: 'freelance',
    name: 'Projetos Extras',
    type: 'income',
    icon: 'Sparkles',
    color: '#8B5CF6', // violet
  },
  housing: {
    id: 'housing',
    name: 'Moradia & Contas',
    type: 'expense',
    icon: 'Home',
    color: '#6366F1', // indigo
  },
  food: {
    id: 'food',
    name: 'Alimentação',
    type: 'expense',
    icon: 'Utensils',
    color: '#F59E0B', // amber
  },
  transport: {
    id: 'transport',
    name: 'Transporte & Carro',
    type: 'expense',
    icon: 'Car',
    color: '#3B82F6', // blue
  },
  leisure: {
    id: 'leisure',
    name: 'Lazer & Cultura',
    type: 'expense',
    icon: 'Film',
    color: '#EC4899', // pink
  },
  health: {
    id: 'health',
    name: 'Saúde & Cuidados',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#14B8A6', // teal
  },
  education: {
    id: 'education',
    name: 'Educação & Livros',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#84CC16', // lime
  },
  shopping: {
    id: 'shopping',
    name: 'Compras Pessoais',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#F43F5E', // rose
  },
  other: {
    id: 'other',
    name: 'Outros & Diversos',
    type: 'both',
    icon: 'CircleDot',
    color: '#94A3B8', // slate
  },
};

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string }> = {
  pix: { label: 'Pix', icon: 'Zap' },
  credit: { label: 'Cartão de Crédito', icon: 'CreditCard' },
  debit: { label: 'Cartão de Débito', icon: 'CreditCard' },
  transfer: { label: 'Transferência / TED', icon: 'ArrowLeftRight' },
  cash: { label: 'Dinheiro', icon: 'Banknote' },
};

export function formatCurrency(amount: number, hideValues: boolean = false): string {
  if (hideValues) {
    return 'R$ ••••••';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatMonthYear(monthKey: string): string {
  // format YYYY-MM into "Outubro 2026"
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatPercent(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${Math.round(value)}%`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
