import api from './axios';
import type {
  DashboardFilter,
  OverviewPoint,
  Kpis,
  CategoryBreakdownPoint,
  CategoryComparisonPoint,
  PaymentMethodBreakdownPoint
} from '@/types/dashboard';

const reporting = import.meta.env.VITE_DATA_REPORTING_SERVICE_HOST + '/api/dashboard';

export async function fetchOverview(filter: DashboardFilter): Promise<OverviewPoint[]> {
  const { data } = await api.post(reporting + '/overview', filter);
  return data;
}

export async function fetchKpis(filter: DashboardFilter): Promise<Kpis> {
  const { data } = await api.post(reporting + '/kpis', filter);
  return data;
}

export async function fetchCategoryBreakdown(filter: DashboardFilter): Promise<CategoryBreakdownPoint[]> {
  const { data } = await api.post(reporting + '/category-breakdown', filter);
  return data;
}

export async function fetchCategoryComparison(filter: DashboardFilter): Promise<CategoryComparisonPoint[]> {
  const { data } = await api.post(reporting + '/category-comparison', filter);
  return data;
}

export async function fetchPaymentMethodBreakdown(filter: DashboardFilter): Promise<PaymentMethodBreakdownPoint[]> {
  const { data } = await api.post(reporting + '/payment-method-breakdown', filter);
  return data;
}
