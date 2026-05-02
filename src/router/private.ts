/* eslint-disable prettier/prettier */
const PrivateRoutes = {
  path: '/',
  name: 'Home',
  meta: {
    requiresAuth: true
  },
  redirect: '/main',
  component: () => import('@/layouts/DefaultLayout.vue'),
  children: [
    {
      path: '/import',
      name: 'Data import options',
      meta: {
        title: 'Import data',
        subtitle: 'Bring transactions into DataFlow from files or connected bank accounts.'
      },
      component: () => import('@/views/import/ImportLanding.vue')
    },
    {
      path: 'import/transactions',
      name: 'ImportTransactions',
      meta: {
        title: 'Import transactions',
        subtitle: 'Upload CSV, Excel, or XML transaction files and review skipped rows when needed.'
      },
      component: () => import('@/views/import/ImportTransactions.vue')
    },
    {
      path: 'list/transactions',
      name: 'Transaction List',
      meta: {
        title: 'Transactions',
        subtitle: 'Search, filter, edit, and classify your financial activity.'
      },
      component: () => import('@/views/tables/TransactionsTable.vue')
    },
    {
      path: 'list/categories',
      name: 'Categories',
      meta: {
        title: 'Categories',
        subtitle: 'Maintain the income and expense groups used across imports and reports.'
      },
      component: () => import('@/views/tables/CategoriesTable.vue')
    },
    {
      name: 'Dashboard',
      path: '/',
      meta: {
        title: 'Financial reporting',
        subtitle: 'Track income, expenses, trends, categories, and payment methods.'
      },
      component: () => import('@/views/dashboard/IndexView.vue')
    },
    {
      name: 'Budgets',
      path: '/budgets',
      meta: {
        title: 'Budgets',
        subtitle: 'Compare spending against category limits and monitor risk early.'
      },
      component: () => import('@/views/budget/BudgetingView.vue')
    }
  ]
};

export default PrivateRoutes;
