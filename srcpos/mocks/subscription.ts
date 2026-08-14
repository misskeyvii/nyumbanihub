export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  users: number;
  branches: number;
  features: string[];
  highlighted?: boolean;
}

export const plans: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    price: 1500,
    period: 'per month',
    users: 2,
    branches: 1,
    features: ['Up to 500 products', '2 user accounts', 'Sales & receipts', 'Basic reports', 'M-PESA ready'],
  },
  {
    id: 'plan-business',
    name: 'Business',
    price: 2500,
    period: 'per month',
    users: 10,
    branches: 3,
    features: ['Unlimited products', '10 user accounts', 'Inventory & suppliers', 'Full reports & export', 'Multi-branch', 'Role-based permissions', 'Low-stock alerts'],
    highlighted: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    price: 6500,
    period: 'per month',
    users: 50,
    branches: 20,
    features: ['Everything in Business', '50 user accounts', '20 branches', 'Priority support', 'API access', 'Dedicated onboarding'],
  },
];

export const currentSubscription = {
  plan: 'Business',
  price: 2500,
  billingCycle: 'Monthly',
  startDate: '2026-07-01',
  expiryDate: '2026-08-31',
  status: 'Active',
  users: { used: 5, limit: 10 },
  branches: { used: 3, limit: 3 },
  storage: { used: 2.4, limit: 10 },
  paymentMethod: 'M-PESA · +254 700 123 456',
};