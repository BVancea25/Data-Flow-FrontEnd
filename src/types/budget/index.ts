export interface BudgetStatus {
  budgetId: string;
  categoryName: string;
  currencyCode: string;
  startDate: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  period: BudgetPeriod;
  status: 'ON_TRACK' | 'WARNING' | 'EXCEEDED';
}

export interface BudgetRequest {
  categoryId: string;
  limitAmount: number;
  currencyCode: string;
  period: BudgetPeriod;
  startDate: Date;
}

export interface BudgetUpdateRequest {
  limitAmount: number;
  isActive: boolean;
  currencyCode: string;
}

export enum BudgetPeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}
