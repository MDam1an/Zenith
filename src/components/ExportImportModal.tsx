import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, Trash2, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportJson: (json: string) => { success: boolean; message: string };
  onResetSample: () => void;
  onClearAll: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onExportJson,
  onExportCsv,
  onImportJson,
  onResetSample,
  onClearAll,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = onImportJson(content);
        setStatusMessage({ text: res.message, isError: !res.success });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Gerenciamento de Dados & Backup
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Seus dados ficam 100% salvos no seu navegador de forma privada
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-xs ${
              statusMessage.isError
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <Check className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="mt-5 space-y-3">
          
          {/* Export JSON */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950/60">
            <div>
              <span className="text-xs font-medium text-white block">Backup Completo (JSON)</span>
              <span className="text-[11px] text-neutral-400">Salva todos os lançamentos, metas e orçamentos</span>
            </div>
            <button
              onClick={onExportJson}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Baixar</span>
            </button>
          </div>

          {/* Export CSV */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950/60">
            <div>
              <span className="text-xs font-medium text-white block">Planilha Excel (CSV)</span>
              <span className="text-[11px] text-neutral-400">Exporta os lançamentos em formato tabular</span>
            </div>
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Exportar</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950/60">
            <div>
              <span className="text-xs font-medium text-white block">Restaurar Backup</span>
              <span className="text-[11px] text-neutral-400">Subir arquivo .json salvo anteriormente</span>
            </div>
            <label className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 transition-colors cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-3">
            {/* Reset to sample data */}
            <button
              onClick={() => {
                onResetSample();
                setStatusMessage({ text: 'Dados de demonstração restaurados com sucesso!' });
              }}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors py-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Carregar Dados de Exemplo</span>
            </button>

            {/* Clear All */}
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja apagar todos os lançamentos e configurações?')) {
                  onClearAll();
                  setStatusMessage({ text: 'Todos os dados foram excluídos.' });
                }
              }}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors py-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Zerar Dados</span>
            </button>
          </div>

        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
