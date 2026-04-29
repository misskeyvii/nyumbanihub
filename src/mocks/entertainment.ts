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
  {
    id: 'ent1',
    name: 'OMEHGA ONE SOUND',
    type: 'sounds',
    title: 'Premium PA System & Sound Hire — Nairobi',
    description: 'We provide top-tier sound systems for weddings, corporate events, concerts, and parties. Our equipment includes JBL line arrays, subwoofers, mixers, and lighting rigs. Setup and crew included.',
    price: 'KSh 15,000',
    priceUnit: '/event',
    location: 'Parklands, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=professional%20sound%20system%20hire%20Kenya%20large%20speakers%20stage%20concert%20outdoor%20event%20Nairobi%20night%20lights%20crowd%20entertainment%20PA%20system&width=600&height=400&seq=ent1&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=professional%20sound%20system%20hire%20Kenya%20large%20speakers%20stage%20concert%20outdoor%20event%20Nairobi%20night%20lights%20crowd%20entertainment%20PA%20system&width=800&height=600&seq=ent1&orientation=landscape',
      'https://readdy.ai/api/search-image?query=wedding%20sound%20system%20Kenya%20outdoor%20reception%20PA%20speakers%20lights%20night%20decorations%20elegant%20event&width=800&height=600&seq=ent2&orientation=landscape',
      'https://readdy.ai/api/search-image?query=sound%20technician%20Kenya%20mixing%20desk%20event%20professional%20audio%20equipment%20concert%20indoor%20large&width=800&height=600&seq=ent3&orientation=landscape'
    ],
    verified: true,
    rating: 4.8,
    reviews: 124,
    phone: '+254711100200',
    whatsApp: '+254711100200',
    tags: ['JBL Sound', 'Lighting', 'Wedding', 'Corporate', 'Concerts', 'Setup Crew'],
    eventsHosted: 340
  },
  {
    id: 'ent2',
    name: 'BassBoom Events Sound',
    type: 'sounds',
    title: 'Affordable Sound System Hire — Kisumu',
    description: 'Quality sound equipment hire for events of all sizes across Kisumu and Western Kenya. Includes microphones, wireless mics, stage monitors, and LED lighting. Free delivery within Kisumu CBD.',
    price: 'KSh 8,000',
    priceUnit: '/event',
    location: 'Kisumu CBD',
    county: 'Kisumu',
    image: 'https://readdy.ai/api/search-image?query=sound%20equipment%20hire%20Kisumu%20Kenya%20event%20outdoor%20speaker%20setup%20lights%20stage%20dance%20entertainment%20lively%20crowd%20party&width=600&height=400&seq=ent4&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=sound%20equipment%20hire%20Kisumu%20Kenya%20event%20outdoor%20speaker%20setup%20lights%20stage%20dance%20entertainment%20lively%20crowd%20party&width=800&height=600&seq=ent4&orientation=landscape'
    ],
    verified: true,
    rating: 4.5,
    reviews: 67,
    phone: '+254722200300',
    whatsApp: '+254722200300',
    tags: ['Wireless Mics', 'LED Lighting', 'Free Delivery', 'Party', 'Graduation'],
    eventsHosted: 180
  },
  // {
  //   id: 'ent3',
  //   name: 'Savanna Catering Services',
  //   type: 'catering',
  //   title: 'Full Catering Services — Weddings & Corporate',
  //   description: 'Full-service catering company specializing in Kenyan, Continental, and finger food menus. We handle corporate lunches, weddings, funerals, and fundraisers. Includes waitstaff, tableware, and setup.',
  //   price: 'KSh 1,200',
  //   priceUnit: '/person',
  //   location: 'Westlands, Nairobi',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=catering%20service%20Kenya%20professional%20chefs%20buffet%20setup%20elegant%20wedding%20corporate%20event%20food%20display%20outdoor%20Nairobi%20beautiful%20arrangement&width=600&height=400&seq=ent5&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=catering%20service%20Kenya%20professional%20chefs%20buffet%20setup%20elegant%20wedding%20corporate%20event%20food%20display%20outdoor%20Nairobi%20beautiful%20arrangement&width=800&height=600&seq=ent5&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=Kenyan%20wedding%20food%20buffet%20nyama%20choma%20pilau%20desserts%20well%20arranged%20colorful%20food%20table%20outdoor%20reception&width=800&height=600&seq=ent6&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=professional%20catering%20staff%20Kenya%20uniform%20serving%20food%20guests%20event%20indoor%20elegant%20dinner%20reception&width=800&height=600&seq=ent7&orientation=landscape'
  //   ],
  //   verified: true,
  //   rating: 4.9,
  //   reviews: 203,
  //   phone: '+254733300400',
  //   whatsApp: '+254733300400',
  //   tags: ['Kenyan Cuisine', 'Continental', 'Weddings', 'Corporate', 'Waitstaff', 'Tableware'],
  //   eventsHosted: 510
  // },
  {
    id: 'ent4',
    name: 'Mama Pima Catering',
    type: 'catering',
    title: 'Local & Traditional Kenyan Catering',
    description: 'Authentic Kenyan catering including nyama choma, pilau, ugali, mutura, and all traditional foods. Ideal for weddings, harambees, and family gatherings. We bring the taste of home to your event.',
    price: 'KSh 800',
    priceUnit: '/person',
    location: 'Thika Road, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=traditional%20Kenyan%20catering%20food%20ugali%20nyama%20choma%20pilau%20mutura%20outdoor%20family%20event%20Kenya%20authentic%20cuisine%20delicious%20colorful&width=600&height=400&seq=ent8&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=traditional%20Kenyan%20catering%20food%20ugali%20nyama%20choma%20pilau%20mutura%20outdoor%20family%20event%20Kenya%20authentic%20cuisine%20delicious%20colorful&width=800&height=600&seq=ent8&orientation=landscape'
    ],
    verified: true,
    rating: 4.7,
    reviews: 89,
    phone: '+254744400500',
    whatsApp: '+254744400500',
    tags: ['Nyama Choma', 'Pilau', 'Traditional', 'Harambee', 'Affordable', 'Large Groups'],
    eventsHosted: 220
  },
  {
    id: 'ent5',
    name: 'DJ Blazer Kenya',
    type: 'dj',
    title: 'Professional DJ — Weddings, Clubs & Corporate',
    description: 'Top-rated DJ with 10+ years experience. Specializes in Afrobeats, Gospel, Hip-hop, Gengetone, and international mixes. Own sound system available. Based in Nairobi, available upcountry.',
    price: 'KSh 20,000',
    priceUnit: '/event',
    location: 'Kilimani, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=professional%20DJ%20Kenya%20performing%20concert%20club%20mixing%20turntable%20lights%20smoke%20machine%20crowd%20dancing%20night%20event%20Nairobi%20energetic&width=600&height=400&seq=ent9&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=professional%20DJ%20Kenya%20performing%20concert%20club%20mixing%20turntable%20lights%20smoke%20machine%20crowd%20dancing%20night%20event%20Nairobi%20energetic&width=800&height=600&seq=ent9&orientation=landscape',
      'https://readdy.ai/api/search-image?query=DJ%20booth%20Kenya%20wedding%20reception%20crowd%20dancing%20lights%20colorful%20night%20event%20professional%20setup%20mixing&width=800&height=600&seq=ent10&orientation=landscape'
    ],
    verified: true,
    rating: 4.9,
    reviews: 178,
    phone: '+254755500600',
    whatsApp: '+254755500600',
    tags: ['Afrobeats', 'Gospel', 'Gengetone', 'Weddings', 'Clubs', 'Own Sound System'],
    eventsHosted: 420
  },
  {
    id: 'ent6',
    name: 'DJ Sassy Ke',
    type: 'dj',
    title: 'Female DJ — Events & Private Parties Nairobi',
    description: 'Kenya\'s top female DJ for weddings, private parties, corporate launches, and beach events. Known for smooth transitions and reading the crowd. Available across Kenya.',
    price: 'KSh 15,000',
    priceUnit: '/event',
    location: 'Karen, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=female%20DJ%20Kenya%20professional%20woman%20mixing%20decks%20turntable%20night%20event%20wedding%20reception%20lights%20crowd%20Nairobi%20energetic%20confident&width=600&height=400&seq=ent11&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=female%20DJ%20Kenya%20professional%20woman%20mixing%20decks%20turntable%20night%20event%20wedding%20reception%20lights%20crowd%20Nairobi%20energetic%20confident&width=800&height=600&seq=ent11&orientation=landscape'
    ],
    verified: true,
    rating: 4.8,
    reviews: 95,
    phone: '+254766600700',
    whatsApp: '+254766600700',
    tags: ['Female DJ', 'Weddings', 'Corporate', 'Beach Events', 'Party'],
    eventsHosted: 230
  },
  {
    id: 'ent7',
    name: 'MC Smooth Kenya',
    type: 'mc',
    title: 'Master of Ceremonies — Weddings & Gala Dinners',
    description: 'Professional bilingual MC (English & Swahili) for weddings, corporate galas, graduations, and award ceremonies. Brings energy, humor, and professionalism to every event.',
    price: 'KSh 12,000',
    priceUnit: '/event',
    location: 'Upperhill, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=professional%20MC%20Kenya%20wedding%20event%20master%20of%20ceremonies%20man%20suit%20microphone%20stage%20indoor%20hall%20crowd%20elegant%20gala%20Nairobi%20confident&width=600&height=400&seq=ent12&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=professional%20MC%20Kenya%20wedding%20event%20master%20of%20ceremonies%20man%20suit%20microphone%20stage%20indoor%20hall%20crowd%20elegant%20gala%20Nairobi%20confident&width=800&height=600&seq=ent12&orientation=landscape',
      'https://readdy.ai/api/search-image?query=wedding%20MC%20Kenya%20indoor%20reception%20hall%20guests%20seated%20elegant%20decorations%20evening%20event%20lighting%20smiling%20microphone%20host&width=800&height=600&seq=ent13&orientation=landscape'
    ],
    verified: true,
    rating: 4.9,
    reviews: 142,
    phone: '+254777700800',
    whatsApp: '+254777700800',
    tags: ['Bilingual', 'Weddings', 'Corporate', 'Graduation', 'Galas', 'Award Ceremonies'],
    eventsHosted: 310
  },
  {
    id: 'ent8',
    name: 'MC Akili Show',
    type: 'mc',
    title: 'Energetic MC — Concerts & Street Events',
    description: 'High-energy MC perfect for outdoor concerts, festivals, community events, and product launches. Known for crowd engagement, crowd hype, and keeping energy levels high all night.',
    price: 'KSh 8,000',
    priceUnit: '/event',
    location: 'Eastleigh, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=energetic%20MC%20Kenya%20outdoor%20concert%20festival%20stage%20microphone%20crowd%20hype%20man%20performing%20street%20event%20night%20lights%20entertainment%20Nairobi&width=600&height=400&seq=ent14&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=energetic%20MC%20Kenya%20outdoor%20concert%20festival%20stage%20microphone%20crowd%20hype%20man%20performing%20street%20event%20night%20lights%20entertainment%20Nairobi&width=800&height=600&seq=ent14&orientation=landscape'
    ],
    verified: true,
    rating: 4.7,
    reviews: 88,
    phone: '+254788800900',
    whatsApp: '+254788800900',
    tags: ['Outdoor Events', 'Concerts', 'Festivals', 'Product Launch', 'Crowd Hype'],
    eventsHosted: 195
  }
];

export const getEntertainmentByType = (type: string) => entertainmentProviders.filter(p => p.type === type);

export const entertainmentTypes = [
  { id: 'sounds', label: 'Sounds & PA', icon: 'ri-speaker-3-line', color: 'bg-violet-50 text-violet-600', desc: 'PA systems, speakers & lighting hire' },
  { id: 'catering', label: 'Catering', icon: 'ri-restaurant-2-line', color: 'bg-orange-50 text-orange-600', desc: 'Full catering for any event size' },
  { id: 'dj', label: 'DJs', icon: 'ri-music-2-line', color: 'bg-rose-50 text-rose-600', desc: 'Professional DJs for all events' },
  { id: 'mc', label: 'MCs', icon: 'ri-mic-2-line', color: 'bg-amber-50 text-amber-600', desc: 'Masters of Ceremony & hosts' },
];
