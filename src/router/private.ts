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
      component: () => import('@/views/import/ImportLanding.vue')
    },
    {
      path: 'import/transactions',
      name: 'ImportTransactions',
      component: () => import('@/views/import/ImportTransactions.vue')
    },
    {
      path: 'list/transactions',
      name: 'Transaction List',
      component: () => import('@/views/tables/TransactionsTable.vue')
    },
    {
      path: 'list/categories',
      name: 'Categories',
      component: () => import('@/views/tables/CategoriesTable.vue')
    },
    {
      name: 'Dashboard',
      path: '/',
      component: () => import('@/views/dashboard/IndexView.vue')
    },
    {
      name: 'Budgets',
      path: '/budgets',
      component: () => import('@/views/budget/BudgetingView.vue')
    }
  ]
};

export default PrivateRoutes;
