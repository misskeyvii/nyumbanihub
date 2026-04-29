export interface Listing {
  id: string;
  title: string;
  category: 'home' | 'apartment' | 'airbnb' | 'hotel' | 'shop' | 'service';
  price: string;
  priceUnit: string;
  location: string;
  county: string;
  image: string;
  images: string[];
  verified: boolean;
  promoted: boolean;
  trending: boolean;
  description: string;
  rating: number;
  reviews: number;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsApp: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  amenities?: string[];
  postedDate: string;
}

export const kenyaCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Nyeri', 'Kisii', 'Garissa', 'Malindi',
  'Lamu', 'Kitale', 'Machakos', 'Embu', 'Meru',
  'Kakamega', 'Kericho', 'Naivasha', 'Nanyuki', 'Isiolo'
];

export const listings: Listing[] = [
  {
    id: '1',
    title: 'Modern 2-Bedroom Apartment in Westlands',
    category: 'home',
    price: 'KSh 3,000',
    priceUnit: '/month',
    location: 'Westlands, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=modern%20clean%20two%20bedroom%20apartment%20interior%20Kenya%20Nairobi%20bright%20living%20room%20white%20walls%20contemporary%20furniture%20natural%20light%20elegant%20minimal&width=600&height=400&seq=1&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=modern%20clean%20two%20bedroom%20apartment%20interior%20Kenya%20Nairobi%20bright%20living%20room%20white%20walls%20contemporary%20furniture%20natural%20light%20elegant%20minimal&width=800&height=600&seq=1&orientation=landscape',
      'https://readdy.ai/api/search-image?query=spacious%20bedroom%20apartment%20Kenya%20modern%20bed%20wardrobe%20white%20walls%20sunlight%20clean%20minimal%20interior%20design&width=800&height=600&seq=2&orientation=landscape',
      'https://readdy.ai/api/search-image?query=modern%20kitchen%20apartment%20Kenya%20clean%20marble%20countertop%20white%20cabinets%20stainless%20appliances%20bright&width=800&height=600&seq=3&orientation=landscape',
      'https://readdy.ai/api/search-image?query=clean%20bathroom%20apartment%20Kenya%20white%20tiles%20modern%20fittings%20shower%20bright%20minimal&width=800&height=600&seq=4&orientation=landscape',
    ],
    verified: true, promoted: true, trending: true,
    description: 'Beautiful 2-bedroom apartment in the heart of Westlands. Features open plan living area, modern kitchen, master en-suite, and stunning city views. Secure compound with 24hr security, parking, and backup generator.',
    rating: 4.8, reviews: 24, ownerName: 'James Kamau', ownerPhone: '+254712345678', ownerWhatsApp: '+254712345678',
    bedrooms: 2, bathrooms: 2, area: '85 sqm', amenities: ['WiFi', 'Security', 'Parking', 'Generator', 'CCTV', 'Gym', 'Swimming Pool'], postedDate: '2026-03-15'
  },
  {
    id: '2',
    title: 'Cozy Bedsitter Near CBD - Huruma',
    category: 'home',
    price: 'KSh 7,500',
    priceUnit: '/month',
    location: 'Huruma, Nairobi',
    county: 'Nairobi',
    image: 'https://readdy.ai/api/search-image?query=cozy%20bedsitter%20room%20Kenya%20Nairobi%20clean%20bed%20small%20kitchen%20tiles%20curtains%20modest%20clean%20interior&width=600&height=400&seq=7&orientation=landscape',
    images: [
      'https://readdy.ai/api/search-image?query=cozy%20bedsitter%20room%20Kenya%20Nairobi%20clean%20bed%20small%20kitchen%20tiles%20curtains%20modest%20clean%20interior&width=800&height=600&seq=7&orientation=landscape',
      'https://readdy.ai/api/search-image?query=small%20studio%20room%20Kenya%20clean%20organized%20bed%20wardrobe%20window%20light&width=800&height=600&seq=8&orientation=landscape',
      'https://readdy.ai/api/search-image?query=small%20studio%20room%20Kenya%20clean%20organized%20bed%20wardrobe%20window%20light&width=800&height=600&seq=8&orientation=landscape',
    ],
    verified: true, promoted: false, trending: true,
    description: 'Clean and affordable bedsitter in Huruma. Tiled floor, water 24hrs, security gate. Close to public transport and shopping centers.',
    rating: 4.2, reviews: 18, ownerName: 'Mary Wanjiru', ownerPhone: '+254723456789', ownerWhatsApp: '+254723456789',
    bedrooms: 1, bathrooms: 1, area: '20 sqm', amenities: ['Security', 'Water 24hr', 'Gate'], postedDate: '2026-03-10'
  },
  // {
  //   id: '3',
  //   title: 'Luxury Airbnb Villa - Diani Beach',
  //   category: 'airbnb',
  //   price: 'KSh 12,000',
  //   priceUnit: '/night',
  //   location: 'Diani Beach, Mombasa',
  //   county: 'Mombasa',
  //   image: 'https://readdy.ai/api/search-image?query=luxury%20beach%20villa%20Kenya%20Diani%20swimming%20pool%20ocean%20view%20tropical%20lush%20white%20modern%20architecture%20palm%20trees&width=600&height=400&seq=13&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=luxury%20beach%20villa%20Kenya%20Diani%20swimming%20pool%20ocean%20view%20tropical%20lush%20white%20modern%20architecture%20palm%20trees&width=800&height=600&seq=13&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=beach%20villa%20bedroom%20Kenya%20ocean%20view%20white%20linen%20luxury%20tropical%20decor&width=800&height=600&seq=14&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=infinity%20pool%20Kenya%20beach%20tropical%20sunset%20ocean%20luxury%20villa&width=800&height=600&seq=15&orientation=landscape',
  //   ],
  //   verified: true, promoted: true, trending: true,
  //   description: 'Stunning 4-bedroom beachfront villa with private pool, direct beach access, and fully equipped kitchen. Perfect for families or groups. Includes daily housekeeping, WiFi, and BBQ area.',
  //   rating: 4.9, reviews: 56, ownerName: 'Ali Hassan', ownerPhone: '+254734567890', ownerWhatsApp: '+254734567890',
  //   bedrooms: 4, bathrooms: 4, area: '380 sqm', amenities: ['Pool', 'Beach Access', 'WiFi', 'BBQ', 'Housekeeping', 'Parking', 'Security'], postedDate: '2026-02-28'
  // },
  // {
  //   id: '4',
  //   title: 'Executive 3-Bedroom Apartment - Kilimani',
  //   category: 'home',
  //   price: 'KSh 75,000',
  //   priceUnit: '/month',
  //   location: 'Kilimani, Nairobi',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=executive%20modern%20apartment%20Nairobi%20Kenya%20Kilimani%20luxury%20living%20room%20high%20end%20furniture%20large%20windows%20city%20view&width=600&height=400&seq=19&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=executive%20modern%20apartment%20Nairobi%20Kenya%20Kilimani%20luxury%20living%20room%20high%20end%20furniture%20large%20windows%20city%20view&width=800&height=600&seq=19&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=luxury%20bedroom%20Nairobi%20apartment%20Kenya%20king%20bed%20wardrobe%20elegant%20modern&width=800&height=600&seq=20&orientation=landscape',
  //   ],
  //   verified: true, promoted: false, trending: false,
  //   description: "Premium 3-bedroom apartment in sought-after Kilimani. Fully furnished with high-end furniture, chef's kitchen, gym, rooftop pool, and dedicated parking.",
  //   rating: 4.7, reviews: 12, ownerName: 'Grace Waweru', ownerPhone: '+254745678901', ownerWhatsApp: '+254745678901',
  //   bedrooms: 3, bathrooms: 3, area: '160 sqm', amenities: ['Gym', 'Pool', 'WiFi', 'Security', 'Parking', 'Generator', 'Elevator'], postedDate: '2026-03-01'
  // },
  // {
  //   id: '5',
  //   title: 'Budget-Friendly 1BR in Kisumu Town',
  //   category: 'home',
  //   price: 'KSh 12,000',
  //   priceUnit: '/month',
  //   location: 'Milimani, Kisumu',
  //   county: 'Kisumu',
  //   image: 'https://readdy.ai/api/search-image?query=clean%20one%20bedroom%20apartment%20Kenya%20Kisumu%20Lake%20Victoria%20view%20modern%20furniture%20bright%20room%20comfortable&width=600&height=400&seq=25&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=clean%20one%20bedroom%20apartment%20Kenya%20Kisumu%20Lake%20Victoria%20view%20modern%20furniture%20bright%20room%20comfortable&width=800&height=600&seq=25&orientation=landscape',
  //   ],
  //   verified: true, promoted: false, trending: true,
  //   description: 'Affordable 1-bedroom apartment with partial Lake Victoria views. Water 24hrs, secure compound, near Kisumu CBD.',
  //   rating: 4.1, reviews: 9, ownerName: 'Peter Ochieng', ownerPhone: '+254756789012', ownerWhatsApp: '+254756789012',
  //   bedrooms: 1, bathrooms: 1, area: '45 sqm', amenities: ['Water 24hr', 'Security', 'Parking'], postedDate: '2026-03-05'
  // },
  // {
  //   id: '6',
  //   title: 'Serene Airbnb Cottage - Nanyuki',
  //   category: 'airbnb',
  //   price: 'KSh 6,500',
  //   priceUnit: '/night',
  //   location: 'Nanyuki Town',
  //   county: 'Nanyuki',
  //   image: 'https://readdy.ai/api/search-image?query=cozy%20cottage%20Nanyuki%20Kenya%20Mount%20Kenya%20view%20garden%20fireplace%20wooden%20interior%20highland%20green%20lush%20nature&width=600&height=400&seq=31&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=cozy%20cottage%20Nanyuki%20Kenya%20Mount%20Kenya%20view%20garden%20fireplace%20wooden%20interior%20highland%20green%20lush%20nature&width=800&height=600&seq=31&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=cottage%20bedroom%20Kenya%20Nanyuki%20highland%20cozy%20fireplace%20wooden%20beams%20mountain%20view&width=800&height=600&seq=32&orientation=landscape',
  //   ],
  //   verified: true, promoted: false, trending: false,
  //   description: 'Charming 2-bedroom highland cottage with breathtaking Mt. Kenya views. Features a cozy fireplace, organic garden, and full kitchen. Perfect for a peaceful getaway from the city.',
  //   rating: 4.6, reviews: 31, ownerName: 'Sarah Njoroge', ownerPhone: '+254767890123', ownerWhatsApp: '+254767890123',
  //   bedrooms: 2, bathrooms: 1, area: '70 sqm', amenities: ['Fireplace', 'Garden', 'WiFi', 'Parking', 'BBQ'], postedDate: '2026-02-20'
  // },
  // {
  //   id: '7',
  //   title: 'Boutique Hotel - Nakuru Town Center',
  //   category: 'hotel',
  //   price: 'KSh 3,500',
  //   priceUnit: '/night',
  //   location: 'Nakuru CBD',
  //   county: 'Nakuru',
  //   image: 'https://readdy.ai/api/search-image?query=boutique%20hotel%20Nakuru%20Kenya%20clean%20modern%20reception%20lobby%20elegant%20african%20decor%20warm%20lighting%20premium&width=600&height=400&seq=37&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=boutique%20hotel%20Nakuru%20Kenya%20clean%20modern%20reception%20lobby%20elegant%20african%20decor%20warm%20lighting%20premium&width=800&height=600&seq=37&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=hotel%20room%20Kenya%20clean%20modern%20white%20linen%20desk%20TV%20air%20conditioning%20standard&width=800&height=600&seq=38&orientation=landscape',
  //   ],
  //   verified: true, promoted: true, trending: false,
  //   description: 'Modern boutique hotel in Nakuru CBD with 45 well-furnished rooms, restaurant, conference facilities, and swimming pool. Close to Lake Nakuru National Park.',
  //   rating: 4.5, reviews: 87, ownerName: 'Hotel Flamingo Ltd', ownerPhone: '+254778901234', ownerWhatsApp: '+254778901234',
  //   amenities: ['Restaurant', 'Pool', 'WiFi', 'Conference Hall', 'Parking', 'Room Service'], postedDate: '2026-01-15'
  // },
  // {
  //   id: '8',
  //   title: 'Mama Fua Cleaning Services - Nairobi',
  //   category: 'service',
  //   price: 'KSh 600',
  //   priceUnit: '/day',
  //   location: 'Nairobi County',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=professional%20cleaning%20service%20Kenya%20Nairobi%20clean%20house%20equipment%20uniform%20professional%20staff%20mops%20sprays%20bright%20room&width=600&height=400&seq=43&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=professional%20cleaning%20service%20Kenya%20Nairobi%20clean%20house%20equipment%20uniform%20professional%20staff%20mops%20sprays%20bright%20room&width=800&height=600&seq=43&orientation=landscape',
  //   ],
  //   verified: true, promoted: false, trending: true,
  //   description: 'Professional home, office, and post-construction cleaning services. Trained and uniformed staff, eco-friendly products, flexible schedules. Serving all Nairobi areas.',
  //   rating: 4.7, reviews: 143, ownerName: 'Mama Fua Services', ownerPhone: '+254789012345', ownerWhatsApp: '+254789012345',
  //   amenities: ['Eco Products', 'Uniformed Staff', 'Flexible Schedule', 'Post-Construction', 'Move-In/Out'], postedDate: '2026-01-20'
  // },
  // {
  //   id: '9',
  //   title: 'City Loft Airbnb - Nairobi CBD',
  //   category: 'airbnb',
  //   price: 'KSh 4,500',
  //   priceUnit: '/night',
  //   location: 'Upper Hill, Nairobi',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=modern%20city%20loft%20airbnb%20Nairobi%20Kenya%20stylish%20studio%20apartment%20downtown%20high%20rise%20city%20view%20contemporary%20design&width=600&height=400&seq=901&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=modern%20city%20loft%20airbnb%20Nairobi%20Kenya%20stylish%20studio%20apartment%20downtown%20high%20rise%20city%20view%20contemporary%20design&width=800&height=600&seq=901&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=Nairobi%20city%20skyline%20view%20apartment%20window%20Kenya%20night%20lights%20buildings%20modern&width=800&height=600&seq=902&orientation=landscape',
  //   ],
  //   verified: true, promoted: true, trending: true,
  //   description: 'Chic city loft in the heart of Upper Hill with breathtaking Nairobi skyline views. Features a fully equipped kitchen, fast WiFi, smart TV, and access to a rooftop terrace. Perfect for business travelers.',
  //   rating: 4.7, reviews: 43, ownerName: 'Tony Mwenda', ownerPhone: '+254712900100', ownerWhatsApp: '+254712900100',
  //   bedrooms: 1, bathrooms: 1, area: '55 sqm', amenities: ['WiFi', 'Smart TV', 'Rooftop', 'City View', 'Security', 'Gym Access'], postedDate: '2026-03-12'
  // },
  // {
  //   id: '10',
  //   title: 'Sunset Beach Hotel - Malindi',
  //   category: 'hotel',
  //   price: 'KSh 5,200',
  //   priceUnit: '/night',
  //   location: 'Malindi Beach Road',
  //   county: 'Malindi',
  //   image: 'https://readdy.ai/api/search-image?query=beach%20hotel%20Malindi%20Kenya%20ocean%20front%20palm%20trees%20infinity%20pool%20tropical%20lush%20resort%20sunset%20warm%20colors%20beautiful&width=600&height=400&seq=1001&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=beach%20hotel%20Malindi%20Kenya%20ocean%20front%20palm%20trees%20infinity%20pool%20tropical%20lush%20resort%20sunset%20warm%20colors%20beautiful&width=800&height=600&seq=1001&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=hotel%20room%20Malindi%20Kenya%20beach%20view%20bed%20white%20linen%20ocean%20window%20tropical%20decor&width=800&height=600&seq=1002&orientation=landscape',
  //   ],
  //   verified: true, promoted: false, trending: true,
  //   description: 'Stunning beachfront hotel in Malindi with direct beach access, infinity pool, spa, and award-winning seafood restaurant. 60 rooms including ocean-view suites.',
  //   rating: 4.8, reviews: 142, ownerName: 'Coastal Resorts Ltd', ownerPhone: '+254733100200', ownerWhatsApp: '+254733100200',
  //   amenities: ['Beach Access', 'Infinity Pool', 'Spa', 'Restaurant', 'WiFi', 'Parking', 'Room Service'], postedDate: '2026-01-08'
  // },
  // {
  //   id: '11',
  //   title: 'Zawadi Electronics - Verified Tech Shop',
  //   category: 'shop',
  //   price: 'KSh 500',
  //   priceUnit: 'from',
  //   location: 'Tom Mboya Street, Nairobi',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=modern%20electronics%20shop%20Kenya%20Nairobi%20CBD%20interior%20organized%20shelves%20phones%20laptops%20tablets%20accessories%20clean%20bright%20retail%20store&width=600&height=400&seq=1101&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=modern%20electronics%20shop%20Kenya%20Nairobi%20CBD%20interior%20organized%20shelves%20phones%20laptops%20tablets%20accessories%20clean%20bright%20retail%20store&width=800&height=600&seq=1101&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=electronics%20shop%20display%20Kenya%20phones%20Samsung%20iPhone%20accessories%20organized%20counter%20customer%20service&width=800&height=600&seq=1102&orientation=landscape',
  //   ],
  //   verified: true, promoted: true, trending: true,
  //   description: "Nairobi's trusted electronics shop with genuine products. Stocks smartphones (Samsung, Tecno, iPhone), laptops, earphones, chargers, and accessories. Also offers phone repairs.",
  //   rating: 4.6, reviews: 234, ownerName: 'Zawadi Electronics', ownerPhone: '+254744100300', ownerWhatsApp: '+254744100300',
  //   amenities: ['Phone Repair', 'Warranty', 'Genuine Products', 'MPESA', 'Installments'], postedDate: '2026-02-01'
  // },
  // {
  //   id: '12',
  //   title: 'Mama Grace Salon & Beauty - Kilimani',
  //   category: 'shop',
  //   price: 'KSh 300',
  //   priceUnit: 'from',
  //   location: 'Kilimani, Nairobi',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=modern%20beauty%20salon%20Kenya%20Nairobi%20Kilimani%20interior%20styling%20chairs%20mirrors%20clean%20bright%20professional%20elegant%20hair%20nails%20ladies&width=600&height=400&seq=1201&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=modern%20beauty%20salon%20Kenya%20Nairobi%20Kilimani%20interior%20styling%20chairs%20mirrors%20clean%20bright%20professional%20elegant%20hair%20nails%20ladies&width=800&height=600&seq=1201&orientation=landscape',
  //   ],
  //   verified: true, promoted: false, trending: true,
  //   description: 'Full-service beauty salon in Kilimani offering hair styling, braiding, weaves, relaxer, nails, pedicure, and skin treatments. Walk-ins welcome.',
  //   rating: 4.7, reviews: 189, ownerName: 'Mama Grace Beauty', ownerPhone: '+254755200400', ownerWhatsApp: '+254755200400',
  //   amenities: ['Hair Styling', 'Nails', 'Pedicure', 'Skin Care', 'Walk-ins Welcome'], postedDate: '2026-01-25'
  // },
  // {
  //   id: '13',
  //   title: 'Spice Route Restaurant - Mombasa',
  //   category: 'shop',
  //   price: 'KSh 350',
  //   priceUnit: 'per meal',
  //   location: 'Nyali, Mombasa',
  //   county: 'Mombasa',
  //   image: 'https://readdy.ai/api/search-image?query=coastal%20Kenyan%20restaurant%20interior%20Mombasa%20Nyali%20elegant%20outdoor%20dining%20sea%20view%20fresh%20seafood%20Swahili%20decor%20warm%20ambiance%20food&width=600&height=400&seq=1301&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=coastal%20Kenyan%20restaurant%20interior%20Mombasa%20Nyali%20elegant%20outdoor%20dining%20sea%20view%20fresh%20seafood%20Swahili%20decor%20warm%20ambiance%20food&width=800&height=600&seq=1301&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=fresh%20seafood%20Kenya%20Mombasa%20restaurant%20plate%20grilled%20fish%20prawns%20coastal%20African%20cuisine%20colorful&width=800&height=600&seq=1302&orientation=landscape',
  //   ],
  //   verified: true, promoted: true, trending: false,
  //   description: 'Authentic Swahili coastal cuisine with stunning ocean views in Nyali. Specializes in fresh seafood, biryani, pilau, and grilled fish. Indoor and outdoor seating.',
  //   rating: 4.8, reviews: 312, ownerName: 'Spice Route Mombasa', ownerPhone: '+254766300500', ownerWhatsApp: '+254766300500',
  //   amenities: ['Indoor Seating', 'Outdoor Dining', 'Ocean View', 'Delivery', 'Reservations', 'MPESA'], postedDate: '2026-01-10'
  // },
  // // Apartments
  // {
  //   id: '14',
  //   title: 'Spacious Studio Apartment - Lavington',
  //   category: 'apartment',
  //   price: 'KSh 22,000',
  //   priceUnit: '/month',
  //   location: 'Lavington, Nairobi',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=modern%20studio%20apartment%20interior%20Nairobi%20Kenya%20Lavington%20open%20plan%20clean%20bright%20white%20walls%20elegant%20minimal%20contemporary%20furnished&width=600&height=400&seq=1401&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=modern%20studio%20apartment%20interior%20Nairobi%20Kenya%20Lavington%20open%20plan%20clean%20bright%20white%20walls%20elegant%20minimal%20contemporary%20furnished&width=800&height=600&seq=1401&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=studio%20apartment%20kitchen%20Kenya%20modern%20white%20cabinets%20counter%20compact%20clean&width=800&height=600&seq=1402&orientation=landscape',
  //   ],
  //   verified: true, promoted: true, trending: true,
  //   description: 'Modern studio apartment in leafy Lavington. Fully tiled, fitted kitchen, 24hr water and electricity, secure compound with CCTV. Close to Ngong Road shopping and public transport.',
  //   rating: 4.5, reviews: 28, ownerName: 'Kevin Maina', ownerPhone: '+254711200300', ownerWhatsApp: '+254711200300',
  //   bedrooms: 1, bathrooms: 1, area: '40 sqm', amenities: ['WiFi', 'Security', 'CCTV', 'Water 24hr', 'Parking'], postedDate: '2026-03-18'
  // },
  // {
  //   id: '15',
  //   title: '3-Bedroom Apartment For Rent - South C',
  //   category: 'apartment',
  //   price: 'KSh 55,000',
  //   priceUnit: '/month',
  //   location: 'South C, Nairobi',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=large%20three%20bedroom%20apartment%20Kenya%20South%20C%20Nairobi%20bright%20spacious%20living%20room%20modern%20sofa%20TV%20unit%20clean%20tiled%20floor%20natural%20light&width=600&height=400&seq=1501&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=large%20three%20bedroom%20apartment%20Kenya%20South%20C%20Nairobi%20bright%20spacious%20living%20room%20modern%20sofa%20TV%20unit%20clean%20tiled%20floor%20natural%20light&width=800&height=600&seq=1501&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=master%20bedroom%20Kenya%20apartment%20modern%20wardrobe%20king%20bed%20bright%20clean%20elegant&width=800&height=600&seq=1502&orientation=landscape',
  //   ],
  //   verified: true, promoted: false, trending: true,
  //   description: 'Spacious 3-bedroom apartment in South C with DSQ. Features open-plan living, master en-suite, balcony, 2 parking bays. Quiet neighborhood, walking distance to South C mall.',
  //   rating: 4.6, reviews: 17, ownerName: 'Lucy Njeri', ownerPhone: '+254722300400', ownerWhatsApp: '+254722300400',
  //   bedrooms: 3, bathrooms: 2, area: '130 sqm', amenities: ['DSQ', 'Parking x2', 'Security', 'Generator', 'Balcony', 'Water 24hr'], postedDate: '2026-03-10'
  // },
  // {
  //   id: '16',
  //   title: '2BR Apartment Ground Floor - Thika Road',
  //   category: 'apartment',
  //   price: 'KSh 28,000',
  //   priceUnit: '/month',
  //   location: 'Kasarani, Nairobi',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=two%20bedroom%20apartment%20ground%20floor%20Kenya%20Kasarani%20Nairobi%20clean%20tiled%20living%20room%20bright%20curtains%20modern%20furniture%20clean%20walls%20affordable&width=600&height=400&seq=1601&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=two%20bedroom%20apartment%20ground%20floor%20Kenya%20Kasarani%20Nairobi%20clean%20tiled%20living%20room%20bright%20curtains%20modern%20furniture%20clean%20walls%20affordable&width=800&height=600&seq=1601&orientation=landscape',
  //   ],
  //   verified: true, promoted: false, trending: false,
  //   description: 'Clean 2-bedroom ground floor apartment along Thika Road. Fully tiled, separate kitchen, water daily, lockable gate with guard. Minutes from TRM Mall and major bus stops.',
  //   rating: 4.2, reviews: 11, ownerName: 'John Gitau', ownerPhone: '+254733400500', ownerWhatsApp: '+254733400500',
  //   bedrooms: 2, bathrooms: 1, area: '75 sqm', amenities: ['Security', 'Water Daily', 'Parking', 'Gate'], postedDate: '2026-03-20'
  // },
  // {
  //   id: '17',
  //   title: 'Furnished 1BR Apartment - Syokimau',
  //   category: 'apartment',
  //   price: 'KSh 38,000',
  //   priceUnit: '/month',
  //   location: 'Syokimau, Nairobi',
  //   county: 'Nairobi',
  //   image: 'https://readdy.ai/api/search-image?query=furnished%20one%20bedroom%20apartment%20Syokimau%20Nairobi%20Kenya%20modern%20stylish%20interior%20sofa%20TV%20bed%20wardrobe%20kitchen%20clean%20bright%20contemporary&width=600&height=400&seq=1701&orientation=landscape',
  //   images: [
  //     'https://readdy.ai/api/search-image?query=furnished%20one%20bedroom%20apartment%20Syokimau%20Nairobi%20Kenya%20modern%20stylish%20interior%20sofa%20TV%20bed%20wardrobe%20kitchen%20clean%20bright%20contemporary&width=800&height=600&seq=1701&orientation=landscape',
  //     'https://readdy.ai/api/search-image?query=furnished%20apartment%20bedroom%20Kenya%20modern%20bed%20linen%20wardrobe%20TV%20mounted%20wall%20clean&width=800&height=600&seq=1702&orientation=landscape',
  //   ],
  //   verified: true, promoted: true, trending: false,
  //   description: 'Fully furnished modern 1-bedroom apartment in Syokimau. Ready to move in - includes bed, sofa, fridge, microwave, dining set & WiFi. Close to SGR station and Mombasa Road corridor.',
  //   rating: 4.7, reviews: 22, ownerName: 'Patel Properties', ownerPhone: '+254744500600', ownerWhatsApp: '+254744500600',
  //   bedrooms: 1, bathrooms: 1, area: '55 sqm', amenities: ['Furnished', 'WiFi', 'Parking', 'Security', 'Elevator', 'Generator'], postedDate: '2026-03-14'
  // },
];

export const trendingListings = listings.filter(l => l.trending);
export const promotedListings = listings.filter(l => l.promoted);
export const featuredListings = listings.filter(l => l.verified).slice(0, 4);
export const apartmentListings = listings.filter(l => l.category === 'apartment');
