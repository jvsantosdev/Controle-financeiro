/**
 * Utilities for credit card calculations (closing day, due day, cycles)
 */

interface CreditCardCycle {
  closingDay: number;
  dueDay: number;
}

/**
 * Calculate the next closing date based on current date and closing day
 */
export function getNextClosingDate(closingDay: number, fromDate: Date = new Date()): Date {
  const result = new Date(fromDate);
  
  // If today's day is after closing day, go to next month
  if (result.getDate() > closingDay) {
    result.setMonth(result.getMonth() + 1);
  }
  
  result.setDate(closingDay);
  result.setHours(23, 59, 59, 999); // End of day
  
  return result;
}

/**
 * Calculate the due date based on closing date and due day
 */
export function getDueDate(closingDate: Date, dueDay: number): Date {
  const dueDate = new Date(closingDate);
  dueDate.setDate(dueDay);
  
  // If due day is before closing date in same month, move to next month
  if (dueDate <= closingDate) {
    dueDate.setMonth(dueDate.getMonth() + 1);
  }
  
  dueDate.setHours(23, 59, 59, 999); // End of day
  return dueDate;
}

/**
 * Get the current credit card cycle (closing date and due date)
 */
export function getCurrentCycle(closingDay: number, dueDay: number): {
  closingDate: Date;
  dueDate: Date;
} {
  const now = new Date();
  const closingDate = getNextClosingDate(closingDay, now);
  const dueDate = getDueDate(closingDate, dueDay);
  
  return { closingDate, dueDate };
}

/**
 * Determine which cycle a transaction belongs to based on closing day
 */
export function getTransactionCycle(
  transactionDate: Date,
  closingDay: number
): { month: number; year: number } {
  const transDate = new Date(transactionDate);
  
  // If transaction date is after closing day, it belongs to next month's cycle
  if (transDate.getDate() > closingDay) {
    transDate.setMonth(transDate.getMonth() + 1);
  }
  
  return {
    month: transDate.getMonth() + 1, // 1-indexed
    year: transDate.getFullYear(),
  };
}

/**
 * Format cycle for display (e.g., "Outubro/2024")
 */
export function formatCycle(month: number, year: number): string {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return `${monthNames[month - 1]}/${year}`;
}

/**
 * Calculate total days between closing and due dates
 */
export function getPaymentPeriodDays(closingDay: number, dueDay: number): number {
  const now = new Date();
  const closingDate = getNextClosingDate(closingDay, now);
  const dueDate = getDueDate(closingDate, dueDay);
  
  const diffTime = dueDate.getTime() - closingDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}