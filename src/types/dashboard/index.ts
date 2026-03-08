//time measure type
export type TimeMeasure = 'DAY' | 'MONTH' | 'YEAR';

//dashboard filter object
export interface DashboardFilter {
  from: string | null;
  to: string | null;
  timeMeasure: TimeMeasure;
  paymentMethod: string | null;
  categoryId: string | null;
  currencyCode: string | null;
  type: 'INCOME' | 'EXPENSE' | null;
}

//overview chart data point
export interface OverviewPoint {
  label: string;
  income: number;
  expense: number;
}

export interface Kpis {
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
}

export interface CategoryBreakdownPoint {
  label: string;
  value: number;
}

export interface CategoryComparisonPoint {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  total: number;
}

export interface PaymentMethodBreakdownPoint {
  paymentMethod: string;
  total: number;
}

/*Recent Transaction*/
type recentTrans = {
  title: string;
  subtitle: string;
  textcolor: string;
  boldtext: boolean;
  line: boolean;
  link: string;
  url: string;
};

/*product performance*/
type productPerformanceType = {
  id: number;
  name: string;
  post: string;
  pname: string;
  status: string;
  statuscolor: string;
  budget: string;
};

/*Products card types*/
type productsCards = {
  title: string;
  link: string;
  photo: string;
  salesPrice: number;
  price: number;
  rating: number;
};

export type { recentTrans, productPerformanceType, productsCards };
