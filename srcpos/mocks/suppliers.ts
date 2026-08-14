export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  productsSupplied: number;
  totalPurchases: number;
  amountOwed: number;
}

export const suppliers: Supplier[] = [
  { id: 'sup-001', name: 'Nairobi Bottlers', contact: 'David Mwangi', phone: '+254 733 111 222', email: 'sales@nairobibottlers.co.ke', address: 'Industrial Area, Nairobi', productsSupplied: 3, totalPurchases: 184000, amountOwed: 32000 },
  { id: 'sup-002', name: 'Brookside Dairy', contact: 'Lucy Akinyi', phone: '+254 711 222 333', email: 'orders@brookside.co.ke', address: 'Ruiru, Kiambu', productsSupplied: 2, totalPurchases: 96500, amountOwed: 0 },
  { id: 'sup-003', name: 'Unilever Kenya', contact: 'Samuel Kiprop', phone: '+254 722 333 444', email: 'distribution@unilever.co.ke', address: 'Industrial Area, Nairobi', productsSupplied: 3, totalPurchases: 132800, amountOwed: 21500 },
  { id: 'sup-004', name: 'Jumbo Distributors', contact: 'Fatuma Ali', phone: '+254 733 444 555', email: 'orders@jumbodist.co.ke', address: 'Eastleigh, Nairobi', productsSupplied: 3, totalPurchases: 67400, amountOwed: 8900 },
  { id: 'sup-005', name: 'Supaloaf Bakeries', contact: 'Peter Ndungu', phone: '+254 700 555 666', email: 'sales@supaloaf.co.ke', address: 'Kasarani, Nairobi', productsSupplied: 2, totalPurchases: 42500, amountOwed: 0 },
  { id: 'sup-006', name: 'Kenchic Farms', contact: 'Joyce Wairimu', phone: '+254 710 666 777', email: 'supply@kenchic.co.ke', address: 'Athi River, Machakos', productsSupplied: 1, totalPurchases: 41800, amountOwed: 12000 },
  { id: 'sup-007', name: 'Colgate-Palmolive', contact: 'Brian Kariuki', phone: '+254 721 777 888', email: 'kenya@colpal.com', address: 'Westlands, Nairobi', productsSupplied: 1, totalPurchases: 38600, amountOwed: 0 },
];