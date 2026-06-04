import api from './axios';

const baseUrl = import.meta.env.VITE_DATA_INGESTION_SERVICE_HOST;

export async function createRevolutConsent(): Promise<void> {
  const { data } = await api.get(`${baseUrl}/open-banking/revolut/consent/create`);

  if (data) {
    window.location.href = data;
  }
}

export async function getRevolutConsent(): Promise<string> {
  const { data } = await api.get(`${baseUrl}/open-banking/revolut/consent`);

  return data;
}

export async function refreshRevolutTransactions(): Promise<void> {
  await api.post(`${baseUrl}/open-banking/revolut/data-refresh`);
}

export async function revokeRevolutConsent(): Promise<void> {
  await api.delete(`${baseUrl}/open-banking/revolut/consent`);
}
