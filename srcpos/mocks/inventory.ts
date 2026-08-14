export type MovementType = 'Sale' | 'Restock' | 'Adjustment' | 'Damaged' | 'Return';

export interface StockMovement {
  id: string;
  date: string;
  product: string;
  type: MovementType;
  reason: string;
  qty: number;
  prevStock: number;
  newStock: number;
  user: string;
}

export const stockMovements: StockMovement[] = [
  { id: 'mv-014', date: '2026-08-13T10:24:00Z', product: 'Coca Cola 500ml', type: 'Sale', reason: 'Sale NL-00001-7842', qty: -2, prevStock: 126, newStock: 124, user: 'Brian Otieno' },
  { id: 'mv-013', date: '2026-08-13T09:58:00Z', product: 'Pampers Jumbo Pack', type: 'Sale', reason: 'Sale NL-00001-7841', qty: -1, prevStock: 17, newStock: 16, user: 'Brian Otieno' },
  { id: 'mv-012', date: '2026-08-13T08:30:00Z', product: 'Omo Detergent 500g', type: 'Restock', reason: 'Supplier delivery', qty: 12, prevStock: 3, newStock: 15, user: 'Grace Wanjiru' },
  { id: 'mv-011', date: '2026-08-12T18:42:00Z', product: 'Eggs (Tray of 30)', type: 'Sale', reason: 'Sale NL-00001-7839', qty: -1, prevStock: 19, newStock: 18, user: 'Brian Otieno' },
  { id: 'mv-010', date: '2026-08-12T16:05:00Z', product: 'Jik Bleach 750ml', type: 'Sale', reason: 'Sale NL-00001-7838', qty: -1, prevStock: 53, newStock: 52, user: 'Mercy Wambui' },
  { id: 'mv-009', date: '2026-08-12T12:18:00Z', product: 'Brown Bread 400g', type: 'Sale', reason: 'Sale NL-00001-7837', qty: -1, prevStock: 23, newStock: 22, user: 'Brian Otieno' },
  { id: 'mv-008', date: '2026-08-12T10:00:00Z', product: 'Mombasa Biscuits', type: 'Damaged', reason: 'Broken packs on shelf', qty: -3, prevStock: 3, newStock: 0, user: 'Mercy Wambui' },
  { id: 'mv-007', date: '2026-08-11T15:40:00Z', product: 'Lays Chips 150g', type: 'Sale', reason: 'Sale NL-00001-7836', qty: -2, prevStock: 14, newStock: 12, user: 'Mercy Wambui' },
  { id: 'mv-006', date: '2026-08-11T09:15:00Z', product: 'Dasani Water 1L', type: 'Restock', reason: 'Supplier delivery', qty: 60, prevStock: 150, newStock: 210, user: 'Grace Wanjiru' },
  { id: 'mv-005', date: '2026-08-10T14:20:00Z', product: 'Fresh Milk 1L', type: 'Sale', reason: 'Sale NL-00001-7830', qty: -3, prevStock: 10, newStock: 7, user: 'Brian Otieno' },
  { id: 'mv-004', date: '2026-08-10T11:00:00Z', product: 'Sunlight Soap 200g', type: 'Restock', reason: 'Supplier delivery', qty: 40, prevStock: 56, newStock: 96, user: 'Grace Wanjiru' },
  { id: 'mv-003', date: '2026-08-09T16:30:00Z', product: 'Colgate Toothpaste', type: 'Adjustment', reason: 'Stock count correction', qty: -2, prevStock: 40, newStock: 38, user: 'Grace Wanjiru' },
  { id: 'mv-002', date: '2026-08-09T13:10:00Z', product: 'Pampers Jumbo Pack', type: 'Return', reason: 'Customer return - wrong size', qty: 1, prevStock: 15, newStock: 16, user: 'Mercy Wambui' },
  { id: 'mv-001', date: '2026-08-08T10:45:00Z', product: 'Del Monte Juice 1L', type: 'Restock', reason: 'Supplier delivery', qty: 24, prevStock: 10, newStock: 34, user: 'Grace Wanjiru' },
];

export const movementTypeTones: Record<MovementType, string> = {
  Sale: 'bg-primary-100 text-primary-700',
  Restock: 'bg-secondary-100 text-secondary-700',
  Adjustment: 'bg-accent-100 text-accent-700',
  Damaged: 'bg-accent-100 text-accent-700',
  Return: 'bg-primary-100 text-primary-700',
};