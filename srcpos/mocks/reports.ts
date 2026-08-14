export interface CategorySales {
  name: string;
  sales: number;
}

export interface PaymentSplit {
  name: string;
  value: number;
}

export interface EmployeeSales {
  name: string;
  sales: number;
  transactions: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  expenses: number;
}

export const salesByCategory: CategorySales[] = [
  { name: 'Beverages', sales: 118400 },
  { name: 'Dairy & Eggs', sales: 86400 },
  { name: 'Personal Care', sales: 74200 },
  { name: 'Snacks', sales: 52300 },
  { name: 'Household', sales: 46800 },
  { name: 'Bakery', sales: 38900 },
];

export const salesByPayment: PaymentSplit[] = [
  { name: 'M-PESA', value: 46 },
  { name: 'Cash', value: 32 },
  { name: 'Card', value: 18 },
  { name: 'Bank', value: 4 },
];

export const salesByEmployee: EmployeeSales[] = [
  { name: 'Brian Otieno', sales: 482600, transactions: 312 },
  { name: 'Mercy Wambui', sales: 364200, transactions: 241 },
  { name: 'Grace Wanjiru', sales: 118300, transactions: 67 },
];

export const monthlyRevenue: RevenuePoint[] = [
  { month: 'Mar', revenue: 412000, expenses: 198000 },
  { month: 'Apr', revenue: 448000, expenses: 206000 },
  { month: 'May', revenue: 439000, expenses: 212000 },
  { month: 'Jun', revenue: 501000, expenses: 224000 },
  { month: 'Jul', revenue: 556000, expenses: 231000 },
  { month: 'Aug', revenue: 483000, expenses: 162000 },
];

export const fastMoving = [
  { name: 'Coca Cola 500ml', units: 248 },
  { name: 'Fresh Milk 1L', units: 186 },
  { name: 'White Bread 400g', units: 162 },
  { name: 'Dasani Water 1L', units: 145 },
];

export const slowMoving = [
  { name: 'Pampers Jumbo Pack', units: 12 },
  { name: 'Jik Bleach 750ml', units: 18 },
  { name: 'Colgate Toothpaste', units: 22 },
  { name: 'Brown Bread 400g', units: 26 },
];