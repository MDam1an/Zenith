import React, { useState, useMemo } from 'react';
import { Search, Filter, Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CategoryId, Transaction, TransactionType } from '../types/finance';
import { CATEGORIES, PAYMENT_METHODS, formatCurrency, formatDate } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  hideValues: boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onNewTransaction: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  hideValues,
  onEdit,
  onDelete,
  onNewTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryId>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filtered and sorted transactions
  const processedTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
        if (search.trim()) {
          const query = search.toLowerCase();
          const descMatch = tx.description.toLowerCase().includes(query);
          const notesMatch = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
          const catMatch = CATEGORIES[tx.category]?.name.toLowerCase().includes(query);
          if (!descMatch && !notesMatch && !catMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, search, typeFilter, categoryFilter, sortBy]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm overflow-hidden">
      
      {/* List Header and Filter Bar */}
      <div className="p-5 sm:p-6 border-b border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Histórico de Lançamentos
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {processedTransactions.length} de {transactions.length} registros exibidos
            </p>
          </div>

          {/* Type Segmented Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-neutral-950 p-1 border border-neutral-800 self-start sm:self-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                typeFilter === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                typeFilter === 'income' ? 'bg-emerald-500/20 text-emerald-300 shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                typeFilter === 'expense' ? 'bg-rose-500/20 text-rose-300 shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>

        {/* Search & Select Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar por descrição ou notas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-9 pr-3 py-1.5 text-xs text-neutral-300 focus:border-neutral-500 focus:outline-none appearance-none"
            >
              <option value="all">Todas as categorias</option>
              {Object.values(CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-neutral-900 text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300 focus:border-neutral-500 focus:outline-none"
          >
            <option value="date-desc">Mais recentes primeiro</option>
            <option value="date-asc">Mais antigos primeiro</option>
            <option value="amount-desc">Maior valor primeiro</option>
            <option value="amount-asc">Menor valor primeiro</option>
          </select>
        </div>
      </div>

      {/* Transactions List Content */}
      <div className="divide-y divide-neutral-800/60">
        {processedTransactions.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mb-3">
              <Search className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Nenhum lançamento encontrado</h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Não encontramos nenhuma movimentação com os filtros atuais.
            </p>
            <button
              onClick={onNewTransaction}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 transition-colors"
            >
              Adicionar Lançamento
            </button>
          </div>
        ) : (
          processedTransactions.map((tx) => {
            const cat = CATEGORIES[tx.category] || CATEGORIES.other;
            const isIncome = tx.type === 'income';
            const payment = PAYMENT_METHODS[tx.paymentMethod]?.label || tx.paymentMethod;

            return (
              <div
                key={tx.id}
                className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-800/30"
              >
                {/* Left: Indicator, Title & Unboxed Metadata */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div 
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      isIncome 
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                        : 'border-neutral-800 bg-neutral-900 text-neutral-300'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-neutral-400" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-100 truncate">
                        {tx.description}
                      </span>
                      {tx.notes && (
                        <span className="hidden sm:inline text-xs text-neutral-500 truncate max-w-xs">
                          ({tx.notes})
                        </span>
                      )}
                    </div>
                    
                    {/* Zero-Pill unboxed metadata with subtle typographic separators */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                      <span>{cat.name}</span>
                      <span aria-hidden="true" className="text-neutral-600">·</span>
                      <span>{payment}</span>
                      <span aria-hidden="true" className="text-neutral-600">·</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Action Affordances */}
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`text-sm sm:text-base font-semibold font-mono tabular-nums tracking-tight ${
                      isIncome ? 'text-emerald-400' : 'text-neutral-200'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(tx.amount, hideValues)}
                  </span>

                  {/* Actions on hover or focus */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      title="Editar lançamento"
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      title="Excluir lançamento"
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-md transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
