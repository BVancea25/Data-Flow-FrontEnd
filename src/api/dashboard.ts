import api from './axios';
import type { DashboardFilter, OverviewPoint } from '@/types/dashboard';

const reporting = import.meta.env.VITE_DATA_REPORTING_SERVICE_HOST + '/api';

export async function fetchOverview(filter: DashboardFilter): Promise<OverviewPoint[]> {
  const { data } = await api.post(reporting + '/dashboard/overview', filter);
  return data;
}
