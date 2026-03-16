import api from './axios';
import { BudgetStatus, BudgetUpdateRequest } from '@/types/budget';
import { BudgetRequest } from '@/types/budget';

const resource = import.meta.env.VITE_DATA_BUDGETING_SERVICE_HOST + '/api/v1/budgets';

export async function fetchBudgetStatuses(): Promise<BudgetStatus[]> {
  const { data } = await api.get<BudgetStatus[]>(`${resource}/status`);
  return data;
}

export async function createBudget(budget: BudgetRequest): Promise<void> {
  await api.post(resource, budget);
}

export async function updateBudget(id: string, budget: Partial<BudgetUpdateRequest>): Promise<void> {
  await api.put(`${resource}/${id}`, budget);
}

export async function deleteBudget(id: string): Promise<void> {
  await api.delete(`${resource}/${id}`);
}
