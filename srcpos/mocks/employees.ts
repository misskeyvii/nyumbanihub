export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  branch: string;
  status: 'active' | 'suspended';
  lastLogin: string;
  salesCount: number;
}

export const roles = ['Owner', 'Manager', 'Cashier', 'Stock Manager', 'Accountant'];

export const employees: Employee[] = [
  { id: 'emp-001', name: 'Grace Wanjiru', role: 'Owner', phone: '+254 700 123 456', email: 'grace@abcminimart.co.ke', branch: 'Main Branch', status: 'active', lastLogin: '2026-08-13T08:05:00Z', salesCount: 0 },
  { id: 'emp-002', name: 'Brian Otieno', role: 'Cashier', phone: '+254 712 234 567', email: 'brian@abcminimart.co.ke', branch: 'Main Branch', status: 'active', lastLogin: '2026-08-13T09:52:00Z', salesCount: 84 },
  { id: 'emp-003', name: 'Mercy Wambui', role: 'Cashier', phone: '+254 723 345 678', email: 'mercy@abcminimart.co.ke', branch: 'Westlands Branch', status: 'active', lastLogin: '2026-08-12T18:30:00Z', salesCount: 43 },
  { id: 'emp-004', name: 'Kevin Barasa', role: 'Stock Manager', phone: '+254 734 456 789', email: 'kevin@abcminimart.co.ke', branch: 'Main Branch', status: 'active', lastLogin: '2026-08-12T16:15:00Z', salesCount: 0 },
  { id: 'emp-005', name: 'Esther Njoki', role: 'Accountant', phone: '+254 745 567 890', email: 'esther@abcminimart.co.ke', branch: 'Main Branch', status: 'suspended', lastLogin: '2026-07-28T10:00:00Z', salesCount: 0 },
];

export const roleTones: Record<string, string> = {
  Owner: 'bg-primary-100 text-primary-700',
  Manager: 'bg-accent-100 text-accent-700',
  Cashier: 'bg-secondary-100 text-secondary-700',
  'Stock Manager': 'bg-primary-100 text-primary-700',
  Accountant: 'bg-accent-100 text-accent-700',
};