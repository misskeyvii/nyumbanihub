export type DemoType = 'shop' | 'hotel' | 'airbnb' | 'marketplace' | 'homes';
export type Role = 'admin' | 'staff';

export interface DemoAccount {
  type: DemoType;
  role: 'admin';
  label: string;
  email: string;
  password: string;
  businessName: string;
  posId: string;
  plan: string;
  address: string;
  phone: string;
  ownerName: string;
  ownerRole: string;
  ownerEmail: string;
  ownerInitials: string;
  icon: string;
  homePath: string;
  whatYouSee: string;
  accent: 'primary' | 'accent' | 'secondary';
}

export interface StaffAccount {
  type: DemoType;
  role: 'staff';
  title: string;
  label: string;
  name: string;
  email: string;
  password: string;
  initials: string;
}

export const demoAccounts: DemoAccount[] = [
  {
    type: 'shop',
    role: 'admin',
    label: 'Shop / Retail',
    email: 'shop@nyumbanilink.com',
    password: 'demo1234',
    businessName: 'ABC Mini Mart',
    posId: 'NL-00001',
    plan: 'Business Plan',
    address: 'Moi Avenue, Nairobi, Kenya',
    phone: '+254 700 123 456',
    ownerName: 'Grace Wanjiru',
    ownerRole: 'Owner',
    ownerEmail: 'grace@abcminimart.co.ke',
    ownerInitials: 'GW',
    icon: 'ri-store-2-line',
    homePath: '/app/dashboard',
    whatYouSee: 'Sales dashboard, POS checkout, products, inventory and employees.',
    accent: 'primary',
  },
  {
    type: 'hotel',
    role: 'admin',
    label: 'Hotel',
    email: 'hotel@nyumbanilink.com',
    password: 'demo1234',
    businessName: 'Savanna Garden Hotel',
    posId: 'NL-00002',
    plan: 'Hotel Plan',
    address: 'Kenyatta Avenue, Nairobi, Kenya',
    phone: '+254 722 555 010',
    ownerName: 'Daniel Otieno',
    ownerRole: 'General Manager',
    ownerEmail: 'daniel@savannagarden.co.ke',
    ownerInitials: 'DO',
    icon: 'ri-hotel-bed-line',
    homePath: '/app/hotel',
    whatYouSee: 'Rooms & bookings, food & drinks menu, swimming pool & amenities, waiters.',
    accent: 'accent',
  },
  {
    type: 'airbnb',
    role: 'admin',
    label: 'Airbnb',
    email: 'airbnb@nyumbanilink.com',
    password: 'demo1234',
    businessName: 'Kijiji Stays',
    posId: 'NL-00003',
    plan: 'Airbnb Plan',
    address: 'Westlands, Nairobi, Kenya',
    phone: '+254 733 444 020',
    ownerName: 'Amina Hassan',
    ownerRole: 'Host',
    ownerEmail: 'amina@kijijistays.co.ke',
    ownerInitials: 'AH',
    icon: 'ri-home-5-line',
    homePath: '/app/airbnb',
    whatYouSee: 'Your listings, booked vs available units, upcoming guests and cleaning.',
    accent: 'secondary',
  },
  {
    type: 'marketplace',
    role: 'admin',
    label: 'Marketplace',
    email: 'market@nyumbanilink.com',
    password: 'demo1234',
    businessName: 'Nyumbani Market',
    posId: 'NL-00004',
    plan: 'Marketplace Plan',
    address: 'Ngong Road, Nairobi, Kenya',
    phone: '+254 711 222 030',
    ownerName: 'Kevin Mwangi',
    ownerRole: 'Marketplace Admin',
    ownerEmail: 'kevin@nyumbanimarket.co.ke',
    ownerInitials: 'KM',
    icon: 'ri-store-3-line',
    homePath: '/app/marketplace',
    whatYouSee: 'Orders, vendors & payouts, active listings and top categories.',
    accent: 'primary',
  },
  {
    type: 'homes',
    role: 'admin',
    label: 'Homes / Rentals',
    email: 'homes@nyumbanilink.com',
    password: 'demo1234',
    businessName: 'Nyumbani Homes',
    posId: 'NL-00005',
    plan: 'Homes Plan',
    address: 'Kilimani, Nairobi, Kenya',
    phone: '+254 700 999 040',
    ownerName: 'Faith Chebet',
    ownerRole: 'Property Manager',
    ownerEmail: 'faith@nyumbanihomes.co.ke',
    ownerInitials: 'FC',
    icon: 'ri-building-2-line',
    homePath: '/app/homes',
    whatYouSee: 'Properties, tenants, rent due and maintenance requests.',
    accent: 'accent',
  },
];

export const staffAccounts: StaffAccount[] = [
  {
    type: 'shop',
    role: 'staff',
    title: 'Cashier',
    label: 'Cashier',
    name: 'Brian Otieno',
    email: 'brian@abcminimart.co.ke',
    password: 'demo1234',
    initials: 'BO',
  },
  {
    type: 'hotel',
    role: 'staff',
    title: 'Waiter',
    label: 'Waiter',
    name: 'Mercy Wanjiku',
    email: 'mercy@savannagarden.co.ke',
    password: 'demo1234',
    initials: 'MW',
  },
  {
    type: 'airbnb',
    role: 'staff',
    title: 'Front Desk',
    label: 'Front Desk',
    name: 'Hellen Wairimu',
    email: 'hellen@kijijistays.co.ke',
    password: 'demo1234',
    initials: 'HW',
  },
  {
    type: 'marketplace',
    role: 'staff',
    title: 'Support',
    label: 'Support',
    name: 'Daniel Kiptoo',
    email: 'daniel@nyumbanimarket.co.ke',
    password: 'demo1234',
    initials: 'DK',
  },
  {
    type: 'homes',
    role: 'staff',
    title: 'Caretaker',
    label: 'Caretaker',
    name: 'Peter Njoroge',
    email: 'peter@nyumbanihomes.co.ke',
    password: 'demo1234',
    initials: 'PN',
  },
];

export function getDemoAccount(type: DemoType): DemoAccount {
  return demoAccounts.find((account) => account.type === type) ?? demoAccounts[0];
}

export function getStaffAccount(type: DemoType): StaffAccount {
  return staffAccounts.find((account) => account.type === type) ?? staffAccounts[0];
}

export function homePathFor(type: DemoType): string {
  return getDemoAccount(type).homePath;
}