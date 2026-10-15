import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { CategoryId, PaymentMethod, Transaction, TransactionType } from '../types/finance';
import { CATEGORIES, PAYMENT_METHODS, generateId } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  transactionToEdit?: Transaction | null;
  defaultType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date);
      setPaymentMethod(transactionToEdit.paymentMethod);
      setNotes(transactionToEdit.notes || '');
    } else {
      setType(defaultType);
      setDescription('');
      setAmount('');
      setCategory(defaultType === 'income' ? 'salary' : 'food');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('pix');
      setNotes('');
    }
    setError('');
  }, [transactionToEdit, defaultType, isOpen]);

  // When type changes, adjust default category if mismatched
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      if (CATEGORIES[category]?.type === 'expense') {
        setCategory('salary');
      }
    } else {
      if (CATEGORIES[category]?.type === 'income') {
        setCategory('food');
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim()) {
      setError('Informe uma breve descrição.');
      return;
    }
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }
    if (!date) {
      setError('Selecione uma data.');
      return;
    }

    const tx: Transaction = {
      id: transactionToEdit ? transactionToEdit.id : generateId(),
      description: description.trim(),
      amount: cleanAmount,
      type,
      category,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
      createdAt: transactionToEdit ? transactionToEdit.createdAt : Date.now(),
    };

    onSave(tx);
    onClose();
  };

  // Filter available categories based on active type
  const availableCategories = Object.values(CATEGORIES).filter(
    (c) => c.type === 'both' || c.type === type
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 sm:p-7 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-neutral-800/80">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              {transactionToEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Preencha os detalhes da sua movimentação
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Segmented Type Control */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800/80">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Receita</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-sm">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-11 pr-4 py-2.5 text-lg font-mono font-semibold text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Descrição
            </label>
            <input
              type="text"
              placeholder="ex: Mercado da Semana, Salário, Freelance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-sm text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          {/* Category & Payment Method Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-white focus:border-neutral-500 focus:outline-none"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-white focus:border-neutral-500 focus:outline-none"
              >
                {Object.entries(PAYMENT_METHODS).map(([key, item]) => (
                  <option key={key} value={key} className="bg-neutral-900 text-white">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Notes Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-white focus:border-neutral-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Observações (Opcional)
              </label>
              <input
                type="text"
                placeholder="ex: Parcela 2/3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-white px-5 py-2 text-xs font-semibold text-neutral-950 hover:bg-neutral-200 transition-colors shadow-sm"
            >
              {transactionToEdit ? 'Salvar Alterações' : 'Adicionar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
