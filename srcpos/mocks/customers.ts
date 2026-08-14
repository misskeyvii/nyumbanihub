export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  visits: number;
  lastVisit: string;
}

export const customers: Customer[] = [
  { id: 'c-001', name: 'Mary Achieng', phone: '+254 712 345 678', email: 'mary.achieng@gmail.com', totalSpent: 24800, visits: 42, lastVisit: '2026-08-12T18:42:00Z' },
  { id: 'c-002', name: 'James Otieno', phone: '+254 722 456 789', email: 'jotieno@yahoo.com', totalSpent: 51250, visits: 68, lastVisit: '2026-08-12T09:15:00Z' },
  { id: 'c-003', name: 'Faith Njeri', phone: '+254 733 567 890', email: 'faith.njeri@gmail.com', totalSpent: 18750, visits: 31, lastVisit: '2026-08-11T16:30:00Z' },
  { id: 'c-004', name: 'Peter Kamau', phone: '+254 701 678 901', email: 'pkamau@outlook.com', totalSpent: 96300, visits: 104, lastVisit: '2026-08-13T11:05:00Z' },
  { id: 'c-005', name: 'Amina Hassan', phone: '+254 710 789 012', email: 'amina.hassan@gmail.com', totalSpent: 33200, visits: 55, lastVisit: '2026-08-10T14:20:00Z' },
  { id: 'c-006', name: 'Walking Customer', phone: '—', email: '', totalSpent: 0, visits: 0, lastVisit: '' },
];