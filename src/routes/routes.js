import { lazy } from 'react';

const routes = [
  {
    path: 'dashboard',
    component: lazy(() => import('features/Dashboard')),
    exact: true,
  },
];

export default routes;
