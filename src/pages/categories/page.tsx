import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import { categories } from '../../mocks/categories';

const subCategories: Record<string, string[]> = {
  homes: ['Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Studio', 'Penthouse', 'Mansion', 'Townhouse'],
  airbnb: ['Beach Villa', 'City Apartment', 'Mountain Cottage', 'Lake House', 'Garden Suite', 'Entire Home'],
  hotels: ['Budget Hotel', 'Boutique Hotel', 'Business Hotel', 'Resort', 'Guesthouse', 'Lodge'],
  shops: ['Electronics', 'Fashion', 'Grocery', 'Hardware', 'Pharmacy', 'Restaurant', 'Salon', 'Bookshop'],
  services: ['Cleaning', 'Moving', 'Caretaking', 'Plumbing', 'Electrician', 'Security', 'Landscaping', 'Painting'],
  marketplace: ['Electronics', 'Fashion & Crafts', 'Fresh Produce', 'Food & Drinks', 'Furniture', 'Beauty', 'Books', 'Handmade'],
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-10">
          <div className="max-w-7xl mx-auto text-center">
            <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-3">
              All Categories
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Browse by Category</h1>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
              From verified homes to handcrafted marketplace products — find exactly what you need across Kenya.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-10">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Category Header */}
              <div className="relative h-40 md:h-52 overflow-hidden">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center px-6 md:px-8">
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 ${cat.color}`}>
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className={`${cat.icon} text-sm`}></i>
                      </span>
                      <span className="text-xs font-semibold">{cat.count.toLocaleString()} listings</span>
                    </div>
                    <h2 className="text-white font-bold text-xl md:text-2xl">{cat.name}</h2>
                    <p className="text-white/75 text-sm mt-1">{cat.description}</p>
                  </div>
                </div>
                <Link
                  to={`/explore?category=${cat.id}`}
                  className="absolute right-4 bottom-4 bg-white text-emerald-700 font-semibold text-xs px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors whitespace-nowrap"
                >
                  Browse All
                  <span className="ml-1.5 inline-flex items-center justify-center w-3 h-3">
                    <i className="ri-arrow-right-s-line text-sm"></i>
                  </span>
                </Link>
              </div>

              {/* Sub-categories */}
              <div className="p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Popular in {cat.name}</p>
                <div className="flex flex-wrap gap-2">
                  {(subCategories[cat.id] || []).map((sub) => (
                    <Link
                      key={sub}
                      to={`/explore?category=${cat.id}&sub=${sub.toLowerCase().replace(/\s/g, '-')}`}
                      className="text-xs font-medium bg-gray-50 border border-gray-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 text-gray-600 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-emerald-700 py-12 px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-white font-bold text-2xl mb-2">Can't Find What You Need?</h2>
            <p className="text-emerald-100 text-sm mb-6">Use our smart search to find verified listings across all categories in Kenya.</p>
            <Link to="/explore" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors whitespace-nowrap">
              <span className="w-4 h-4 flex items-center justify-center"><i className="ri-search-line text-sm"></i></span>
              Search All Listings
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
