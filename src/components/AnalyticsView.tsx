import React, { useState } from 'react';
import { Transaction, CategoryId } from '../types/finance';
import { CATEGORIES, formatCurrency, formatPercent } from '../utils/formatters';

interface AnalyticsViewProps {
  transactions: Transaction[];
  expensesByCategory: Array<{
    categoryId: CategoryId;
    amount: number;
    percentage: number;
  }>;
  hideValues: boolean;
  totalIncome: number;
  totalExpense: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  expensesByCategory,
  hideValues,
  totalIncome,
  totalExpense,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{ day: number; income: number; expense: number } | null>(null);

  // Group transactions by day of the current month (1..31)
  const daysInMonth = 31;
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayStr = String(day).padStart(2, '0');
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      if (tx.date && tx.date.endsWith(`-${dayStr}`)) {
        if (tx.type === 'income') income += tx.amount;
        else expense += tx.amount;
      }
    });

    return { day, income, expense, net: income - expense };
  });

  const maxDaily = Math.max(...dailyData.map((d) => Math.max(d.income, d.expense)), 1000);

  // Calculate daily burn rate
  const activeDays = Math.max(1, new Date().getDate());
  const dailyAverageExpense = totalExpense / activeDays;

  // Largest single expense
  const topExpense = transactions
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="space-y-6">
      
      {/* 2-Column Split: Cashflow SVG Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Cashflow Timeline (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Fluxo Diário do Mês
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Distribuição de entradas e saídas ao longo dos dias
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Entradas</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <div className="h-2 w-2 rounded-full bg-rose-400" />
                  <span>Saídas</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Bar Flow */}
            <div className="mt-8 relative">
              {hoveredDay && (
                <div className="absolute top-0 right-0 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-mono">
                  <span className="text-neutral-400">Dia {hoveredDay.day}: </span>
                  <span className="text-emerald-400">+{formatCurrency(hoveredDay.income, hideValues)}</span>
                  <span className="text-neutral-600 mx-1">/</span>
                  <span className="text-rose-400">-{formatCurrency(hoveredDay.expense, hideValues)}</span>
                </div>
              )}

              <div className="h-48 w-full flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 border-b border-neutral-800">
                {dailyData.map((d) => {
                  const incomeHeight = (d.income / maxDaily) * 100;
                  const expenseHeight = (d.expense / maxDaily) * 100;

                  return (
                    <div
                      key={d.day}
                      onMouseEnter={() => setHoveredDay(d)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="group relative flex-1 h-full flex items-end justify-center gap-0.5 cursor-pointer"
                    >
                      {/* Income Bar */}
                      <div
                        style={{ height: `${Math.max(incomeHeight > 0 ? 4 : 0, incomeHeight)}%` }}
                        className={`w-full rounded-t-sm bg-emerald-500/70 group-hover:bg-emerald-400 transition-all ${
                          d.income > 0 ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${Math.max(expenseHeight > 0 ? 4 : 0, expenseHeight)}%` }}
                        className={`w-full rounded-t-sm bg-rose-500/70 group-hover:bg-rose-400 transition-all ${
                          d.expense > 0 ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Axis labels */}
              <div className="flex justify-between text-[11px] text-neutral-500 font-mono mt-2">
                <span>01</span>
                <span>08</span>
                <span>15</span>
                <span>22</span>
                <span>31</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80 grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-neutral-400">Média Diária de Gastos</span>
              <div className="text-lg font-semibold font-mono tabular-nums text-white mt-1">
                {formatCurrency(dailyAverageExpense, hideValues)}
                <span className="text-xs font-normal text-neutral-500 ml-1">/ dia</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-neutral-400">Maior Gasto Único</span>
              <div className="text-lg font-semibold font-mono tabular-nums text-white mt-1 truncate">
                {topExpense ? formatCurrency(topExpense.amount, hideValues) : '—'}
                {topExpense && (
                  <span className="text-xs font-normal text-neutral-400 block truncate">
                    {topExpense.description}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Gastos por Categoria
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Distribuição proporcional de despesas
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400 tabular-nums">
                {formatCurrency(totalExpense, hideValues)}
              </span>
            </div>

            {/* List of categories with subtle progress bars */}
            <div className="space-y-4 mt-6">
              {expensesByCategory.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Nenhuma despesa registrada no período.
                </div>
              ) : (
                expensesByCategory.slice(0, 6).map((item) => {
                  const cat = CATEGORIES[item.categoryId] || CATEGORIES.other;
                  return (
                    <div key={item.categoryId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-200 font-medium">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 font-mono tabular-nums">
                            {formatCurrency(item.amount, hideValues)}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px] tabular-nums w-9 text-right">
                            {formatPercent(item.percentage)}
                          </span>
                        </div>
                      </div>

                      {/* Clean hairline indicator bar */}
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, item.percentage)}%`,
                            backgroundColor: cat.color || '#38bdf8',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400">
            Acompanhe o equilíbrio entre necessidades essenciais e lazer para otimizar sua poupança.
          </div>
        </div>

      </div>

    </div>
  );
};
