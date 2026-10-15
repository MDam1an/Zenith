import React from 'react';
import { Eye, EyeOff, Plus, Download } from 'lucide-react';
import { ActiveTab } from '../types/finance';

interface TopNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hideValues: boolean;
  setHideValues: (val: boolean) => void;
  onOpenNewTransaction: () => void;
  onOpenDataModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  hideValues,
  setHideValues,
  onOpenNewTransaction,
  onOpenDataModal,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single element Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('overview')}
            className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-950 shadow-sm transition-transform group-hover:scale-105">
              <span className="font-semibold text-sm tracking-tight">✦</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-white whitespace-nowrap">
                Aura Finanças
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'overview'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'transactions'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            Lançamentos
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'budgets'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            Orçamentos
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'goals'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
            }`}
          >
            Metas
          </button>
        </nav>

        {/* Zone 3: Privacy Mode & Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenDataModal()}
            title="Backup & Dados"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-900/80 transition-colors focus:outline-none"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setHideValues(!hideValues)}
            title={hideValues ? 'Mostrar valores' : 'Ocultar valores (modo privacidade)'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-900/80 transition-colors focus:outline-none"
          >
            {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-neutral-950 transition-all hover:bg-neutral-200 active:scale-95 whitespace-nowrap shrink-0 shadow-sm shadow-white/5"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="flex md:hidden border-t border-neutral-900 px-4 py-2 bg-neutral-950 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'transactions' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Lançamentos
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'budgets' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Orçamentos
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'goals' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Metas
        </button>
      </div>
    </header>
  );
};
