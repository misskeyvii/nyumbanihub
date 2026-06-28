export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
  color: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: 'homes',
    name: 'Homes & Rentals',
    icon: 'ri-home-4-line',
    count: 1240,
    description: 'Bedsitters, 1BR, 2BR & more',
    color: 'bg-emerald-50 text-emerald-700',
    image: 'https://i.postimg.cc/3N8QgQTM/Things-You-Should-Do-Before-Listing-Your-Home.jpg'
  },
  {
    id: 'apartments',
    name: 'Apartments',
    icon: 'ri-building-4-line',
    count: 876,
    description: 'Studio, 1BR, 2BR & 3BR apartments',
    color: 'bg-teal-50 text-teal-700',
    image: 'https://i.postimg.cc/5NDkJWRy/download-(10).jpg'
  },
  {
    id: 'airbnb',
    name: 'Airbnb Stays',
    icon: 'ri-hotel-bed-line',
    count: 387,
    description: 'Short-term stays & getaways',
    color: 'bg-rose-50 text-rose-600',
    image: 'https://i.postimg.cc/0jSKJ4pK/airbnb.jpg'
  },
  {
    id: 'hotels',
    name: 'Hotels',
    icon: 'ri-building-2-line',
    count: 215,
    description: 'Business & leisure hotels',
    color: 'bg-amber-50 text-amber-700',
    image: 'https://i.postimg.cc/pTFL0Fy4/Fairmont-Ajman.jpg'
  },
  {
    id: 'shops',
    name: 'Shops & Businesses',
    icon: 'ri-store-2-line',
    count: 892,
    description: 'Verified local businesses',
    color: 'bg-sky-50 text-sky-700',
    image: 'https://i.postimg.cc/QMWDsrs5/Empty-shop-window.jpg'
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'ri-customer-service-2-line',
    count: 634,
    description: 'Cleaners, movers & more',
    color: 'bg-violet-50 text-violet-700',
    image: 'https://i.postimg.cc/bYmB6Bff/Nettoyage-professionnel-et-si-vous-arretiez-enfin-de-parler-de-petit-boulot.jpg'
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: 'ri-shopping-bag-3-line',
    count: 2100,
    description: 'Verified shop products',
    color: 'bg-orange-50 text-orange-700',
    image: 'https://i.postimg.cc/bJB1nbWk/Best-Buy-Deals-Today-Top-Electronics-TV-Laptop-Tech-Discounts-You-Can-Shop-Right-Now.jpg'
  }
];
