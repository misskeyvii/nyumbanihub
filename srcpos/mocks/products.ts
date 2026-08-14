export type Tone = 'primary' | 'accent' | 'secondary';

export interface Category {
  id: string;
  name: string;
  icon: string;
  tone: Tone;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  supplier: string;
  status: 'active' | 'inactive';
}

export const categories: Category[] = [
  { id: 'cat-beverages', name: 'Beverages', icon: 'ri-cup-line', tone: 'primary' },
  { id: 'cat-snacks', name: 'Snacks', icon: 'ri-cake-line', tone: 'accent' },
  { id: 'cat-dairy', name: 'Dairy & Eggs', icon: 'ri-drop-line', tone: 'secondary' },
  { id: 'cat-household', name: 'Household', icon: 'ri-home-2-line', tone: 'accent' },
  { id: 'cat-bakery', name: 'Bakery', icon: 'ri-restaurant-line', tone: 'secondary' },
  { id: 'cat-personal', name: 'Personal Care', icon: 'ri-heart-line', tone: 'primary' },
];

export const products: Product[] = [
  { id: 'p-001', name: 'Coca Cola 500ml', sku: 'BEV-001', barcode: '5449000000996', category: 'Beverages', brand: 'Coca Cola', buyingPrice: 45, sellingPrice: 60, stock: 124, minStock: 20, supplier: 'Nairobi Bottlers', status: 'active' },
  { id: 'p-002', name: 'Fanta Orange 500ml', sku: 'BEV-002', barcode: '5449000000439', category: 'Beverages', brand: 'Coca Cola', buyingPrice: 45, sellingPrice: 60, stock: 88, minStock: 20, supplier: 'Nairobi Bottlers', status: 'active' },
  { id: 'p-003', name: 'Dasani Water 1L', sku: 'BEV-003', barcode: '5449000000774', category: 'Beverages', brand: 'Dasani', buyingPrice: 50, sellingPrice: 80, stock: 210, minStock: 30, supplier: 'Nairobi Bottlers', status: 'active' },
  { id: 'p-004', name: 'Del Monte Juice 1L', sku: 'BEV-004', barcode: '6161103330012', category: 'Beverages', brand: 'Del Monte', buyingPrice: 180, sellingPrice: 240, stock: 34, minStock: 15, supplier: 'Del Monte Kenya', status: 'active' },
  { id: 'p-005', name: 'Lays Chips 150g', sku: 'SNK-001', barcode: '7892840814652', category: 'Snacks', brand: 'Lays', buyingPrice: 90, sellingPrice: 130, stock: 12, minStock: 15, supplier: 'Jumbo Distributors', status: 'active' },
  { id: 'p-006', name: 'Safari Cakes 250g', sku: 'SNK-002', barcode: '6161103008123', category: 'Snacks', brand: 'Safari', buyingPrice: 65, sellingPrice: 95, stock: 46, minStock: 10, supplier: 'Jumbo Distributors', status: 'active' },
  { id: 'p-007', name: 'Fresh Milk 1L', sku: 'DRY-001', barcode: '6164003066019', category: 'Dairy & Eggs', brand: 'Brookside', buyingPrice: 95, sellingPrice: 120, stock: 7, minStock: 20, supplier: 'Brookside Dairy', status: 'active' },
  { id: 'p-008', name: 'Yoghurt 500ml', sku: 'DRY-002', barcode: '6164003123456', category: 'Dairy & Eggs', brand: 'Brookside', buyingPrice: 110, sellingPrice: 150, stock: 28, minStock: 12, supplier: 'Brookside Dairy', status: 'active' },
  { id: 'p-009', name: 'Eggs (Tray of 30)', sku: 'DRY-003', barcode: '6164000987654', category: 'Dairy & Eggs', brand: 'Kenchic', buyingPrice: 420, sellingPrice: 520, stock: 18, minStock: 10, supplier: 'Kenchic Farms', status: 'active' },
  { id: 'p-010', name: 'Omo Detergent 500g', sku: 'HSH-001', barcode: '6001067031729', category: 'Household', brand: 'Omo', buyingPrice: 85, sellingPrice: 120, stock: 3, minStock: 10, supplier: 'Unilever Kenya', status: 'active' },
  { id: 'p-011', name: 'Sunlight Soap 200g', sku: 'HSH-002', barcode: '6001067021409', category: 'Household', brand: 'Sunlight', buyingPrice: 40, sellingPrice: 60, stock: 96, minStock: 20, supplier: 'Unilever Kenya', status: 'active' },
  { id: 'p-012', name: 'Jik Bleach 750ml', sku: 'HSH-003', barcode: '6001067066899', category: 'Household', brand: 'Jik', buyingPrice: 75, sellingPrice: 110, stock: 52, minStock: 15, supplier: 'Reckitt Benckiser', status: 'active' },
  { id: 'p-013', name: 'White Bread 400g', sku: 'BKR-001', barcode: '6161003500001', category: 'Bakery', brand: 'Supaloaf', buyingPrice: 50, sellingPrice: 70, stock: 40, minStock: 15, supplier: 'Supaloaf Bakeries', status: 'active' },
  { id: 'p-014', name: 'Brown Bread 400g', sku: 'BKR-002', barcode: '6161003500002', category: 'Bakery', brand: 'Supaloaf', buyingPrice: 55, sellingPrice: 75, stock: 22, minStock: 15, supplier: 'Supaloaf Bakeries', status: 'active' },
  { id: 'p-015', name: 'Vaseline 250ml', sku: 'PC-001', barcode: '6001067010251', category: 'Personal Care', brand: 'Vaseline', buyingPrice: 150, sellingPrice: 220, stock: 64, minStock: 12, supplier: 'Unilever Kenya', status: 'active' },
  { id: 'p-016', name: 'Colgate Toothpaste', sku: 'PC-002', barcode: '8714789870632', category: 'Personal Care', brand: 'Colgate', buyingPrice: 120, sellingPrice: 180, stock: 38, minStock: 10, supplier: 'Colgate-Palmolive', status: 'active' },
  { id: 'p-017', name: 'Pampers Jumbo Pack', sku: 'PC-003', barcode: '4015400638229', category: 'Personal Care', brand: 'Pampers', buyingPrice: 950, sellingPrice: 1150, stock: 16, minStock: 8, supplier: 'Procter & Gamble', status: 'active' },
  { id: 'p-018', name: 'Mombasa Biscuits', sku: 'SNK-003', barcode: '6161003200012', category: 'Snacks', brand: 'Mombasa', buyingPrice: 55, sellingPrice: 80, stock: 0, minStock: 12, supplier: 'Jumbo Distributors', status: 'active' },
];