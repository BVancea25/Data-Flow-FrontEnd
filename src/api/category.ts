import api from './axios';

const baseUrl = import.meta.env.VITE_DATA_INGESTION_SERVICE_HOST;
const resource = `${baseUrl}/categories`;

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  createdAt?: string;
}

export interface CategoryFilters {
  name?: string;
  type?: TransactionType;
}

/**
 * Get all categories
 * Optionally filter by transaction type
 */
export async function fetchCategories(filters?: CategoryFilters): Promise<Category[]> {
  const { data } = await api.get<Category[]>(resource, {
    params: filters
  });
  return data;
}

/**
 * Get category by id
 */
export async function fetchCategoryById(id: string): Promise<Category> {
  const { data } = await api.get<Category>(`${resource}/${id}`);
  return data;
}

/**
 * Create a new category
 */
export async function createCategory(payload: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  const { data } = await api.post<Category>(resource, payload);
  return data;
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  payload: Partial<Omit<Category, 'id' | 'createdAt'>>
): Promise<Category> {
  const { data } = await api.put<Category>(`${resource}/${id}`, payload);
  return data;
}
