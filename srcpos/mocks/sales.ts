export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  date: string;
  cashier: string;
  customer: string;
  items: SaleItem[];
  total: number;
  paymentMethod: string;
  status: 'completed' | 'refunded';
}

export interface SalesChartPoint {
  day: string;
  sales: number;
}

export interface TopProduct {
  id: string;
  name: string;
  units: number;
  revenue: number;
  tone: 'primary' | 'accent' | 'secondary';
}

export const sales: Sale[] = [
  {
    id: 's-001',
    receiptNo: 'NL-00001-7842',
    date: '2026-08-13T10:24:00Z',
    cashier: 'Brian Otieno',
    customer: 'Walking Customer',
    items: [
      { productId: 'p-001', name: 'Coca Cola 500ml', qty: 2, unitPrice: 60 },
      { productId: 'p-007', name: 'Fresh Milk 1L', qty: 1, unitPrice: 120 },
      { productId: 'p-013', name: 'White Bread 400g', qty: 1, unitPrice: 70 },
    ],
    total: 310,
    paymentMethod: 'M-PESA',
    status: 'completed',
  },
  {
    id: 's-002',
    receiptNo: 'NL-00001-7841',
    date: '2026-08-13T09:58:00Z',
    cashier: 'Brian Otieno',
    customer: 'Peter Kamau',
    items: [
      { productId: 'p-017', name: 'Pampers Jumbo Pack', qty: 1, unitPrice: 1150 },
      { productId: 'p-015', name: 'Vaseline 250ml', qty: 1, unitPrice: 220 },
    ],
    total: 1370,
    paymentMethod: 'Card',
    status: 'completed',
  },
  {
    id: 's-003',
    receiptNo: 'NL-00001-7840',
    date: '2026-08-13T09:31:00Z',
    cashier: 'Mercy Wambui',
    customer: 'Walking Customer',
    items: [
      { productId: 'p-003', name: 'Dasani Water 1L', qty: 4, unitPrice: 80 },
      { productId: 'p-006', name: 'Safari Cakes 250g', qty: 2, unitPrice: 95 },
    ],
    total: 510,
    paymentMethod: 'Cash',
    status: 'completed',
  },
  {
    id: 's-004',
    receiptNo: 'NL-00001-7839',
    date: '2026-08-12T18:42:00Z',
    cashier: 'Brian Otieno',
    customer: 'Mary Achieng',
    items: [
      { productId: 'p-009', name: 'Eggs (Tray of 30)', qty: 1, unitPrice: 520 },
      { productId: 'p-011', name: 'Sunlight Soap 200g', qty: 3, unitPrice: 60 },
      { productId: 'p-007', name: 'Fresh Milk 1L', qty: 2, unitPrice: 120 },
    ],
    total: 940,
    paymentMethod: 'M-PESA',
    status: 'completed',
  },
  {
    id: 's-005',
    receiptNo: 'NL-00001-7838',
    date: '2026-08-12T16:05:00Z',
    cashier: 'Mercy Wambui',
    customer: 'Amina Hassan',
    items: [
      { productId: 'p-010', name: 'Omo Detergent 500g', qty: 2, unitPrice: 120 },
      { productId: 'p-012', name: 'Jik Bleach 750ml', qty: 1, unitPrice: 110 },
    ],
    total: 350,
    paymentMethod: 'Cash',
    status: 'completed',
  },
  {
    id: 's-006',
    receiptNo: 'NL-00001-7837',
    date: '2026-08-12T12:18:00Z',
    cashier: 'Brian Otieno',
    customer: 'James Otieno',
    items: [
      { productId: 'p-004', name: 'Del Monte Juice 1L', qty: 2, unitPrice: 240 },
      { productId: 'p-014', name: 'Brown Bread 400g', qty: 1, unitPrice: 75 },
    ],
    total: 555,
    paymentMethod: 'Card',
    status: 'completed',
  },
  {
    id: 's-007',
    receiptNo: 'NL-00001-7836',
    date: '2026-08-11T15:40:00Z',
    cashier: 'Mercy Wambui',
    customer: 'Walking Customer',
    items: [
      { productId: 'p-002', name: 'Fanta Orange 500ml', qty: 3, unitPrice: 60 },
      { productId: 'p-005', name: 'Lays Chips 150g', qty: 2, unitPrice: 130 },
    ],
    total: 440,
    paymentMethod: 'M-PESA',
    status: 'completed',
  },
];

export const salesChartData: SalesChartPoint[] = [
  { day: 'Mon', sales: 18400 },
  { day: 'Tue', sales: 22150 },
  { day: 'Wed', sales: 17900 },
  { day: 'Thu', sales: 26300 },
  { day: 'Fri', sales: 31550 },
  { day: 'Sat', sales: 40200 },
  { day: 'Sun', sales: 36250 },
];

export const topProducts: TopProduct[] = [
  { id: 'p-001', name: 'Coca Cola 500ml', units: 248, revenue: 14880, tone: 'primary' },
  { id: 'p-007', name: 'Fresh Milk 1L', units: 186, revenue: 22320, tone: 'accent' },
  { id: 'p-013', name: 'White Bread 400g', units: 162, revenue: 11340, tone: 'secondary' },
  { id: 'p-003', name: 'Dasani Water 1L', units: 145, revenue: 11600, tone: 'primary' },
  { id: 'p-009', name: 'Eggs (Tray of 30)', units: 98, revenue: 50960, tone: 'accent' },
];