export interface BranchDetail {
  id: string;
  name: string;
  location: string;
  manager: string;
  phone: string;
  employees: number;
  status: 'active' | 'inactive';
  todaySales: number;
  monthSales: number;
}

export const branchList: BranchDetail[] = [
  { id: 'br-001', name: 'Main Branch', location: 'Moi Avenue, Nairobi', manager: 'Grace Wanjiru', phone: '+254 700 123 456', employees: 4, status: 'active', todaySales: 28450, monthSales: 642300 },
  { id: 'br-002', name: 'Westlands Branch', location: 'Westlands, Nairobi', manager: 'Mercy Wambui', phone: '+254 711 234 567', employees: 3, status: 'active', todaySales: 19800, monthSales: 415700 },
  { id: 'br-003', name: 'Kisumu Branch', location: 'Oginga Odinga St, Kisumu', manager: 'Pending', phone: '+254 722 345 678', employees: 0, status: 'inactive', todaySales: 0, monthSales: 0 },
];