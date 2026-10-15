import React from 'react';
import { ArrowDownRight, ArrowUpRight, Calendar, Plus, Minus, PiggyBank } from 'lucide-react';
import { formatCurrency, formatMonthYear, formatPercent } from '../utils/formatters';

interface BalanceCardProps {
  metrics: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    savingsRate: number;
  };
  hideValues: boolean;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  availableMonths: string[];
  onOpenNewTransactionWithType: (type: 'income' | 'expense') => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  metrics,
  hideValues,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  onOpenNewTransactionWithType,
}) => {
  const isPositive = metrics.netBalance >= 0;

  // Curated minimalist health status insight
  const getInsightText = () => {
    if (metrics.totalIncome === 0 && metrics.totalExpense === 0) {
      return 'Nenhum lançamento registrado neste período. Registre uma receita ou despesa para começar.';
    }
    if (metrics.savingsRate >= 30) {
      return `Taxa de poupança exemplar de ${formatPercent(metrics.savingsRate)}. Você está retendo uma parcela sólida do que ganha.`;
    }
    if (metrics.savingsRate > 0) {
      return `Saldo positivo de ${formatCurrency(metrics.netBalance, hideValues)} (${formatPercent(metrics.savingsRate)} guardado). Bom equilíbrio.`;
    }
    if (metrics.savingsRate === 0) {
      return 'Receitas e despesas empatadas neste período.';
    }
    return `Despesas superaram as receitas em ${formatCurrency(Math.abs(metrics.netBalance), hideValues)}. Fique atento aos limites.`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 md:p-8 backdrop-blur-sm">
      {/* Subtle background ambient gradient accent */}
      <div 
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{
          background: isPositive 
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, transparent 70%)'
        }}
      />

      {/* Top row: Context header and Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <span className="text-xs font-medium tracking-wider uppercase text-neutral-400">
            Fluxo Financeiro
          </span>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            {selectedMonth === 'all' ? 'Todos os Períodos' : formatMonthYear(selectedMonth)}
          </h2>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950/60 p-1">
          <div className="flex items-center px-2 text-neutral-500">
            <Calendar className="h-3.5 w-3.5" />
          </div>
          {availableMonths.slice(0, 3).map((monthKey) => (
            <button
              key={monthKey}
              onClick={() => setSelectedMonth(monthKey)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap ${
                selectedMonth === monthKey
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {formatMonthYear(monthKey)}
            </button>
          ))}
          <button
            onClick={() => setSelectedMonth('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap ${
              selectedMonth === 'all'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Geral
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Net Balance */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-neutral-400">
            Saldo Líquido do Período
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight ${
              isPositive ? 'text-white' : 'text-rose-400'
            }`}>
              {formatCurrency(metrics.netBalance, hideValues)}
            </span>
          </div>
          <span className="mt-1 text-xs text-neutral-500">
            Diferença entre entradas e saídas
          </span>
        </div>

        {/* Total Incomes */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            <span>Receitas Recebidas</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-emerald-400">
              +{formatCurrency(metrics.totalIncome, hideValues)}
            </span>
          </div>
          <span className="mt-1 text-xs text-neutral-500">
            Salários, freelas e proventos
          </span>
        </div>

        {/* Total Expenses */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
            <span>Despesas Totais</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-rose-400">
              -{formatCurrency(metrics.totalExpense, hideValues)}
            </span>
          </div>
          <span className="mt-1 text-xs text-neutral-500">
            Custos fixos e variáveis
          </span>
        </div>

        {/* Savings Rate */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <PiggyBank className="h-3.5 w-3.5 text-indigo-400" />
            <span>Taxa de Poupança</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono tabular-nums text-indigo-300">
              {formatPercent(metrics.savingsRate)}
            </span>
          </div>
          <span className="mt-1 text-xs text-neutral-500">
            Percentual poupado da receita
          </span>
        </div>

      </div>

      {/* Insight Bar & Quick Action buttons */}
      <div className="mt-8 flex flex-col gap-4 rounded-xl border border-neutral-800/80 bg-neutral-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-300 leading-relaxed max-w-xl">
          {getInsightText()}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenNewTransactionWithType('income')}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="h-3 w-3 stroke-[2.5]" />
            <span>Adicionar Receita</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenNewTransactionWithType('expense')}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            <Minus className="h-3 w-3 stroke-[2.5]" />
            <span>Adicionar Despesa</span>
          </button>
        </div>
      </div>

    </div>
  );
};
