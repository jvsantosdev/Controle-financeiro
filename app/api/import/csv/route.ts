import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { parse as parseCsv } from 'papaparse';
import { transactionSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }
    
    const text = await file.text();
    
    const parseResult = parseCsv(text, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string) => value.trim(),
    });
    
    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed', details: parseResult.errors },
        { status: 400 }
      );
    }
    
    const rows = parseResult.data as Record<string, any>[];
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no valid rows' },
        { status: 400 }
      );
    }
    
    const headers = Object.keys(rows[0] || {});
    
    const validatedRows = [];
    const errors = [];
    
    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const rowNumber = i + 2;
      
      try {
        const mappedRow: any = {
          description: rawRow['Descrição'] || rawRow['Description'] || rawRow['descricao'] || rawRow['description'] || '',
          amount: parseAmount(rawRow['Valor'] || rawRow['Amount'] || rawRow['valor'] || rawRow['amount'] || '0'),
          date: parseDate(rawRow['Data'] || rawRow['Date'] || rawRow['data'] || rawRow['date'] || ''),
          category: rawRow['Categoria'] || rawRow['Category'] || rawRow['categoria'] || rawRow['category'] || 'Outros',
          type: parseType(rawRow['Tipo'] || rawRow['Type'] || rawRow['tipo'] || rawRow['type'] || ''),
          status: parseStatus(rawRow['Status'] || rawRow['status'] || ''),
          paymentMethodId: rawRow['MétodoPagamento'] || rawRow['PaymentMethod'] || rawRow['paymentMethod'] || null,
        };
        
        const validated = transactionSchema.safeParse({
          ...mappedRow,
          userId,
        });
        
        if (validated.success) {
          validatedRows.push({
            ...validated.data,
            _row: rowNumber,
            _raw: rawRow,
          });
        } else {
          errors.push({
            row: rowNumber,
            errors: validated.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`),
            raw: rawRow,
          });
        }
      } catch (err: any) {
        errors.push({
          row: rowNumber,
          errors: [err.message],
          raw: rawRow,
        });
      }
    }
    
    if (preview) {
      return NextResponse.json({
        preview: true,
        totalRows: rows.length,
        validRows: validatedRows.length,
        invalidRows: errors.length,
        headers,
        sampleRow: rows[0],
        validatedRows: validatedRows.slice(0, 10),
        errors: errors.slice(0, 10),
      });
    }
    
    if (errors.length > 0) {
      return NextResponse.json({
        error: 'CSV contains validation errors',
        totalRows: rows.length,
        validRows: validatedRows.length,
        invalidRows: errors.length,
        errors: errors.slice(0, 20),
      }, { status: 400 });
    }
    
    // TODO: Actually import transactions
    return NextResponse.json({
      success: true,
      importedCount: validatedRows.length,
      message: `${validatedRows.length} transações importadas com sucesso.`,
      preview: false,
    });
    
  } catch (error: any) {
    console.error('Error processing CSV import:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process CSV import' },
      { status: 500 }
    );
  }
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9,-]/g, '').replace(',', '.');
  const floatValue = parseFloat(cleaned);
  if (isNaN(floatValue)) return 0;
  
  const cents = Math.round(floatValue * 100);
  
  const lowerValue = value.toLowerCase();
  if (lowerValue.includes('-') || lowerValue.includes('debit') || lowerValue.includes('débito')) {
    return Math.abs(cents) * -1;
  }
  
  return Math.abs(cents);
}

function parseDate(value: string): string {
  const formats = [
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'MM-dd-yyyy',
  ];
  
  for (const format of formats) {
    try {
      if (format === 'dd/MM/yyyy' && value.includes('/')) {
        const [day, month, year] = value.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date.toISOString();
      }
      if (format === 'dd-MM-yyyy' && value.includes('-')) {
        const [day, month, year] = value.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date.toISOString();
      }
      if (format === 'yyyy-MM-dd' && value.includes('-')) {
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date.toISOString();
      }
    } catch (err) {
      continue;
    }
  }
  
  return new Date().toISOString();
}

function parseType(value: string): 'INCOME' | 'EXPENSE' {
  const lower = value.toLowerCase();
  if (lower.includes('income') || lower.includes('receita') || lower.includes('entrada') || lower.includes('+')) {
    return 'INCOME';
  }
  return 'EXPENSE';
}

function parseStatus(value: string): 'PAID' | 'PENDING' {
  const lower = value.toLowerCase();
  if (lower.includes('paid') || lower.includes('pago') || lower.includes('liquidado')) {
    return 'PAID';
  }
  return 'PENDING';
}