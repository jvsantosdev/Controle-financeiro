'use client';

import { useSession } from 'next-auth/react';
import { useState, useRef } from 'react';
import LogoutButton from '@/components/auth/LogoutButton';
import ThemeToggle from '@/components/ThemeToggle';
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
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
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
        throw new Error(data.error || 'Failed to preview CSV');
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
        throw new Error(data.error || 'Failed to import CSV');
      }
      
      setSuccess(`Sucesso! ${data.importedCount} transações importadas.`);
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
    const template = `Data,Descrição,Valor,Categoria,Tipo,Status
01/01/2024,Almoço,-35,50,Alimentação,EXPENSE,PAID
15/01/2024,Salário,+2500,00,Renda,INCOME,PAID
20/01/2024,Netflix,-39,90,Lazer,EXPENSE,PAID
25/01/2024,Supermercado,-180,75,Alimentação,EXPENSE,PENDING`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-transacoes.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Importar transações</h1>
          <p className="text-gray-600">Importe transações do seu extrato bancário via CSV.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {session && (
            <div className="text-sm">
              <span className="font-medium">{session.user?.name || session.user?.email}</span>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="font-bold text-lg mb-2">Como usar:</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Baixe o template abaixo para ver o formato esperado</li>
          <li>Exporte seu extrato do banco como CSV</li>
          <li>Se necessário, ajuste as colunas para o formato do template</li>
          <li>Selecione o arquivo e clique em "Visualizar" para validar</li>
          <li>Confirme as transações e clique em "Importar"</li>
        </ol>
        <div className="mt-4">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-white border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            📥 Baixar template CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Selecionar arquivo CSV *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="w-full p-2 border rounded-lg"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Arquivo selecionado: <span className="font-medium">{file.name}</span> ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handlePreview}
            disabled={!file || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analisando...' : 'Visualizar'}
          </button>
          <button
            onClick={handleImport}
            disabled={!preview || importing || preview.validRows === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {importing ? 'Importando...' : `Importar (${preview?.validRows || 0})`}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-red-50 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-8 bg-green-50 text-green-700 rounded-lg">
          ✅ {success}
        </div>
      )}

      {preview && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
              <h3 className="font-bold text-lg mb-2">Total de linhas</h3>
              <p className="text-3xl font-bold text-blue-600">{preview.totalRows}</p>
              <p className="text-sm text-gray-500 mt-2">Arquivo CSV</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
              <h3 className="font-bold text-lg mb-2">Válidas</h3>
              <p className="text-3xl font-bold text-green-600">{preview.validRows}</p>
              <p className="text-sm text-gray-500 mt-2">Prontas para importar</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500">
              <h3 className="font-bold text-lg mb-2">Com erro</h3>
              <p className="text-3xl font-bold text-red-600">{preview.invalidRows}</p>
              <p className="text-sm text-gray-500 mt-2">Verifique os detalhes abaixo</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-4">Colunas detectadas</h3>
            <div className="flex flex-wrap gap-2">
              {preview.headers.map((header, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {header}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              As colunas serão mapeadas automaticamente para os campos do sistema.
            </p>
          </div>

          {preview.validRows > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Transações válidas ({preview.validRows})</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Prontas para importar
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 sm:p-3 text-left border-b">Linha</th>
                      <th className="p-2 sm:p-3 text-left border-b">Data</th>
                      <th className="p-2 sm:p-3 text-left border-b">Descrição</th>
                      <th className="p-2 sm:p-3 text-left border-b">Valor</th>
                      <th className="p-2 sm:p-3 text-left border-b">Categoria</th>
                      <th className="p-2 sm:p-3 text-left border-b">Tipo</th>
                      <th className="p-2 sm:p-3 text-left border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.validatedRows.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 sm:p-3 border-b">{row._row}</td>
                        <td className="p-2 sm:p-3 border-b">{formatDatePtBR(row.date)}</td>
                        <td className="p-2 sm:p-3 border-b max-w-xs truncate">{row.description}</td>
                        <td className={`p-2 sm:p-3 border-b font-medium ${
                          row.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {row.type === 'INCOME' ? '+' : '-'} {formatCurrency(Math.abs(row.amount))}
                        </td>
                        <td className="p-2 sm:p-3 border-b">{row.category}</td>
                        <td className="p-2 sm:p-3 border-b">
                          <span className={`px-2 py-1 rounded text-sm ${
                            row.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {row.type === 'INCOME' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 border-b">
                          <span className={`px-2 py-1 rounded text-sm ${
                            row.status === 'PAID' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {row.status === 'PAID' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {preview.validRows > 10 && (
                <p className="text-sm text-gray-500 mt-4">
                  Mostrando 10 de {preview.validRows} transações válidas.
                </p>
              )}
            </div>
          )}

          {preview.invalidRows > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Erros encontrados ({preview.invalidRows})</h3>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Requer atenção
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 sm:p-3 text-left border-b">Linha</th>
                      <th className="p-2 sm:p-3 text-left border-b">Dados originais</th>
                      <th className="p-2 sm:p-3 text-left border-b">Erros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.errors.map((error, index) => (
                      <tr key={index} className="hover:bg-red-50">
                        <td className="p-2 sm:p-3 border-b font-medium">{error.row}</td>
                        <td className="p-2 sm:p-3 border-b">
                          <div className="max-w-xs">
                            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(error.raw, null, 2)}
                            </pre>
                          </div>
                        </td>
                        <td className="p-2 sm:p-3 border-b">
                          <ul className="text-red-600">
                            {error.errors.map((err, i) => (
                              <li key={i} className="text-sm">• {err}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {preview.invalidRows > 10 && (
                <p className="text-sm text-gray-500 mt-4">
                  Mostrando 10 de {preview.invalidRows} erros.
                </p>
              )}
              
              <p className="text-sm text-gray-600 mt-6">
                <strong>Sugestão:</strong> Corrija os erros no seu arquivo CSV e tente novamente,
                ou importe apenas as transações válidas clicando em "Importar".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}