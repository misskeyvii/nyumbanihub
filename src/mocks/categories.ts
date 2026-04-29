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
    image: 'https://readdy.ai/api/search-image?query=modern%20apartment%20building%20Nairobi%20Kenya%20residential%20complex%20green%20compound%20urban%20architecture&width=400&height=300&seq=100&orientation=landscape'
  },
  {
    id: 'apartments',
    name: 'Apartments',
    icon: 'ri-building-4-line',
    count: 876,
    description: 'Studio, 1BR, 2BR & 3BR apartments',
    color: 'bg-teal-50 text-teal-700',
    image: 'https://readdy.ai/api/search-image?query=modern apartment building complex Nairobi Kenya multiple floors residential units balconies clean architecture urban well designed compound green trees&width=400&height=300&seq=106&orientation=landscape'
  },
  {
    id: 'airbnb',
    name: 'Airbnb Stays',
    icon: 'ri-hotel-bed-line',
    count: 387,
    description: 'Short-term stays & getaways',
    color: 'bg-rose-50 text-rose-600',
    image: 'https://readdy.ai/api/search-image?query=luxury%20airbnb%20villa%20Kenya%20beach%20pool%20tropical%20vacation%20beautiful%20modern&width=400&height=300&seq=101&orientation=landscape'
  },
  {
    id: 'hotels',
    name: 'Hotels',
    icon: 'ri-building-2-line',
    count: 215,
    description: 'Business & leisure hotels',
    color: 'bg-amber-50 text-amber-700',
    image: 'https://readdy.ai/api/search-image?query=luxury%20hotel%20Kenya%20lobby%20reception%20modern%20African%20elegant%20lights&width=400&height=300&seq=102&orientation=landscape'
  },
  {
    id: 'shops',
    name: 'Shops & Businesses',
    icon: 'ri-store-2-line',
    count: 892,
    description: 'Verified local businesses',
    color: 'bg-sky-50 text-sky-700',
    image: 'https://readdy.ai/api/search-image?query=modern%20shop%20Kenya%20business%20interior%20clean%20organized%20retail%20market%20display&width=400&height=300&seq=103&orientation=landscape'
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'ri-customer-service-2-line',
    count: 634,
    description: 'Cleaners, movers & more',
    color: 'bg-violet-50 text-violet-700',
    image: 'https://readdy.ai/api/search-image?query=professional%20service%20team%20Kenya%20workers%20uniform%20cleaning%20moving%20caretaker%20professional&width=400&height=300&seq=104&orientation=landscape'
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: 'ri-shopping-bag-3-line',
    count: 2100,
    description: 'Verified shop products',
    color: 'bg-orange-50 text-orange-700',
    image: 'https://readdy.ai/api/search-image?query=marketplace%20products%20Kenya%20verified%20shop%20display%20electronics%20fashion%20goods%20modern%20store&width=400&height=300&seq=105&orientation=landscape'
  }
];
