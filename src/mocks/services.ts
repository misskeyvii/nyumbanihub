export interface ServiceProvider {
  id: string;
  name: string;
  serviceType: 'mama-fua' | 'movers' | 'caretaker' | 'plumbing' | 'electrician' | 'security' | 'landscaping' | 'painting' | 'gas-delivery' | 'water-dispenser';
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
  yearsExperience: number;
  available: boolean;
  tags: string[];
}

export const serviceProviders: ServiceProvider[] = [
  {
    id: 'sv1',
    name: 'Mama Fua Wanjiku',
    serviceType: 'mama-fua',
    title: 'Professional Mama Fua — House & Laundry Cleaning',
    description: 'Experienced Mama Fua offering thorough home cleaning, laundry washing, ironing, and mopping services across Nairobi. Available for daily, weekly, or monthly schedules. References available on request.',
    price: 'KSh 600',
    priceUnit: '/day',
    location: 'Westlands, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=professional%20Kenyan%20woman%20house%20cleaner%20mama%20fua%20cleaning%20service%20uniform%20mop%20bucket%20bright%20modern%20home%20Nairobi%20smiling%20confident%20trustworthy&width=600&height=400&seq=sv1&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=professional%20Kenyan%20woman%20house%20cleaner%20mama%20fua%20cleaning%20service%20uniform%20mop%20bucket%20bright%20modern%20home%20Nairobi%20smiling%20confident%20trustworthy&width=800&height=600&seq=sv1&orientation=landscape',
      'https://readdy.ai/api/search-image?query=clean%20laundry%20service%20Kenya%20washing%20clothes%20hanging%20outside%20bright%20sunny%20day%20professional%20woman&width=800&height=600&seq=sv2&orientation=landscape',
      'https://readdy.ai/api/search-image?query=sparkling%20clean%20kitchen%20Kenya%20professional%20cleaning%20service%20tiles%20countertop%20bright%20organized&width=800&height=600&seq=sv3&orientation=landscape'
    ],
    verified: true,
    rating: 4.9,
    reviews: 87,
    phone: '+254711234567',
    whatsApp: '+254711234567',
    yearsExperience: 6,
    available: true,
    tags: ['Laundry', 'Ironing', 'Mopping', 'Dishes', 'House Cleaning']
  },
  {
    id: 'sv2',
    name: 'Mama Fua Aisha',
    serviceType: 'mama-fua',
    title: 'Mama Fua Services — Mombasa & Environs',
    description: 'Trusted Mama Fua with over 8 years experience in residential cleaning, deep cleaning, and post-tenancy cleaning across Mombasa. Eco-friendly products used. Can cook on request.',
    price: 'KSh 700',
    priceUnit: '/day',
    location: 'Nyali, Mombasa',
    county: 'Mombasa',
    image: 'https://readdy.ai/api/search-image?query=Kenyan%20woman%20professional%20house%20cleaner%20Mombasa%20coastal%20clean%20bright%20apartment%20smiling%20uniform%20broom%20bucket%20organized%20tidy%20home&width=600&height=400&seq=sv4&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=Kenyan%20woman%20professional%20house%20cleaner%20Mombasa%20coastal%20clean%20bright%20apartment%20smiling%20uniform%20broom%20bucket%20organized%20tidy%20home&width=800&height=600&seq=sv4&orientation=landscape',
      'https://readdy.ai/api/search-image?query=deep%20cleaning%20bathroom%20tiles%20Kenya%20professional%20service%20sparkling%20white%20coastal%20home&width=800&height=600&seq=sv5&orientation=landscape'
    ],
    verified: true,
    rating: 4.8,
    reviews: 64,
    phone: '+254722345678',
    whatsApp: '+254722345678',
    yearsExperience: 8,
    available: true,
    tags: ['Deep Clean', 'Cooking', 'Post-Tenancy', 'Laundry', 'Eco-Friendly']
  },
  {
    id: 'sv3',
    name: 'Wafula Movers Ltd',
    serviceType: 'movers',
    title: 'Professional Movers — Nairobi & Upcountry',
    description: 'Experienced moving company offering home, office, and long-distance relocation services across Kenya. Trained loaders, padded trucks, insurance available. Free quotes provided.',
    price: 'KSh 5,000',
    priceUnit: '/move',
    location: 'Industrial Area, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=professional%20movers%20Kenya%20team%20loading%20furniture%20truck%20uniformed%20workers%20Nairobi%20residential%20building%20sunny%20day%20organized%20relocation&width=600&height=400&seq=sv6&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=professional%20movers%20Kenya%20team%20loading%20furniture%20truck%20uniformed%20workers%20Nairobi%20residential%20building%20sunny%20day%20organized%20relocation&width=800&height=600&seq=sv6&orientation=landscape',
      'https://readdy.ai/api/search-image?query=moving%20truck%20Kenya%20loading%20large%20furniture%20carefully%20professional%20workers%20outdoor%20gate%20apartment&width=800&height=600&seq=sv7&orientation=landscape',
      'https://readdy.ai/api/search-image?query=moving%20team%20Kenya%20wrapping%20furniture%20padding%20protection%20boxes%20organized%20new%20home&width=800&height=600&seq=sv8&orientation=landscape'
    ],
    verified: true,
    rating: 4.7,
    reviews: 112,
    phone: '+254733456789',
    whatsApp: '+254733456789',
    yearsExperience: 10,
    available: true,
    tags: ['Home Moving', 'Office Relocation', 'Long Distance', 'Free Quote', 'Insurance']
  },
  {
    id: 'sv4',
    name: 'Kamau Caretakers',
    serviceType: 'caretaker',
    title: 'Verified Property Caretaker — Nairobi',
    description: 'Experienced compound and apartment caretaker. Handles rent collection, minor repairs, compound cleanliness, security liaison, and tenant management on behalf of property owners.',
    price: 'KSh 8,000',
    priceUnit: '/month',
    location: 'Parklands, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=Kenyan%20property%20caretaker%20man%20uniform%20apartment%20building%20compound%20outdoor%20clean%20professional%20trustworthy%20responsible%20Nairobi%20residential&width=600&height=400&seq=sv9&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=Kenyan%20property%20caretaker%20man%20uniform%20apartment%20building%20compound%20outdoor%20clean%20professional%20trustworthy%20responsible%20Nairobi%20residential&width=800&height=600&seq=sv9&orientation=landscape',
      'https://readdy.ai/api/search-image?query=clean%20compound%20Kenya%20apartment%20building%20green%20lawn%20maintenance%20professional%20caretaker%20garden%20outdoor%20tidy&width=800&height=600&seq=sv10&orientation=landscape'
    ],
    verified: true,
    rating: 4.6,
    reviews: 43,
    phone: '+254744567890',
    whatsApp: '+254744567890',
    yearsExperience: 7,
    available: true,
    tags: ['Rent Collection', 'Compound Cleaning', 'Minor Repairs', 'Tenant Management', 'Security']
  },
  {
    id: 'sv5',
    name: 'Odhiambo Plumbing Services',
    serviceType: 'plumbing',
    title: 'Expert Plumber — 24hr Emergency Plumbing',
    description: 'Licensed plumber offering pipe repairs, bathroom installations, drainage unblocking, borehole connections, and water tank setups. Available 24/7 for emergency calls across Nairobi and Kiambu.',
    price: 'KSh 800',
    priceUnit: '/hour',
    location: 'South C, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=professional%20plumber%20Kenya%20fixing%20pipe%20bathroom%20repair%20tools%20uniform%20workshop%20residential%20home%20water%20installation%20expert&width=600&height=400&seq=sv11&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=professional%20plumber%20Kenya%20fixing%20pipe%20bathroom%20repair%20tools%20uniform%20workshop%20residential%20home%20water%20installation%20expert&width=800&height=600&seq=sv11&orientation=landscape',
      'https://readdy.ai/api/search-image?query=plumbing%20repair%20Kenya%20pipe%20fitting%20bathroom%20shower%20installation%20professional%20tools%20clean%20work&width=800&height=600&seq=sv12&orientation=landscape'
    ],
    verified: true,
    rating: 4.8,
    reviews: 76,
    phone: '+254755678901',
    whatsApp: '+254755678901',
    yearsExperience: 9,
    available: true,
    tags: ['Emergency Plumbing', 'Pipe Repair', 'Drainage', 'Installation', 'Water Tank']
  },
  {
    id: 'sv6',
    name: 'BrightWire Electricians',
    serviceType: 'electrician',
    title: 'Certified Electricians — Wiring & Solar Installations',
    description: 'Government-certified electricians for domestic and commercial wiring, solar panel installation, switchboard upgrades, and KPLC meter connections. Safe, fast, and affordable.',
    price: 'KSh 1,000',
    priceUnit: '/hour',
    location: 'Nairobi CBD',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=certified%20electrician%20Kenya%20wiring%20installation%20professional%20uniform%20safety%20tools%20panel%20board%20fixing%20electrical%20residential%20home%20expert&width=600&height=400&seq=sv13&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=certified%20electrician%20Kenya%20wiring%20installation%20professional%20uniform%20safety%20tools%20panel%20board%20fixing%20electrical%20residential%20home%20expert&width=800&height=600&seq=sv13&orientation=landscape',
      'https://readdy.ai/api/search-image?query=solar%20panel%20installation%20Kenya%20rooftop%20residential%20professional%20team%20technician%20sunny%20day%20Nairobi&width=800&height=600&seq=sv14&orientation=landscape'
    ],
    verified: true,
    rating: 4.9,
    reviews: 98,
    phone: '+254766789012',
    whatsApp: '+254766789012',
    yearsExperience: 11,
    available: true,
    tags: ['Wiring', 'Solar Installation', 'KPLC Connection', 'Switchboard', 'Commercial']
  },
  {
    id: 'sv7',
    name: 'Eagle Eye Security',
    serviceType: 'security',
    title: 'Licensed Security Guards & CCTV Installation',
    description: 'Licensed security company providing trained uniformed guards, CCTV installation, alarm systems, and perimeter security for residential estates, businesses, and events across Kenya.',
    price: 'KSh 18,000',
    priceUnit: '/month',
    location: 'Karen, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=professional%20security%20guard%20Kenya%20uniform%20compound%20gate%20residential%20estate%20CCTV%20camera%20professional%20trustworthy%20outdoor%20day&width=600&height=400&seq=sv15&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=professional%20security%20guard%20Kenya%20uniform%20compound%20gate%20residential%20estate%20CCTV%20camera%20professional%20trustworthy%20outdoor%20day&width=800&height=600&seq=sv15&orientation=landscape',
      'https://readdy.ai/api/search-image?query=CCTV%20security%20cameras%20installation%20Kenya%20residential%20building%20professional%20security%20system%20gate%20wall&width=800&height=600&seq=sv16&orientation=landscape'
    ],
    verified: true,
    rating: 4.7,
    reviews: 55,
    phone: '+254777890123',
    whatsApp: '+254777890123',
    yearsExperience: 13,
    available: true,
    tags: ['Security Guards', 'CCTV', 'Alarm Systems', 'Events Security', 'Estate Security']
  },
  {
    id: 'sv8',
    name: 'GreenLeaf Landscaping',
    serviceType: 'landscaping',
    title: 'Professional Garden Design & Maintenance',
    description: 'Expert landscaping and garden design for homes, commercial buildings, and estates. Services include lawn mowing, hedge trimming, flower bed planting, tree surgery, and irrigation installation.',
    price: 'KSh 3,500',
    priceUnit: '/visit',
    location: 'Lavington, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=professional%20landscaping%20Kenya%20beautiful%20green%20garden%20design%20lush%20lawn%20flowers%20trimmed%20hedges%20modern%20home%20outdoor%20team%20working&width=600&height=400&seq=sv17&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=professional%20landscaping%20Kenya%20beautiful%20green%20garden%20design%20lush%20lawn%20flowers%20trimmed%20hedges%20modern%20home%20outdoor%20team%20working&width=800&height=600&seq=sv17&orientation=landscape',
      'https://readdy.ai/api/search-image?query=garden%20maintenance%20Kenya%20mowing%20lawn%20team%20outdoor%20residential%20compound%20green%20manicured%20beautiful%20flowers&width=800&height=600&seq=sv18&orientation=landscape'
    ],
    verified: true,
    rating: 4.8,
    reviews: 67,
    phone: '+254788901234',
    whatsApp: '+254788901234',
    yearsExperience: 5,
    available: true,
    tags: ['Garden Design', 'Lawn Mowing', 'Hedge Trimming', 'Irrigation', 'Tree Surgery']
  },
  {
    id: 'sv9',
    name: 'ColourPro Painters',
    serviceType: 'painting',
    title: 'Interior & Exterior Painting — Nairobi',
    description: 'Professional painting services for homes, offices, and commercial spaces. Use premium Dulux and Crown paints. Skilled team with 5+ years experience. Free color consultation and quotations.',
    price: 'KSh 25',
    priceUnit: '/sqft',
    location: 'Kasarani, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=professional%20house%20painters%20Kenya%20interior%20painting%20walls%20cream%20color%20uniform%20team%20rollers%20bright%20modern%20room%20transformation&width=600&height=400&seq=sv19&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=professional%20house%20painters%20Kenya%20interior%20painting%20walls%20cream%20color%20uniform%20team%20rollers%20bright%20modern%20room%20transformation&width=800&height=600&seq=sv19&orientation=landscape',
      'https://readdy.ai/api/search-image?query=freshly%20painted%20room%20Kenya%20modern%20bright%20walls%20clean%20white%20transformation%20home%20interior%20after%20painting&width=800&height=600&seq=sv20&orientation=landscape'
    ],
    verified: true,
    rating: 4.6,
    reviews: 89,
    phone: '+254799012345',
    whatsApp: '+254799012345',
    yearsExperience: 8,
    available: true,
    tags: ['Interior Painting', 'Exterior Painting', 'Dulux', 'Free Quote', 'Color Consultation']
  },
  {
    id: 'sv10',
    name: 'BongoGas Deliveries',
    serviceType: 'gas-delivery',
    title: 'AMOR GAS',
    description: 'We deliver K-Gas, ProGas, and Total Gas cylinders (6kg, 13kg) directly to your doorstep anywhere in Nairobi. Same-day delivery available. Verified dealer with all refills genuine and sealed.',
    price: 'KSh 100',
    priceUnit: '/delivery',
    location: 'Kasarani, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=gas%20cylinder%20delivery%20Kenya%20LPG%20cooking%20gas%20cylinder%20delivery%20man%20uniform%20motorbike%20Nairobi%20residential%20doorstep%20professional%20service&width=600&height=400&seq=sv21&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=gas%20cylinder%20delivery%20Kenya%20LPG%20cooking%20gas%20cylinder%20delivery%20man%20uniform%20motorbike%20Nairobi%20residential%20doorstep%20professional%20service&width=800&height=600&seq=sv21&orientation=landscape',
      'https://readdy.ai/api/search-image?query=LPG%20gas%20cylinders%20K-gas%20ProGas%20stacked%20warehouse%20dealer%20Kenya%20verified%20authentic%20sealed&width=800&height=600&seq=sv22&orientation=landscape'
    ],
    verified: true,
    rating: 4.8,
    reviews: 143,
    phone: '+254712356783',
    whatsApp: '+254712356783',
    yearsExperience: 4,
    available: true,
    tags: ['Same-Day Delivery', 'K-Gas', 'ProGas', 'Total Gas', '6kg & 13kg']
  },
  {
    id: 'sv11',
    name: 'SwiftGas Kenya',
    serviceType: 'gas-delivery',
    title: 'Gas Refill & Delivery — Mombasa & Coast Region',
    description: 'Authorized gas dealer serving Mombasa, Kilifi, and Kwale counties. We deliver 6kg and 13kg gas cylinders with free valve checks. Emergency after-hours delivery available for regular customers.',
    price: 'KSh 150',
    priceUnit: '/delivery',
    location: 'Bamburi, Mombasa',
    county: 'Mombasa',
    image: 'https://readdy.ai/api/search-image?query=gas%20delivery%20service%20Kenya%20Mombasa%20coastal%20LPG%20cylinder%20uniform%20delivery%20team%20scooter%20outdoor%20bright%20sunny%20day&width=600&height=400&seq=sv23&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=gas%20delivery%20service%20Kenya%20Mombasa%20coastal%20LPG%20cylinder%20uniform%20delivery%20team%20scooter%20outdoor%20bright%20sunny%20day&width=800&height=600&seq=sv23&orientation=landscape',
      'https://readdy.ai/api/search-image?query=gas%20cylinder%20valve%20check%20safety%20Kenya%20authorized%20dealer%20blue%20cylinder%20orange%20uniform%20indoor&width=800&height=600&seq=sv24&orientation=landscape'
    ],
    verified: true,
    rating: 4.7,
    reviews: 91,
    phone: '+254721987654',
    whatsApp: '+254721987654',
    yearsExperience: 6,
    available: true,
    tags: ['Authorized Dealer', 'Free Valve Check', 'Emergency Delivery', 'Coast Region', '6kg & 13kg']
  },
  {
    id: 'sv12',
    name: 'AquaPure Water Delivery',
    serviceType: 'water-dispenser',
    title: 'Dispenser Water Delivery — Nairobi',
    description: 'We deliver sealed 20-litre dispenser water bottles directly to your home or office in Nairobi. Water is purified, lab-tested, and KEBS certified. Monthly subscription plans available with free dispenser on hire.',
    price: 'KSh 200',
    priceUnit: '/20L bottle',
    location: 'Westlands, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=water%20dispenser%20delivery%20Kenya%2020%20litre%20blue%20bottle%20delivery%20man%20uniform%20apartment%20office%20Nairobi%20clean%20pure%20water%20service%20professional&width=600&height=400&seq=sv25&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=water%20dispenser%20delivery%20Kenya%2020%20litre%20blue%20bottle%20delivery%20man%20uniform%20apartment%20office%20Nairobi%20clean%20pure%20water%20service%20professional&width=800&height=600&seq=sv25&orientation=landscape',
      'https://readdy.ai/api/search-image?query=water%20dispenser%20machine%20office%20Kenya%20blue%20bottles%20stacked%20clean%20purified%20KEBS%20certified%20water%20cooler&width=800&height=600&seq=sv26&orientation=landscape'
    ],
    verified: true,
    rating: 4.9,
    reviews: 218,
    phone: '+254733109876',
    whatsApp: '+254733109876',
    yearsExperience: 5,
    available: true,
    tags: ['KEBS Certified', 'Lab Tested', 'Free Dispenser Hire', 'Monthly Plans', 'Same-Day']
  },
  {
    id: 'sv13',
    name: 'CrystalDrop Waters',
    serviceType: 'water-dispenser',
    title: 'Pure Dispenser Water — Kisumu & Nakuru',
    description: 'Reliable dispenser water delivery across Kisumu, Nakuru, and Eldoret. Purified using reverse osmosis technology. KEBS approved. Order via WhatsApp and get delivery within 2 hours. Empty bottles collected free.',
    price: 'KSh 180',
    priceUnit: '/20L bottle',
    location: 'Milimani, Kisumu',
    county: 'Kisumu',
    image: 'https://readdy.ai/api/search-image?query=clean%20pure%20water%20delivery%20service%20Kenya%20Kisumu%2020%20litre%20dispenser%20bottle%20blue%20seal%20delivery%20woman%20smiling%20professional%20outdoor%20residential&width=600&height=400&seq=sv27&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=clean%20pure%20water%20delivery%20service%20Kenya%20Kisumu%2020%20litre%20dispenser%20bottle%20blue%20seal%20delivery%20woman%20smiling%20professional%20outdoor%20residential&width=800&height=600&seq=sv27&orientation=landscape',
      'https://readdy.ai/api/search-image?query=reverse%20osmosis%20water%20purification%20plant%20Kenya%20clean%20water%20production%20bottles%20stacked%20facility%20professional&width=800&height=600&seq=sv28&orientation=landscape'
    ],
    verified: true,
    rating: 4.8,
    reviews: 176,
    phone: '+254745321098',
    whatsApp: '+254745321098',
    yearsExperience: 3,
    available: true,
    tags: ['Reverse Osmosis', 'KEBS Approved', '2-Hour Delivery', 'Free Collection', 'Subscription Plans']
  }
];

export const getProvidersByType = (type: string) => serviceProviders.filter(p => p.serviceType === type);

export const serviceTypeInfo: Record<string, { label: string; icon: string; color: string; bgImage: string; desc: string }> = {
  'mama-fua': { label: 'Mama Fua', icon: 'ri-home-heart-line', color: 'text-sky-600', bgImage: 'https://readdy.ai/api/search-image?query=Kenyan%20woman%20mama%20fua%20cleaning%20service%20professional%20uniform%20bright%20home%20Nairobi%20smiling%20laundry%20outdoor%20sunlight&width=1400&height=380&seq=bg1&orientation=landscape', desc: 'Professional home cleaning, laundry & ironing services' },
  'movers': { label: 'Movers', icon: 'ri-truck-line', color: 'text-amber-600', bgImage: 'https://readdy.ai/api/search-image?query=professional%20movers%20Kenya%20truck%20team%20relocating%20furniture%20loading%20sunny%20day%20Nairobi%20city&width=1400&height=380&seq=bg2&orientation=landscape', desc: 'Trusted home, office & long-distance moving services' },
  'caretaker': { label: 'Caretakers', icon: 'ri-user-heart-line', color: 'text-rose-600', bgImage: 'https://readdy.ai/api/search-image?query=property%20caretaker%20Kenya%20apartment%20compound%20gate%20professional%20trustworthy%20Nairobi%20residential%20estate&width=1400&height=380&seq=bg3&orientation=landscape', desc: 'Reliable property managers and compound caretakers' },
  'plumbing': { label: 'Plumbing', icon: 'ri-water-flash-line', color: 'text-blue-600', bgImage: 'https://readdy.ai/api/search-image?query=professional%20plumber%20Kenya%20pipe%20repair%20bathroom%20installation%20tools%20uniform%20expert%20residential%20commercial&width=1400&height=380&seq=bg4&orientation=landscape', desc: 'Pipe repairs, installations & 24/7 emergency plumbing' },
  'electrician': { label: 'Electricians', icon: 'ri-flashlight-line', color: 'text-yellow-600', bgImage: 'https://readdy.ai/api/search-image?query=certified%20electrician%20Kenya%20solar%20wiring%20professional%20uniform%20tools%20panel%20board%20residential%20commercial%20Nairobi&width=1400&height=380&seq=bg5&orientation=landscape', desc: 'Certified wiring, solar & electrical installation experts' },
  'security': { label: 'Security', icon: 'ri-shield-user-line', color: 'text-gray-700', bgImage: 'https://readdy.ai/api/search-image?query=professional%20security%20guard%20Kenya%20uniform%20gate%20estate%20compound%20CCTV%20residential%20trustworthy%20day%20outdoor&width=1400&height=380&seq=bg6&orientation=landscape', desc: 'Licensed guards, CCTV & alarm systems for your property' },
  'landscaping': { label: 'Landscaping', icon: 'ri-plant-line', color: 'text-green-600', bgImage: 'https://readdy.ai/api/search-image?query=beautiful%20garden%20landscaping%20Kenya%20lush%20green%20lawn%20flowers%20design%20residential%20compound%20Nairobi%20manicured%20outdoor&width=1400&height=380&seq=bg7&orientation=landscape', desc: 'Garden design, lawn care & outdoor maintenance' },
  'painting': { label: 'Painting', icon: 'ri-paint-brush-line', color: 'text-orange-600', bgImage: 'https://readdy.ai/api/search-image?query=professional%20house%20painters%20Kenya%20interior%20walls%20cream%20uniform%20team%20rollers%20modern%20bright%20room%20transformation%20Nairobi&width=1400&height=380&seq=bg8&orientation=landscape', desc: 'Interior & exterior painting with premium quality paints' },
  'gas-delivery': { label: 'Gas Delivery', icon: 'ri-fire-line', color: 'text-red-600', bgImage: 'https://readdy.ai/api/search-image?query=LPG%20cooking%20gas%20cylinder%20delivery%20Kenya%20uniform%20motorbike%20residential%20doorstep%20bright%20day%20Nairobi%20professional%20verified&width=1400&height=380&seq=bg9&orientation=landscape', desc: 'Same-day gas cylinder delivery to your doorstep' },
  'water-dispenser': { label: 'Dispenser Water', icon: 'ri-drop-line', color: 'text-cyan-600', bgImage: 'https://readdy.ai/api/search-image?query=dispenser%20water%20delivery%20Kenya%2020%20litre%20bottle%20blue%20clean%20purified%20delivery%20team%20office%20residential%20bright%20day&width=1400&height=380&seq=bg10&orientation=landscape', desc: 'KEBS certified pure dispenser water delivered fast' },
};
