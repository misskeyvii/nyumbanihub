import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import ListingCard from '../../components/base/ListingCard';
import ListingCardSkeleton from '../../components/base/ListingCardSkeleton';
import { kenyaCounties } from '../../mocks/listings';
import { supabase } from '../../lib/supabase';

const categoryOptions = ['All', 'Homes', 'Apartments', 'Airbnb', 'Hotels', 'Shops', 'Services', 'Marketplace'];
const priceOptions = ['Any Price', 'Under KSh 5K', 'KSh 5K–20K', 'KSh 20K–60K', 'KSh 60K+'];
const sortOptions = ['Latest', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];

const urlToCategoryMap: Record<string, string> = {
  homes: 'Homes',
  apartments: 'Apartments',
  airbnb: 'Airbnb',
  hotels: 'Hotels',
  shops: 'Shops',
  services: 'Services',
  marketplace: 'Marketplace',
};

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [category, setCategory] = useState(() => {
    const raw = searchParams.get('category')?.toLowerCase() ?? '';
    return urlToCategoryMap[raw] ?? 'All';
  });
  const [county, setCounty] = useState(searchParams.get('county') ?? '');
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [price, setPrice] = useState('Any Price');
  const [sort, setSort] = useState('Latest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    supabase.from('listings').select('*').eq('status', 'live').order('created_at', { ascending: false })
      .then(({ data }) => { setAllListings(data || []); setLoading(false); });

    const channel = supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'listings' }, payload => {
        setAllListings(prev => prev.filter(l => l.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'listings' }, payload => {
        if (payload.new.status !== 'live') {
          setAllListings(prev => prev.filter(l => l.id !== payload.new.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const raw = searchParams.get('category')?.toLowerCase() ?? '';
    setCategory(urlToCategoryMap[raw] ?? 'All');
    const c = searchParams.get('county');
    if (c) setCounty(c);
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const catMap: Record<string, string> = { 'Homes': 'home', 'Apartments': 'apartment', 'Airbnb': 'airbnb', 'Hotels': 'hotel', 'Shops': 'shop', 'Services': 'service', 'Marketplace': 'marketplace' };

  const filtered = allListings.filter((l) => {
    const catMatch = category === 'All' || l.listing_type === catMap[category];
    const countyMatch = !county || l.county === county;
    const queryMatch = !query || [
      l.title, l.description, l.area, l.county, l.listing_type
    ].some(f => f?.toLowerCase().includes(query.toLowerCase()));
    return catMatch && countyMatch && queryMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* Fixed header with category tabs */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-3">
        <div className="max-w-7xl mx-auto space-y-2">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-sm font-medium px-4 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 ${
                  category === cat ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Search + filters row — visible on mobile */}
          <div className="flex gap-2 lg:hidden">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <i className="ri-search-line text-gray-400 text-sm flex-shrink-0"></i>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search listings..."
                className="text-sm outline-none bg-transparent flex-1 text-gray-700 min-w-0"
              />
              {query && <button onClick={() => setQuery('')} className="text-gray-400 cursor-pointer flex-shrink-0"><i className="ri-close-line text-sm"></i></button>}
            </div>
            <select value={county} onChange={e => setCounty(e.target.value)} className="text-xs border border-gray-200 bg-gray-50 text-gray-700 rounded-xl px-2 py-2 focus:outline-none cursor-pointer flex-shrink-0">
              <option value="">County</option>
              {kenyaCounties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={price} onChange={e => setPrice(e.target.value)} className="text-xs border border-gray-200 bg-gray-50 text-gray-700 rounded-xl px-2 py-2 focus:outline-none cursor-pointer flex-shrink-0">
              {priceOptions.map(p => <option key={p} value={p}>{p === 'Any Price' ? 'Price' : p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <main className="pt-36 md:pt-28">

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex gap-6">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0 space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-20">
                <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-equalizer-3-line text-emerald-600"></i>
                  </span>
                  Filters
                </h3>

                {/* County */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">County</label>
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="">All Counties</option>
                    {kenyaCounties.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Price Range</label>
                  <div className="space-y-1.5">
                    {priceOptions.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPrice(p)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                          price === p ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verified Only */}
                <div className="mb-5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setVerifiedOnly(!verifiedOnly)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${verifiedOnly ? 'bg-emerald-600' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${verifiedOnly ? 'left-5' : 'left-0.5'}`}></div>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Verified Only</span>
                  </label>
                  <p className="text-xs text-gray-400 mt-1 ml-13">Show only Nyumbani Hub-verified listings</p>
                </div>

                <button
                  onClick={() => { setCategory('All'); setCounty(''); setPrice('Any Price'); setVerifiedOnly(false); }}
                  className="w-full text-sm text-gray-400 hover:text-rose-500 py-2 border-t border-gray-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Clear All Filters
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Sort Bar */}
              <div className="flex items-center justify-between mb-5 gap-3">
                <p className="text-sm text-gray-500">
                  <strong className="text-gray-900">{filtered.length}</strong> found
                  {county && <span> in <strong>{county}</strong></span>}
                </p>
                <div className="flex items-center gap-2">
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm border border-gray-200 bg-white text-gray-700 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-400 cursor-pointer">
                    {sortOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Listings Grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
                </div>
              ) : filtered.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {filtered.slice(0, visibleCount).map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                  {visibleCount < filtered.length && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => setVisibleCount(v => v + 12)}
                        className="bg-white border border-emerald-200 text-emerald-600 font-semibold text-sm px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        Load More ({filtered.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                    <i className="ri-search-line text-gray-400 text-2xl"></i>
                  </div>
                  <p className="text-gray-500 font-medium">No listings match your filters</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search or clearing filters</p>
                  <button onClick={() => { setCategory('All'); setCounty(''); setPrice('Any Price'); }} className="mt-3 text-sm text-emerald-600 hover:underline cursor-pointer whitespace-nowrap">Clear Filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 md:bottom-8 right-4 w-11 h-11 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-all cursor-pointer z-40"
        >
          <i className="ri-arrow-up-line text-lg"></i>
        </button>
      )}
    </div>
  );
}
