import React, { useState } from 'react';
import { Plus, Target, Check, AlertTriangle, ShieldCheck, Sparkles, Trash2, Edit3 } from 'lucide-react';
import { Budget, CategoryId, FinancialGoal } from '../types/finance';
import { CATEGORIES, formatCurrency, formatPercent, generateId } from '../utils/formatters';

interface BudgetsGoalsViewProps {
  budgets: Budget[];
  goals: FinancialGoal[];
  expensesByCategory: Array<{
    categoryId: CategoryId;
    amount: number;
    percentage: number;
  }>;
  hideValues: boolean;
  onUpdateBudget: (categoryId: CategoryId, limit: number) => void;
  onAddGoal: (goal: FinancialGoal) => void;
  onUpdateGoal: (goal: FinancialGoal) => void;
  onContributeGoal: (goalId: string, amount: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const BudgetsGoalsView: React.FC<BudgetsGoalsViewProps> = ({
  budgets,
  goals,
  expensesByCategory,
  hideValues,
  onUpdateBudget,
  onAddGoal,
  onUpdateGoal,
  onContributeGoal,
  onDeleteGoal,
}) => {
  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Quick contribute modal state
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  // Editing budget inline
  const [editingBudgetId, setEditingBudgetId] = useState<CategoryId | null>(null);
  const [editingBudgetVal, setEditingBudgetVal] = useState('');

  // Handle open add/edit goal
  const handleOpenGoalModal = (goal?: FinancialGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalTitle(goal.title);
      setGoalTarget(goal.targetAmount.toString());
      setGoalCurrent(goal.currentAmount.toString());
      setGoalDeadline(goal.deadline || '');
    } else {
      setEditingGoal(null);
      setGoalTitle('');
      setGoalTarget('');
      setGoalCurrent('0');
      setGoalDeadline('');
    }
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget.replace(',', '.'));
    const current = parseFloat(goalCurrent.replace(',', '.') || '0');
    if (!goalTitle.trim() || isNaN(target) || target <= 0) return;

    if (editingGoal) {
      onUpdateGoal({
        ...editingGoal,
        title: goalTitle.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline: goalDeadline || undefined,
      });
    } else {
      onAddGoal({
        id: generateId(),
        title: goalTitle.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline: goalDeadline || undefined,
        color: '#10B981',
      });
    }
    setIsGoalModalOpen(false);
  };

  const handleSaveContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId) return;
    const amt = parseFloat(contributeAmount.replace(',', '.'));
    if (isNaN(amt) || amt === 0) return;

    onContributeGoal(contributeGoalId, amt);
    setContributeGoalId(null);
    setContributeAmount('');
  };

  const expenseMap = new Map(expensesByCategory.map((e) => [e.categoryId, e.amount]));

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: Orçamentos por Categoria */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Teto de Gastos Mensais por Categoria
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Defina limites saudáveis para manter o controle sem estresse
            </p>
          </div>
          <span className="text-xs text-neutral-500">
            Clique no limite para alterar o valor
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const cat = CATEGORIES[b.categoryId] || CATEGORIES.other;
            const spent = expenseMap.get(b.categoryId) || 0;
            const percent = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
            const remaining = b.monthlyLimit - spent;
            const isOver = spent > b.monthlyLimit;
            const isWarning = percent >= 85 && !isOver;

            return (
              <div
                key={b.categoryId}
                className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-4 transition-all hover:border-neutral-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-semibold text-white">
                      {cat.name}
                    </span>
                  </div>

                  {/* Inline Edit Trigger */}
                  {editingBudgetId === b.categoryId ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        autoFocus
                        value={editingBudgetVal}
                        onChange={(e) => setEditingBudgetVal(e.target.value)}
                        className="w-20 rounded bg-neutral-900 border border-neutral-700 px-1.5 py-0.5 text-xs text-white font-mono"
                      />
                      <button
                        onClick={() => {
                          const val = parseFloat(editingBudgetVal);
                          if (!isNaN(val) && val >= 0) {
                            onUpdateBudget(b.categoryId, val);
                          }
                          setEditingBudgetId(null);
                        }}
                        className="p-1 rounded bg-neutral-800 text-emerald-400 hover:bg-neutral-700"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingBudgetId(b.categoryId);
                        setEditingBudgetVal(b.monthlyLimit.toString());
                      }}
                      className="text-xs font-mono text-neutral-400 hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                      title="Editar teto"
                    >
                      {formatCurrency(b.monthlyLimit, hideValues)}
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                {/* Details Footer */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>Gasto: {formatCurrency(spent, hideValues)}</span>
                  <span className={isOver ? 'text-rose-400 font-semibold' : 'text-neutral-400'}>
                    {isOver ? `Excedeu ${formatCurrency(Math.abs(remaining), hideValues)}` : `Resta ${formatCurrency(remaining, hideValues)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Metas Financeiras & Sonhos */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Metas & Objetivos Financeiros
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Poupança direcionada para reservas, viagens e grandes conquistas
            </p>
          </div>

          <button
            onClick={() => handleOpenGoalModal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nova Meta</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {goals.map((g) => {
            const percent = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            const isCompleted = g.currentAmount >= g.targetAmount;

            return (
              <div
                key={g.id}
                className="group relative flex flex-col justify-between rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-5 transition-all hover:border-neutral-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      {g.title}
                    </h4>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenGoalModal(g)}
                        className="p-1 text-neutral-400 hover:text-white rounded"
                        title="Editar"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        className="p-1 text-neutral-400 hover:text-rose-400 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {g.deadline && (
                    <span className="text-[11px] text-neutral-500 mt-0.5 block">
                      Prazo: {g.deadline}
                    </span>
                  )}

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between font-mono">
                    <span className="text-lg font-bold tabular-nums text-white">
                      {formatCurrency(g.currentAmount, hideValues)}
                    </span>
                    <span className="text-xs text-neutral-500 tabular-nums">
                      de {formatCurrency(g.targetAmount, hideValues)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-400' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                    <span>{formatPercent(percent)} atingido</span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <Check className="h-3 w-3" /> Meta Concluída
                      </span>
                    )}
                  </div>
                </div>

                {/* Contribute / Withdraw Button */}
                <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setContributeGoalId(g.id);
                      setContributeAmount('');
                    }}
                    className="w-full text-center rounded-lg bg-neutral-900 border border-neutral-800 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    Aportar ou Ajustar Valor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">
              {editingGoal ? 'Editar Meta Financeira' : 'Criar Nova Meta Financeira'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Defina seu objetivo e valor a ser conquistado
            </p>

            <form onSubmit={handleSaveGoal} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Título do Objetivo
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Reserva de Emergência, Carro Novo..."
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Valor Alvo (R$)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="10000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Valor Já Guardado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Prazo Estimado (Opcional)
                </label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">
              Aportar na Meta
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Informe o valor que você está guardando para este objetivo (use valor negativo para resgate)
            </p>

            <form onSubmit={handleSaveContribute} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Valor do Aporte (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  required
                  placeholder="500,00"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-mono font-semibold text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
