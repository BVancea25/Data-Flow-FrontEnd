import api from '@/api/axios';
import { ITransaction } from './type';

export interface TransactionQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  ascending?: boolean;
}

export interface TransactionPage {
  content: ITransaction[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const dataIngestionBaseUrl = import.meta.env.VITE_DATA_INGESTION_SERVICE_HOST;

export async function fetchTransactions(params: TransactionQuery): Promise<TransactionPage> {
  const { data } = await api.get(dataIngestionBaseUrl + '/transactions', { params });
  console.log(data);
  return data;
}

export async function deleteTransactions(ids: string[]) {
  const { data } = await api.delete(dataIngestionBaseUrl + '/transactions/delete', {
    data: ids
  });
  return data;
}

export async function createTransaction(transaction: Partial<ITransaction>) {
  const { data } = await api.post(dataIngestionBaseUrl + '/transaction', [transaction]);
  return data;
}
