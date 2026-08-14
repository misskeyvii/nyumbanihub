export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  addedBy: string;
  paymentMethod: string;
}

export const expenseCategories = [
  'Rent',
  'Electricity',
  'Water',
  'Salaries',
  'Transport',
  'Internet',
  'Repairs',
  'Marketing',
  'Other',
];

export const expenses: Expense[] = [
  { id: 'ex-001', date: '2026-08-01T09:00:00Z', category: 'Rent', description: 'Shop rent - August', amount: 25000, addedBy: 'Grace Wanjiru', paymentMethod: 'Bank' },
  { id: 'ex-002', date: '2026-08-03T11:30:00Z', category: 'Electricity', description: 'KPLC electricity bill', amount: 4200, addedBy: 'Grace Wanjiru', paymentMethod: 'M-PESA' },
  { id: 'ex-003', date: '2026-08-04T14:00:00Z', category: 'Water', description: 'Nairobi Water bill', amount: 1500, addedBy: 'Grace Wanjiru', paymentMethod: 'M-PESA' },
  { id: 'ex-004', date: '2026-08-05T10:00:00Z', category: 'Salaries', description: 'Staff salaries - July', amount: 72000, addedBy: 'Grace Wanjiru', paymentMethod: 'Bank' },
  { id: 'ex-005', date: '2026-08-06T16:20:00Z', category: 'Transport', description: 'Delivery of supplies', amount: 1800, addedBy: 'Brian Otieno', paymentMethod: 'Cash' },
  { id: 'ex-006', date: '2026-08-07T09:45:00Z', category: 'Internet', description: 'Safaricom Home Fibre', amount: 3000, addedBy: 'Grace Wanjiru', paymentMethod: 'M-PESA' },
  { id: 'ex-007', date: '2026-08-09T13:10:00Z', category: 'Repairs', description: 'Fridge servicing', amount: 3500, addedBy: 'Grace Wanjiru', paymentMethod: 'Cash' },
  { id: 'ex-008', date: '2026-08-10T15:30:00Z', category: 'Marketing', description: 'Flyers & social media ads', amount: 6000, addedBy: 'Grace Wanjiru', paymentMethod: 'M-PESA' },
  { id: 'ex-009', date: '2026-08-12T11:00:00Z', category: 'Transport', description: 'Supplier pickup - Kenchic', amount: 950, addedBy: 'Mercy Wambui', paymentMethod: 'Cash' },
  { id: 'ex-010', date: '2026-08-12T17:40:00Z', category: 'Other', description: 'Cleaning supplies', amount: 1200, addedBy: 'Mercy Wambui', paymentMethod: 'Cash' },
];