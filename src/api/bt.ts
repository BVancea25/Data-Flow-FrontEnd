import api from './axios';

const baseUrl = import.meta.env.VITE_DATA_INGESTION_SERVICE_HOST;

export async function createConsent(): Promise<void> {
  const { data } = await api.get(baseUrl + '/bt/consent/create');

  if (data) {
    window.location.href = data;
  }
}

export async function getConsent(): Promise<void> {
  const { data } = await api.get(baseUrl + '/bt/consent');

  return data;
}

export async function refreshTransactions(): Promise<void> {
  await api.post(baseUrl + '/bt/data_refresh');
}
