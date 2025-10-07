/* eslint-disable prettier/prettier */
import api from './axios';

const baseUrl = import.meta.env.VITE_DATA_INGESTION_SERVICE_HOST;

export interface ICurrency {
  code: string;
  name: string;
}

export async function searchCurrenciesByCode(query: string): Promise<ICurrency[]> {
  const { data } = await api.get(baseUrl + '/currencies', {
    params: { search: query }
  });
  return data;
}
