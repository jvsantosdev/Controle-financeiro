'use client';

import { useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import { formatCurrency, formatDatePtBR } from '@/lib/validation';

interface CSVPreviewRow {
  _row: number;
  _raw: any;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  status: 'PAID' | 'PENDING';
  paymentMethodId: string | null;
}

interface CSVImportResult {
  preview?: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  headers: string[];
  sampleRow: any;
  validatedRows: CSVPreviewRow[];
  errors: Array<{
    row: number;
    errors: string[];
    raw: any;
  }>;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File | undefined) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(null);
      setError(null);
      setSuccess(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/csv?preview=true', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar arquivo CSV');
      }

      setPreview(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !preview?.validatedRows.length) return;

    try {
      setImporting(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar transações');
      }

      setSuccess(`Importação concluída com sucesso! ${data.importedCount} lançamentos adicionados.`);
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = `Data,Descrição,Valor,Categoria,Tipo,Status\n01/01/2025,Almoço,-35.50,Alimentação,EXPENSE,PAID\n15/01/2025,Salário,2500.00,Renda,INCOME,PAID\n20/01/2025,Netflix,-39.90,Lazer,EXPENSE,PAID\n25/01/2025,Supermercado,-180.75,Alimentação,EXPENSE,PENDING`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-extrato-finflow.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Importar extrato bancário
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Envie sua planilha CSV para sincronizar dezenas de transações de uma só vez.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-xs"
        >
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar modelo CSV
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 mb-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 rounded-2xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 font-bold ml-4">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-600 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 mb-8 shadow-xs">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
              : file
              ? 'border-emerald-500/50 bg-slate-50/50 dark:bg-slate-950/30'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-950/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            className="hidden"
          />

          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
            📄
          </div>

          {file ? (
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-base">
                {file.name}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB • Clique para escolher outro arquivo
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                Arraste seu arquivo CSV ou clique para selecionar
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Suporta exportações com separadores vírgula (,) ou ponto e vírgula (;)
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <button
            onClick={handlePreview}
            disabled={!file || loading || importing}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Analisando dados...' : 'Validar dados'}
          </button>

          <button
            onClick={handleImport}
            disabled={!preview || importing || preview.validRows === 0}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {importing
              ? 'Importando transações...'
              : `Confirmar importação (${preview?.validRows || 0})`}
          </button>
        </div>
      </div>

      {/* Validation Results */}
      {preview && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Linhas Analisadas
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {preview.totalRows}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Lançamentos Válidos
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {preview.validRows}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Linhas com Inconsistência
              </span>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                {preview.invalidRows}
              </p>
            </div>
          </div>

          {/* Valid rows preview table */}
          {preview.validRows > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Prévia dos lançamentos aprovados
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Exibindo os primeiros {Math.min(10, preview.validRows)} de {preview.validRows} registros
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                  Prontos para gravar
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-5">Linha</th>
                      <th className="py-3.5 px-5">Data</th>
                      <th className="py-3.5 px-5">Descrição</th>
                      <th className="py-3.5 px-5">Categoria</th>
                      <th className="py-3.5 px-5">Tipo</th>
                      <th className="py-3.5 px-5 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {preview.validatedRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-xs text-slate-400">{row._row}</td>
                        <td className="py-3.5 px-5 font-medium">{formatDatePtBR(row.date)}</td>
                        <td className="py-3.5 px-5 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                          {row.description}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {row.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              row.type === 'INCOME'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {row.type === 'INCOME' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-5 text-right font-semibold ${
                            row.type === 'INCOME'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {row.type === 'INCOME' ? '+' : '-'} {formatCurrency(Math.abs(row.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invalid rows / errors */}
          {preview.invalidRows > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 shadow-xs">
              <h3 className="font-bold text-base text-rose-700 dark:text-rose-400 mb-2">
                Inconsistências encontradas ({preview.invalidRows})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                As linhas abaixo não puderam ser validadas. Você ainda pode importar as linhas válidas ou corrigir o CSV e tentar novamente.
              </p>

              <div className="space-y-3">
                {preview.errors.slice(0, 5).map((err, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs"
                  >
                    <p className="font-semibold text-rose-800 dark:text-rose-300">
                      Linha {err.row}: {err.errors.join(' • ')}
                    </p>
                    <pre className="mt-1 text-slate-500 dark:text-slate-400 overflow-x-auto text-[11px]">
                      {JSON.stringify(err.raw)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
