export type TransactionType = 'expense' | 'income';

export type CategoryId = 
  | 'housing'        // Moradia & Contas
  | 'food'           // Alimentação & Restaurantes
  | 'transport'      // Transporte & Mobilidade
  | 'leisure'        // Lazer & Entretenimento
  | 'health'         // Saúde & Bem-estar
  | 'education'      // Educação & Cursos
  | 'shopping'       // Compras & Pessoal
  | 'salary'         // Salário & Remuneração
  | 'investments'    // Investimentos & Dividendos
  | 'freelance'      // Projetos & Extra
  | 'other';         // Outros

export interface Category {
  id: CategoryId;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
}

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'transfer';

export interface Transaction {
  id: string;
  description: string;
  amount: number; // always positive in store; type determines debit/credit
  type: TransactionType;
  category: CategoryId;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface Budget {
  categoryId: CategoryId;
  monthlyLimit: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}

export type ActiveTab = 'overview' | 'transactions' | 'budgets' | 'goals';
