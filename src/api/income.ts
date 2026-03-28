import api from '@/api/axios';
import { IIncome, UpdateIncome } from './type';

export interface IncomeQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  ascending?: boolean;
}

export interface IncomePage {
  content: IIncome[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const dataIngestionBaseUrl = import.meta.env.VITE_DATA_INGESTION_SERVICE_HOST;

export async function fetchTransactions(params: IncomeQuery): Promise<IncomePage> {
  const { data } = await api.get(dataIngestionBaseUrl + '/incomes', { params });
  console.log(data);
  return data;
}

export async function deleteTransactions(ids: string[]) {
  const { data } = await api.delete(dataIngestionBaseUrl + '/incomes/delete', {
    data: ids
  });
  return data;
}

export async function createTransaction(income: Partial<IIncome>) {
  const { data } = await api.post(dataIngestionBaseUrl + '/income', [income]);
  return data;
}

export async function updateTransaction(income: Partial<IIncome>) {
  const { data } = await api.put(dataIngestionBaseUrl + '/income', income);
  return data;
}

export async function updateTransactions(incomeUpdate: UpdateIncome) {
  const { data } = await api.put(dataIngestionBaseUrl + '/incomes', incomeUpdate);
  return data;
}
