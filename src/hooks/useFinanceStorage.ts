import { useState, useEffect, useMemo, useCallback } from 'react';
import { FinancialGoal, Transaction, Budget, CategoryId } from '../types/finance';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_GOALS } from '../data/initialData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'aura_finance_transactions_v1',
  BUDGETS: 'aura_finance_budgets_v1',
  GOALS: 'aura_finance_goals_v1',
  PRIVACY: 'aura_finance_privacy_mode',
};

export function useFinanceStorage() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading budgets from localStorage', e);
    }
    return INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading goals from localStorage', e);
    }
    return INITIAL_GOALS;
  });

  const [hideValues, setHideValues] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRIVACY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading privacy mode', e);
    }
    return false;
  });

  // Current selected month: default to current month YYYY-MM or latest available
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error persisting transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Error persisting budgets', e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Error persisting goals', e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRIVACY, JSON.stringify(hideValues));
    } catch (e) {
      console.error('Error persisting privacy mode', e);
    }
  }, [hideValues]);

  // Actions
  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const updateTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateBudget = useCallback((categoryId: CategoryId, monthlyLimit: number) => {
    setBudgets((prev) => {
      const exists = prev.find((b) => b.categoryId === categoryId);
      if (exists) {
        return prev.map((b) => (b.categoryId === categoryId ? { ...b, monthlyLimit } : b));
      }
      return [...prev, { categoryId, monthlyLimit }];
    });
  }, []);

  const addGoal = useCallback((goal: FinancialGoal) => {
    setGoals((prev) => [...prev, goal]);
  }, []);

  const updateGoal = useCallback((goal: FinancialGoal) => {
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
  }, []);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) } : g))
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const resetToSampleData = useCallback(() => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
  }, []);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
  }, []);

  // Available months list derived from transactions
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const current = new Date();
    const currKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    set.add(currKey);

    transactions.forEach((tx) => {
      if (tx.date) {
        const monthKey = tx.date.substring(0, 7);
        set.add(monthKey);
      }
    });

    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Filtered transactions by selected month (or all)
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Calculations for current selected month
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate: Math.max(-100, Math.min(100, savingsRate)),
    };
  }, [filteredTransactions]);

  // Expenses by category for current view
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    const totalExpense = metrics.totalExpense;
    return Object.entries(map)
      .map(([catId, amount]) => ({
        categoryId: catId as CategoryId,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, metrics.totalExpense]);

  // Export functions
  const exportDataJson = useCallback(() => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
      goals,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-financas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, budgets, goals]);

  const exportTransactionsCsv = useCallback(() => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Valor', 'Categoria', 'Forma de Pagamento', 'Notas'];
    const rows = transactions.map((t) => [
      t.date,
      t.type === 'income' ? 'Receita' : 'Despesa',
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.category,
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aura-transacoes-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [transactions]);

  const importDataJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (Array.isArray(parsed.budgets)) {
        setBudgets(parsed.budgets);
      }
      if (Array.isArray(parsed.goals)) {
        setGoals(parsed.goals);
      }
      return { success: true, message: 'Dados importados com sucesso!' };
    } catch (e) {
      return { success: false, message: 'Arquivo JSON inválido.' };
    }
  }, []);

  return {
    transactions,
    filteredTransactions,
    budgets,
    goals,
    hideValues,
    setHideValues,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    metrics,
    expensesByCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget,
    addGoal,
    updateGoal,
    contributeToGoal,
    deleteGoal,
    resetToSampleData,
    clearAllData,
    exportDataJson,
    importDataJson,
    exportTransactionsCsv,
  };
}
