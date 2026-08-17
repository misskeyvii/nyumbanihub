import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/login/page';
import AppShell from '@/components/feature/AppShell';
import Dashboard from '@/pages/dashboard/page';
import PosSale from '@/pages/pos/page';
import Products from '@/pages/products/page';
import Inventory from '@/pages/inventory/page';
import Customers from '@/pages/customers/page';
import Suppliers from '@/pages/suppliers/page';
import Expenses from '@/pages/expenses/page';
import Employees from '@/pages/employees/page';
import Reports from '@/pages/reports/page';
import Branches from '@/pages/branches/page';
import Subscription from '@/pages/subscription/page';
import Settings from '@/pages/settings/page';
import Help from '@/pages/help/page';
import Hotel from '@/pages/hotel/page';
import Airbnb from '@/pages/airbnb/page';
import Marketplace from '@/pages/marketplace/page';
import Homes from '@/pages/homes/page';
import SalesHistory from '@/pages/sales-history/page';
import Checkin from '@/pages/checkin/page';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'pos', element: <PosSale /> },
      { path: 'products', element: <Products /> },
      { path: 'inventory', element: <Inventory /> },
      { path: 'customers', element: <Customers /> },
      { path: 'suppliers', element: <Suppliers /> },
      { path: 'expenses', element: <Expenses /> },
      { path: 'employees', element: <Employees /> },
      { path: 'reports', element: <Reports /> },
      { path: 'branches', element: <Branches /> },
      { path: 'subscription', element: <Subscription /> },
      { path: 'settings', element: <Settings /> },
      { path: 'help', element: <Help /> },
      { path: 'hotel', element: <Hotel /> },
      { path: 'airbnb', element: <Airbnb /> },
      { path: 'marketplace', element: <Marketplace /> },
      { path: 'homes', element: <Homes /> },
      { path: 'sales-history', element: <SalesHistory /> },
      { path: 'checkin', element: <Checkin /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;