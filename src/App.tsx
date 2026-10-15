/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useFinanceStorage } from './hooks/useFinanceStorage';
import { ActiveTab, Transaction, TransactionType } from './types/finance';
import { TopNav } from './components/TopNav';
import { BalanceCard } from './components/BalanceCard';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetsGoalsView } from './components/BudgetsGoalsView';
import { TransactionModal } from './components/TransactionModal';
import { ExportImportModal } from './components/ExportImportModal';
import { ArrowRight, Plus } from 'lucide-react';

export default function App() {
  const {
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
  } = useFinanceStorage();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');

  // Keyboard shortcut: Press 'n' to open new transaction modal (unless typing in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setEditingTransaction(null);
        setModalDefaultType('expense');
        setIsTransactionModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewWithType = (type: TransactionType) => {
    setEditingTransaction(null);
    setModalDefaultType(type);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = (tx: Transaction) => {
    if (editingTransaction) {
      updateTransaction(tx);
    } else {
      addTransaction(tx);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-neutral-800 selection:text-white">
      
      {/* Top Bar Contract (Wordmark - 4 Links - Primary CTA) */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hideValues={hideValues}
        setHideValues={setHideValues}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setModalDefaultType('expense');
          setIsTransactionModalOpen(true);
        }}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Tab 1: Visão Geral (Overview) */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Balance & Monthly Cashflow Hero */}
            <BalanceCard
              metrics={metrics}
              hideValues={hideValues}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              availableMonths={availableMonths}
              onOpenNewTransactionWithType={handleOpenNewWithType}
            />

            {/* Visual Analytics & Breakdown */}
            <AnalyticsView
              transactions={filteredTransactions}
              expensesByCategory={expensesByCategory}
              hideValues={hideValues}
              totalIncome={metrics.totalIncome}
              totalExpense={metrics.totalExpense}
            />

            {/* Recent Transactions Strip */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    Últimas Movimentações
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Transações recentes registradas no período
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  <span>Ver todas ({filteredTransactions.length})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <TransactionList
                transactions={filteredTransactions.slice(0, 6)}
                hideValues={hideValues}
                onEdit={handleEditTransaction}
                onDelete={deleteTransaction}
                onNewTransaction={() => {
                  setEditingTransaction(null);
                  setModalDefaultType('expense');
                  setIsTransactionModalOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Lançamentos (All Transactions) */}
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Lançamentos Financeiros
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Gerencie todas as entradas e saídas com filtros em tempo real
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenNewWithType('income')}
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  + Nova Receita
                </button>
                <button
                  onClick={() => handleOpenNewWithType('expense')}
                  className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  - Nova Despesa
                </button>
              </div>
            </div>

            <TransactionList
              transactions={transactions}
              hideValues={hideValues}
              onEdit={handleEditTransaction}
              onDelete={deleteTransaction}
              onNewTransaction={() => {
                setEditingTransaction(null);
                setModalDefaultType('expense');
                setIsTransactionModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 3: Orçamentos (Budgets) */}
        {activeTab === 'budgets' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Planejamento & Tetos de Gastos
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Acompanhe o consumo dos seus limites mensais por categoria
              </p>
            </div>

            <BudgetsGoalsView
              budgets={budgets}
              goals={goals}
              expensesByCategory={expensesByCategory}
              hideValues={hideValues}
              onUpdateBudget={updateBudget}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onContributeGoal={contributeToGoal}
              onDeleteGoal={deleteGoal}
            />
          </div>
        )}

        {/* Tab 4: Metas (Goals) */}
        {activeTab === 'goals' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Metas & Objetivos Financeiros
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Conquiste suas reservas, viagens e sonhos com aportes organizados
              </p>
            </div>

            <BudgetsGoalsView
              budgets={budgets}
              goals={goals}
              expensesByCategory={expensesByCategory}
              hideValues={hideValues}
              onUpdateBudget={updateBudget}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onContributeGoal={contributeToGoal}
              onDeleteGoal={deleteGoal}
            />
          </div>
        )}

      </main>

      {/* Floating Quick Action Button on Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-20">
        <button
          onClick={() => {
            setEditingTransaction(null);
            setModalDefaultType('expense');
            setIsTransactionModalOpen(true);
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-neutral-950 shadow-xl active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Minimalist Quiet Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Aura Finanças — Gestão minimalista e descomplicada.</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Exportar / Importar
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={resetToSampleData}
              className="hover:text-white transition-colors"
            >
              Restaurar Exemplo
            </button>
          </div>
        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        transactionToEdit={editingTransaction}
        defaultType={modalDefaultType}
      />

      {/* Data Backup / Export / Import Modal */}
      <ExportImportModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onExportJson={exportDataJson}
        onExportCsv={exportTransactionsCsv}
        onImportJson={importDataJson}
        onResetSample={resetToSampleData}
        onClearAll={clearAllData}
      />

    </div>
  );
}
