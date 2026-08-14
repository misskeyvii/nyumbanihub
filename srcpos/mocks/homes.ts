export interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  bedrooms: number;
  rent: number;
  status: 'Occupied' | 'Vacant' | 'Maintenance';
  tenant?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  property: string;
  rent: number;
  balance: number;
  status: 'Current' | 'Arrears' | 'Notice';
  initials: string;
}

export interface MaintenanceRequest {
  id: string;
  property: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In progress' | 'Resolved';
  date: string;
}

export const homeProperties: Property[] = [
  { id: 'hp-001', name: 'Kilimani 2BR Apartment', location: 'Kilimani, Nairobi', type: 'Apartment', bedrooms: 2, rent: 55000, status: 'Occupied', tenant: 'John Kamau' },
  { id: 'hp-002', name: 'Ruiru 3BR Bungalow', location: 'Ruiru, Kiambu', type: 'Bungalow', bedrooms: 3, rent: 32000, status: 'Occupied', tenant: 'Mary Njeri' },
  { id: 'hp-003', name: 'Westlands 1BR Studio', location: 'Westlands, Nairobi', type: 'Studio', bedrooms: 1, rent: 38000, status: 'Vacant' },
  { id: 'hp-004', name: 'Syokimau 4BR Maisonette', location: 'Syokimau, Machakos', type: 'Maisonette', bedrooms: 4, rent: 65000, status: 'Occupied', tenant: 'Peter Ochieng' },
  { id: 'hp-005', name: 'Ngong 2BR Townhouse', location: 'Ngong, Kajiado', type: 'Townhouse', bedrooms: 2, rent: 42000, status: 'Maintenance' },
  { id: 'hp-006', name: 'Kasarani 3BR Apartment', location: 'Kasarani, Nairobi', type: 'Apartment', bedrooms: 3, rent: 45000, status: 'Vacant' },
];

export const homeTenants: Tenant[] = [
  { id: 'tn-001', name: 'John Kamau', phone: '+254 722 111 222', property: 'Kilimani 2BR Apartment', rent: 55000, balance: 0, status: 'Current', initials: 'JK' },
  { id: 'tn-002', name: 'Mary Njeri', phone: '+254 733 222 333', property: 'Ruiru 3BR Bungalow', rent: 32000, balance: 0, status: 'Current', initials: 'MN' },
  { id: 'tn-003', name: 'Peter Ochieng', phone: '+254 744 333 444', property: 'Syokimau 4BR Maisonette', rent: 65000, balance: 65000, status: 'Arrears', initials: 'PO' },
  { id: 'tn-004', name: 'Grace Atieno', phone: '+254 755 444 555', property: 'Ngong 2BR Townhouse', rent: 42000, balance: 84000, status: 'Arrears', initials: 'GA' },
];

export const homeMaintenance: MaintenanceRequest[] = [
  { id: 'mt-001', property: 'Ngong 2BR Townhouse', issue: 'Leaking kitchen tap', priority: 'Medium', status: 'In progress', date: '2026-08-12' },
  { id: 'mt-002', property: 'Kilimani 2BR Apartment', issue: 'Bathroom ceiling crack', priority: 'High', status: 'Open', date: '2026-08-13' },
  { id: 'mt-003', property: 'Ruiru 3BR Bungalow', issue: 'Repaint living room', priority: 'Low', status: 'Resolved', date: '2026-08-09' },
  { id: 'mt-004', property: 'Syokimau 4BR Maisonette', issue: 'Broken gate motor', priority: 'High', status: 'Open', date: '2026-08-11' },
];