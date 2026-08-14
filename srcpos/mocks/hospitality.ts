export type RoomStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';

export interface HotelRoom {
  id: string;
  number: string;
  type: string;
  floor: number;
  price: number;
  guests: number;
  status: RoomStatus;
  guestName?: string;
}

export interface HotelBooking {
  id: string;
  guest: string;
  phone: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: 'Booked' | 'Checked-in' | 'Checked-out';
  total: number;
  payment: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Food' | 'Drinks';
  price: number;
  available: boolean;
  icon: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  offered: boolean;
  status: string;
  hours: string;
  capacity?: number;
  description: string;
}

export interface Waiter {
  id: string;
  name: string;
  phone: string;
  shift: string;
  status: 'On duty' | 'Off duty' | 'On leave';
  tables: string;
  initials: string;
}

export const hotelRooms: HotelRoom[] = [
  { id: 'rm-101', number: '101', type: 'Standard', floor: 1, price: 4500, guests: 2, status: 'Occupied', guestName: 'Jane Mwende' },
  { id: 'rm-102', number: '102', type: 'Standard', floor: 1, price: 4500, guests: 2, status: 'Available' },
  { id: 'rm-103', number: '103', type: 'Deluxe', floor: 1, price: 7000, guests: 2, status: 'Occupied', guestName: 'Mark Otieno' },
  { id: 'rm-104', number: '104', type: 'Deluxe', floor: 1, price: 7000, guests: 2, status: 'Cleaning' },
  { id: 'rm-201', number: '201', type: 'Standard', floor: 2, price: 4500, guests: 2, status: 'Available' },
  { id: 'rm-202', number: '202', type: 'Suite', floor: 2, price: 12000, guests: 4, status: 'Occupied', guestName: 'Sarah Kimani' },
  { id: 'rm-203', number: '203', type: 'Deluxe', floor: 2, price: 7000, guests: 3, status: 'Available' },
  { id: 'rm-204', number: '204', type: 'Standard', floor: 2, price: 4500, guests: 2, status: 'Maintenance' },
  { id: 'rm-301', number: '301', type: 'Family', floor: 3, price: 9500, guests: 5, status: 'Occupied', guestName: 'The Omondi Family' },
  { id: 'rm-302', number: '302', type: 'Suite', floor: 3, price: 12000, guests: 4, status: 'Available' },
  { id: 'rm-303', number: '303', type: 'Deluxe', floor: 3, price: 7000, guests: 2, status: 'Available' },
  { id: 'rm-304', number: '304', type: 'Family', floor: 3, price: 9500, guests: 5, status: 'Cleaning' },
];

export const hotelBookings: HotelBooking[] = [
  { id: 'bk-001', guest: 'Jane Mwende', phone: '+254 722 111 222', room: '101', checkIn: '2026-08-13', checkOut: '2026-08-15', status: 'Checked-in', total: 9000, payment: 'M-PESA' },
  { id: 'bk-002', guest: 'Mark Otieno', phone: '+254 722 333 444', room: '103', checkIn: '2026-08-12', checkOut: '2026-08-16', status: 'Checked-in', total: 28000, payment: 'Card' },
  { id: 'bk-003', guest: 'Sarah Kimani', phone: '+254 722 555 666', room: '202', checkIn: '2026-08-13', checkOut: '2026-08-14', status: 'Checked-in', total: 12000, payment: 'Cash' },
  { id: 'bk-004', guest: 'The Omondi Family', phone: '+254 722 777 888', room: '301', checkIn: '2026-08-12', checkOut: '2026-08-18', status: 'Checked-in', total: 57000, payment: 'Card' },
  { id: 'bk-005', guest: 'Brian Kipchoge', phone: '+254 722 999 000', room: '203', checkIn: '2026-08-14', checkOut: '2026-08-16', status: 'Booked', total: 14000, payment: 'Bank' },
  { id: 'bk-006', guest: 'Linda Achieng', phone: '+254 733 111 222', room: '302', checkIn: '2026-08-14', checkOut: '2026-08-15', status: 'Booked', total: 12000, payment: 'M-PESA' },
  { id: 'bk-007', guest: 'Peter Njoroge', phone: '+254 733 333 444', room: '201', checkIn: '2026-08-15', checkOut: '2026-08-17', status: 'Booked', total: 9000, payment: 'Cash' },
];

export const hotelMenu: MenuItem[] = [
  { id: 'm-001', name: 'Grilled Tilapia', category: 'Food', price: 850, available: true, icon: 'ri-restaurant-line' },
  { id: 'm-002', name: 'Beef Stew & Ugali', category: 'Food', price: 550, available: true, icon: 'ri-restaurant-line' },
  { id: 'm-003', name: 'Chicken Curry & Rice', category: 'Food', price: 700, available: true, icon: 'ri-restaurant-line' },
  { id: 'm-004', name: 'Nyama Choma Platter', category: 'Food', price: 1200, available: true, icon: 'ri-fire-line' },
  { id: 'm-005', name: 'Full English Breakfast', category: 'Food', price: 600, available: true, icon: 'ri-restaurant-2-line' },
  { id: 'm-006', name: 'Vegetable Pilau', category: 'Food', price: 500, available: true, icon: 'ri-restaurant-line' },
  { id: 'm-007', name: 'Fresh Mango Juice', category: 'Drinks', price: 250, available: true, icon: 'ri-cup-line' },
  { id: 'm-008', name: 'Soda 500ml', category: 'Drinks', price: 100, available: true, icon: 'ri-cup-line' },
  { id: 'm-009', name: 'Bottled Water 1L', category: 'Drinks', price: 120, available: true, icon: 'ri-drop-line' },
  { id: 'm-010', name: 'Tusker Lager', category: 'Drinks', price: 300, available: true, icon: 'ri-cup-line' },
  { id: 'm-011', name: 'Dawa (Lemon & Honey)', category: 'Drinks', price: 200, available: false, icon: 'ri-cup-line' },
  { id: 'm-012', name: 'Cappuccino', category: 'Drinks', price: 350, available: true, icon: 'ri-cup-line' },
];

export const hotelAmenities: Amenity[] = [
  { id: 'am-001', name: 'Swimming Pool', icon: 'ri-water-flash-line', offered: true, status: 'Open', hours: '7:00 AM – 7:00 PM', capacity: 40, description: 'Heated outdoor pool with a lifeguard on duty.' },
  { id: 'am-002', name: 'Gym', icon: 'ri-bike-line', offered: true, status: 'Open', hours: '24 hours', capacity: 15, description: 'Cardio machines and free weights for guests.' },
  { id: 'am-003', name: 'Spa & Massage', icon: 'ri-heart-pulse-line', offered: true, status: 'Open', hours: '9:00 AM – 6:00 PM', description: 'Massage, sauna and steam room treatments.' },
  { id: 'am-004', name: 'Conference Room', icon: 'ri-presentation-line', offered: true, status: 'Open', hours: '8:00 AM – 6:00 PM', capacity: 60, description: 'Meetings and events for up to 60 people.' },
  { id: 'am-005', name: 'Restaurant', icon: 'ri-restaurant-2-line', offered: true, status: 'Open', hours: '6:30 AM – 10:00 PM', capacity: 80, description: 'Buffet and à la carte dining.' },
  { id: 'am-006', name: 'Free Wi-Fi', icon: 'ri-wifi-line', offered: true, status: 'Active', hours: '24 hours', description: 'High-speed internet across the hotel.' },
  { id: 'am-007', name: 'Airport Shuttle', icon: 'ri-bus-line', offered: false, status: 'Unavailable', hours: '—', description: 'Add airport pickup and drop-off for guests.' },
];

export const hotelWaiters: Waiter[] = [
  { id: 'w-001', name: 'Brian Otieno', phone: '+254 700 111 222', shift: 'Morning', status: 'On duty', tables: '1–6', initials: 'BO' },
  { id: 'w-002', name: 'Mercy Achieng', phone: '+254 700 333 444', shift: 'Morning', status: 'On duty', tables: '7–12', initials: 'MA' },
  { id: 'w-003', name: 'Samuel Kiprop', phone: '+254 700 555 666', shift: 'Evening', status: 'Off duty', tables: '1–6', initials: 'SK' },
  { id: 'w-004', name: 'Diana Wambui', phone: '+254 700 777 888', shift: 'Evening', status: 'On duty', tables: '7–12', initials: 'DW' },
  { id: 'w-005', name: 'James Mwangi', phone: '+254 700 999 000', shift: 'Morning', status: 'On leave', tables: 'Pool bar', initials: 'JM' },
];

export type ListingStatus = 'Booked' | 'Available' | 'Checking out' | 'Maintenance';

export interface AirbnbListing {
  id: string;
  name: string;
  location: string;
  bedrooms: number;
  baths: number;
  guests: number;
  nightlyRate: number;
  status: ListingStatus;
  nextGuest?: string;
  nextDates?: string;
  occupancy: number;
}

export interface AirbnbBooking {
  id: string;
  guest: string;
  phone: string;
  listing: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  status: 'Booked' | 'Checked-in' | 'Completed' | 'Cancelled';
}

export const airbnbListings: AirbnbListing[] = [
  { id: 'ls-001', name: 'Westlands Garden Studio', location: 'Westlands, Nairobi', bedrooms: 1, baths: 1, guests: 2, nightlyRate: 4200, status: 'Booked', nextGuest: 'Liam Carter', nextDates: 'Aug 13–15', occupancy: 78 },
  { id: 'ls-002', name: 'Kilimani 2BR Apartment', location: 'Kilimani, Nairobi', bedrooms: 2, baths: 2, guests: 4, nightlyRate: 7500, status: 'Available', occupancy: 64 },
  { id: 'ls-003', name: 'Karen Boutique Villa', location: 'Karen, Nairobi', bedrooms: 3, baths: 3, guests: 6, nightlyRate: 14500, status: 'Booked', nextGuest: 'Sophie N.', nextDates: 'Aug 12–18', occupancy: 82 },
  { id: 'ls-004', name: 'Nyali Beachfront Flat', location: 'Nyali, Mombasa', bedrooms: 2, baths: 2, guests: 5, nightlyRate: 9800, status: 'Available', occupancy: 71 },
  { id: 'ls-005', name: 'Lavington Cozy Loft', location: 'Lavington, Nairobi', bedrooms: 1, baths: 1, guests: 3, nightlyRate: 5600, status: 'Checking out', nextGuest: 'Tom M.', nextDates: 'checkout Aug 13', occupancy: 88 },
  { id: 'ls-006', name: 'Diani Ocean Retreat', location: 'Diani, Kwale', bedrooms: 4, baths: 4, guests: 8, nightlyRate: 21000, status: 'Maintenance', occupancy: 55 },
];

export const airbnbBookings: AirbnbBooking[] = [
  { id: 'ab-001', guest: 'Liam Carter', phone: '+44 7700 900123', listing: 'Westlands Garden Studio', checkIn: '2026-08-13', checkOut: '2026-08-15', nights: 2, total: 8400, status: 'Booked' },
  { id: 'ab-002', guest: 'Sophie Njoroge', phone: '+254 722 123 456', listing: 'Karen Boutique Villa', checkIn: '2026-08-12', checkOut: '2026-08-18', nights: 6, total: 87000, status: 'Checked-in' },
  { id: 'ab-003', guest: 'Tom Mwangi', phone: '+254 733 654 321', listing: 'Lavington Cozy Loft', checkIn: '2026-08-11', checkOut: '2026-08-13', nights: 2, total: 11200, status: 'Completed' },
  { id: 'ab-004', guest: 'Aisha Bello', phone: '+234 803 555 777', listing: 'Nyali Beachfront Flat', checkIn: '2026-08-16', checkOut: '2026-08-20', nights: 4, total: 39200, status: 'Booked' },
  { id: 'ab-005', guest: 'David Kariuki', phone: '+254 700 888 999', listing: 'Kilimani 2BR Apartment', checkIn: '2026-08-20', checkOut: '2026-08-24', nights: 4, total: 30000, status: 'Booked' },
  { id: 'ab-006', guest: 'Emma R.', phone: '+1 415 555 0132', listing: 'Diani Ocean Retreat', checkIn: '2026-08-18', checkOut: '2026-08-23', nights: 5, total: 105000, status: 'Cancelled' },
];