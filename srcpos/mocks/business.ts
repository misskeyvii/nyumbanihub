export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface BusinessUser {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
}

export interface Business {
  id: string;
  posId: string;
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  type: string;
}

export const currentBusiness: Business = {
  id: 'NL-00001',
  posId: 'NL-00001',
  name: 'ABC Mini Mart',
  tagline: 'Simple tools. Smarter business.',
  phone: '+254 700 123 456',
  email: 'hello@abcminimart.co.ke',
  address: 'Moi Avenue, Nairobi, Kenya',
  currency: 'KES',
  type: 'Retail / Mini Market',
};

export const currentUser: BusinessUser = {
  id: 'usr-001',
  name: 'Grace Wanjiru',
  role: 'Owner',
  email: 'grace@abcminimart.co.ke',
  initials: 'GW',
};

export const branches: Branch[] = [
  { id: 'br-001', name: 'Main Branch', location: 'Moi Avenue, Nairobi' },
  { id: 'br-002', name: 'Westlands Branch', location: 'Westlands, Nairobi' },
  { id: 'br-003', name: 'Kisumu Branch', location: 'Oginga Odinga St, Kisumu' },
];