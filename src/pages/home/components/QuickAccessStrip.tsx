import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Homes', icon: 'ri-home-4-fill', color: 'text-emerald-600', bg: 'bg-emerald-50', to: '/explore?category=homes' },
  { label: 'Apartments', icon: 'ri-building-4-fill', color: 'text-teal-600', bg: 'bg-teal-50', to: '/explore?category=apartments' },
  { label: 'Airbnb', icon: 'ri-building-2-fill', color: 'text-sky-600', bg: 'bg-sky-50', to: '/explore?category=airbnb' },
  { label: 'Hotels', icon: 'ri-hotel-fill', color: 'text-indigo-600', bg: 'bg-indigo-50', to: '/explore?category=hotels' },
  { label: 'Shops', icon: 'ri-store-2-fill', color: 'text-amber-600', bg: 'bg-amber-50', to: '/explore?category=shops' },
  { label: 'Marketplace', icon: 'ri-shopping-bag-2-fill', color: 'text-rose-500', bg: 'bg-rose-50', to: '/marketplace' },
  { label: 'Mama Fua', icon: 'ri-home-heart-fill', color: 'text-pink-600', bg: 'bg-pink-50', to: '/services/mama-fua' },
  { label: 'Movers', icon: 'ri-truck-fill', color: 'text-orange-600', bg: 'bg-orange-50', to: '/services/movers' },
  { label: 'Plumbing', icon: 'ri-water-flash-fill', color: 'text-blue-600', bg: 'bg-blue-50', to: '/services/plumbing' },
  { label: 'Electrician', icon: 'ri-flashlight-fill', color: 'text-yellow-600', bg: 'bg-yellow-50', to: '/services/electrician' },
  { label: 'Security', icon: 'ri-shield-user-fill', color: 'text-gray-700', bg: 'bg-gray-100', to: '/services/security' },
  { label: 'Caretaker', icon: 'ri-user-heart-fill', color: 'text-teal-600', bg: 'bg-teal-50', to: '/services/caretaker' },
  { label: 'Landscaping', icon: 'ri-plant-fill', color: 'text-green-600', bg: 'bg-green-50', to: '/services/landscaping' },
  { label: 'Painting', icon: 'ri-paint-brush-fill', color: 'text-orange-600', bg: 'bg-orange-50', to: '/services/painting' },
  { label: 'Gas Delivery', icon: 'ri-fire-fill', color: 'text-red-600', bg: 'bg-red-50', to: '/services/gas-delivery' },
  { label: 'Water Dispenser', icon: 'ri-drop-fill', color: 'text-cyan-600', bg: 'bg-cyan-50', to: '/services/water-dispenser' },
  { label: 'Entertainment', icon: 'ri-music-2-fill', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', to: '/entertainment' },
];

export default function QuickAccessStrip() {
  return (
    <section className="bg-white border-b border-gray-100 px-3 py-4 md:py-5">
      <div className="max-w-7xl mx-auto">
        {/* Grid: 5 cols on mobile, flexible wrap on desktop */}
        <div className="grid grid-cols-5 gap-x-1 gap-y-4 md:flex md:flex-wrap md:justify-center md:gap-4">
          {quickLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl ${item.bg} group-hover:scale-105 transition-transform duration-200 mx-auto`}>
                <i className={`${item.icon} ${item.color} text-xl md:text-2xl`}></i>
              </div>
              <span className="text-gray-700 text-[10px] md:text-xs font-medium text-center leading-tight w-full px-0.5 line-clamp-2">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
