import { z } from 'zod';

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  return { valid: true };
}

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountInCents / 100);
}

export const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().int().positive('Valor deve ser positivo'),
  date: z.string().datetime('Data inválida'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  type: z.enum(['INCOME', 'EXPENSE']),
  paymentMethodId: z.string().optional(),
  status: z.enum(['PAID', 'PENDING']).default('PAID'),
  notes: z.string().optional(),
});

export const updateTransactionSchema = transactionSchema.partial();

export const paymentMethodSchema = z.object({
  type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH', 'OTHER']),
  name: z.string().min(1, 'Nome é obrigatório'),
  lastFourDigits: z.string().optional(),
  closingDay: z.number().int().min(1).max(31).optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
});

export const updatePaymentMethodSchema = paymentMethodSchema.partial();

export const budgetSchema = z.object({
  category: z.string().min(1, 'Categoria é obrigatória'),
  limit: z.number().int().positive('Limite deve ser positivo'),
  month: z.string().datetime('Mês inválida'),
});

export const updateBudgetSchema = budgetSchema.partial();

export const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  targetAmount: z.number().int().positive('Valor alvo deve ser positivo'),
  currentAmount: z.number().int().nonnegative('Valor atual não pode ser negativo'),
  deadline: z.string().datetime('Prazo inválido'),
});

export const updateGoalSchema = goalSchema.partial();

export function formatDatePtBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

export function parseCurrencyToCents(value: string): number {
  // Convert BRL currency string to cents
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const floatValue = parseFloat(cleaned);
  return Math.round(floatValue * 100);
}

export function getZodErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message || 'Dados inválidos';
}
