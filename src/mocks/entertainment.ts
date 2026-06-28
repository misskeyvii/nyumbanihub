export interface EntertainmentProvider {
  id: string;
  name: string;
  type: 'sounds' | 'catering' | 'dj' | 'mc';
  title: string;
  description: string;
  price: string;
  priceUnit: string;
  location: string;
  county: string;
  image: string;
  images: string[];
  verified: boolean;
  rating: number;
  reviews: number;
  phone: string;
  whatsApp: string;
  tags: string[];
  eventsHosted: number;
}

export const entertainmentProviders: EntertainmentProvider[] = [

];

export const getEntertainmentByType = (type: string) => entertainmentProviders.filter(p => p.type === type);

export const entertainmentTypes = [
  { id: 'sounds', label: 'Sounds & PA', icon: 'ri-speaker-3-line', color: 'bg-violet-50 text-violet-600', desc: 'PA systems, speakers & lighting hire' },
  { id: 'catering', label: 'Catering', icon: 'ri-restaurant-2-line', color: 'bg-orange-50 text-orange-600', desc: 'Full catering for any event size' },
  { id: 'dj', label: 'DJs', icon: 'ri-music-2-line', color: 'bg-rose-50 text-rose-600', desc: 'Professional DJs for all events' },
  { id: 'mc', label: 'MCs', icon: 'ri-mic-2-line', color: 'bg-amber-50 text-amber-600', desc: 'Masters of Ceremony & hosts' },
];
