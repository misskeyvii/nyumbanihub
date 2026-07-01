import SEO from '../../components/base/SEO';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import ListingCard from '../../components/base/ListingCard';
import ListingCardSkeleton from '../../components/base/ListingCardSkeleton';
import { kenyaCounties } from '../../mocks/listings';
import { supabase } from '../../lib/supabase';

interface ExplorePageProps {
  fixedCategory?: 'homes' | 'apartments' | 'airbnb' | 'hotels' | 'shops';
  heroImage?: string;
}

const allCategoryOptions = ['All', 'Homes', 'Apartments', 'Airbnb', 'Hotels', 'Shops', 'Marketplace'] as const;
const priceOptions = ['Any Price', 'Under KSh 5K', 'KSh 5K–20K', 'KSh 20K–60K', 'KSh 60K+'] as const;
const sortOptions = ['Latest', 'Price: Low to High', 'Price: High to Low', 'Top Rated'] as const;
const fixedCategoryLabels: Record<Exclude<ExplorePageProps['fixedCategory'], undefined>, string> = {
  homes: 'Homes',
  apartments: 'Apartments',
  airbnb: 'Airbnb',
  hotels: 'Hotels',
  shops: 'Shops',
};

const fixedCategoryHero: Record<Exclude<ExplorePageProps['fixedCategory'], undefined>, {
  title: string;
  subtitle: string;
  image: string;
  stats: Array<{ icon: string; color: string; value: string; label: string }>;
  browseTitle: string;
  browseSubtitle: string;
  browseItems: Array<{ title: string; subtitle: string }>;
}> = {
  homes: {
    title: 'Trusted Homes in Kenya',
    subtitle: 'Browse verified homes for rent and sale across Kenya, from Nairobi estates to coastal getaways.',
    image: 'https://readdy.ai/api/search-image?query=modern%20kenyan%20home%20interior%20bright%20living%20room%20sunny%20garden&width=1400&height=420&orientation=landscape',
    stats: [
      { icon: 'ri-home-3-line', color: 'text-emerald-600', value: 'Verified Listings', label: 'Trusted homes' },
      { icon: 'ri-map-pin-line', color: 'text-sky-600', value: '47 counties', label: 'Nationwide coverage' },
      { icon: 'ri-phone-line', color: 'text-rose-600', value: 'Direct contact', label: 'No middleman' },
    ],
    browseTitle: 'Browse Homes',
    browseSubtitle: 'Find the right home for rent, sale or long-term stay across top Kenyan locations.',
    browseItems: [
      { title: 'Family Homes', subtitle: 'Spacious homes for families and groups' },
      { title: 'City Homes', subtitle: 'Modern homes near Nairobi and Kisumu' },
      { title: 'Beach Homes', subtitle: 'Coastal homes by the ocean' },
      { title: 'Luxury Homes', subtitle: 'Premium properties with top amenities' },
    ],
  },
  apartments: {
    title: 'Verified Apartments in Kenya',
    subtitle: 'Find quality apartments and serviced flats in Nairobi, Mombasa, Kisumu and beyond.',
    image: 'https://readdy.ai/api/search-image?query=kenyan%20apartment%20balcony%20city%20skyline%20modern%20interior&width=1400&height=420&orientation=landscape',
    stats: [
      { icon: 'ri-building-4-line', color: 'text-sky-600', value: 'High quality', label: 'Verified units' },
      { icon: 'ri-map-pin-line', color: 'text-emerald-600', value: '47 counties', label: 'Nationwide coverage' },
      { icon: 'ri-wallet-3-line', color: 'text-amber-600', value: 'Flexible budgets', label: 'Affordable options' },
    ],
    browseTitle: 'Browse Apartments',
    browseSubtitle: 'Search apartments and flats with verified listings across Kenya’s major towns.',
    browseItems: [
      { title: 'Serviced Flats', subtitle: 'Fully managed apartments for hassle-free stays' },
      { title: 'Studio Apartments', subtitle: 'Compact city apartments for singles and couples' },
      { title: 'Long-term Rentals', subtitle: 'Verified apartments for longer stays' },
      { title: 'Luxury Apartments', subtitle: 'Premium apartments with extra comfort' },
    ],
  },
  airbnb: {
    title: 'Verified Stays in Kenya',
    subtitle: 'Book trusted Airbnb-style stays and holiday homes checked by Nyumbani Hub.',
    image: 'https://readdy.ai/api/search-image?query=cozy%20kenyan%20airbnb%20cottage%20vacation%20home%20garden%20sunset&width=1400&height=420&orientation=landscape',
    stats: [
      { icon: 'ri-home-heart-line', color: 'text-rose-600', value: 'Handpicked stays', label: 'Verified hosts' },
      { icon: 'ri-map-pin-line', color: 'text-sky-600', value: '47 counties', label: 'Nationwide coverage' },
      { icon: 'ri-star-smile-line', color: 'text-emerald-600', value: 'Trusted stays', label: 'Verified reviews' },
    ],
    browseTitle: 'Browse Stays',
    browseSubtitle: 'Find holiday homes and guest stays with trusted hosts across Kenya.',
    browseItems: [
      { title: 'Cozy Cottages', subtitle: 'Quiet country homes and cottages' },
      { title: 'City Apartments', subtitle: 'Central stays with easy access to local neighborhoods' },
      { title: 'Family Villas', subtitle: 'Large homes for family trips and group stays' },
      { title: 'Budget Stays', subtitle: 'Affordable and verified stays for short trips' },
    ],
  },
  hotels: {
    title: 'Trusted Hotels in Kenya',
    subtitle: 'Discover verified hotels, lodges and guesthouses with transparent details and direct contact.',
    image: 'https://readdy.ai/api/search-image?query=kenyan%20hotel%20lobby%20luxury%20comfortable%20modern%20interior&width=1400&height=420&orientation=landscape',
    stats: [
      { icon: 'ri-hotel-bed-line', color: 'text-amber-600', value: 'Verified stays', label: 'Trusted hotels' },
      { icon: 'ri-map-pin-line', color: 'text-emerald-600', value: '47 counties', label: 'Nationwide coverage' },
      { icon: 'ri-phone-line', color: 'text-rose-600', value: 'Direct contact', label: 'Book direct' },
    ],
    browseTitle: 'Browse Hotels',
    browseSubtitle: 'Find verified hotels, lodges, and guesthouses across Kenya with easy booking details.',
    browseItems: [
      { title: 'City Hotels', subtitle: 'Hotels in Nairobi, Mombasa, and Kisumu' },
      { title: 'Boutique Hotels', subtitle: 'Charming stays with local character' },
      { title: 'Beach Resorts', subtitle: 'Oceanfront hotels and resort stays' },
      { title: 'Economy Hotels', subtitle: 'Budget-friendly verified options' },
    ],
  },
  shops: {
    title: 'Verified Shops in Kenya',
    subtitle: 'Shop from verified retailers and vendors offering products across Kenya through Nyumbani Hub.',
    image: 'https://readdy.ai/api/search-image?query=kenyan%20retail%20shop%20market%20store%20friendly%20staff%20bright%20interior&width=1400&height=420&orientation=landscape',
    stats: [
      { icon: 'ri-shopping-bag-2-line', color: 'text-sky-600', value: 'Verified vendors', label: 'Trusted shops' },
      { icon: 'ri-map-pin-line', color: 'text-emerald-600', value: '47 counties', label: 'Nationwide coverage' },
      { icon: 'ri-wallet-3-line', color: 'text-amber-600', value: 'Shop direct', label: 'No middleman' },
    ],
    browseTitle: 'Browse Shops',
    browseSubtitle: 'Discover trusted shops and vendors offering products across Kenya.',
    browseItems: [
      { title: 'Electronics', subtitle: 'Verified sellers for gadgets and devices' },
      { title: 'Fashion & Clothing', subtitle: 'Trusted apparel stores and boutiques' },
      { title: 'Home Essentials', subtitle: 'Household goods and groceries nearby' },
      { title: 'Small Businesses', subtitle: 'Local shops with verified ratings' },
    ],
  },
};

const urlToCategoryMap: Record<string, string> = {
  homes: 'Homes',
  apartments: 'Apartments',
  airbnb: 'Airbnb',
  hotels: 'Hotels',
  shops: 'Shops',
  marketplace: 'Marketplace',
};

export default function ExplorePage({ fixedCategory, heroImage }: ExplorePageProps) {
  const [searchParams] = useSearchParams();
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [category, setCategory] = useState(() => fixedCategory ? fixedCategoryLabels[fixedCategory] : 'All');
  const [county, setCounty] = useState(searchParams.get('county') ?? '');
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [price, setPrice] = useState('Any Price');
  const [sort, setSort] = useState('Latest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    supabase.from('listings').select('*').eq('status', 'live').neq('listing_type', 'service').order('created_at', { ascending: false })
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
    if (!fixedCategory) {
      const raw = searchParams.get('category')?.toLowerCase() ?? '';
      setCategory(urlToCategoryMap[raw] ?? 'All');
    } else {
      setCategory(fixedCategoryLabels[fixedCategory]);
    }
    const c = searchParams.get('county');
    setCounty(c ?? '');
    const q = searchParams.get('q');
    setQuery(q ?? '');
  }, [searchParams, fixedCategory]);

  const catMap: Record<string, string> = { 'Homes': 'home', 'Apartments': 'apartment', 'Airbnb': 'airbnb', 'Hotels': 'hotel', 'Shops': 'shop', 'Marketplace': 'marketplace' };

  const filtered = allListings.filter((l) => {
    const catMatch = category === 'All' || l.listing_type === catMap[category];
    const countyMatch = !county || l.county === county;
    const queryMatch = !query || [
      l.title, l.description, l.area, l.county, l.listing_type
    ].some(f => f?.toLowerCase().includes(query.toLowerCase()));
    return catMatch && countyMatch && queryMatch;
  });

  const title = fixedCategory
    ? `Browse ${fixedCategoryLabels[fixedCategory]} in Kenya`
    : 'Explore Verified Listings in Kenya';

  const description = fixedCategory
    ? `Browse verified ${fixedCategoryLabels[fixedCategory].toLowerCase()} across Kenya. Search ${fixedCategoryLabels[fixedCategory].toLowerCase()} listings by county, price and query.`
    : 'Browse verified homes, apartments, Airbnbs, hotels, shops and services across all 47 counties in Kenya. Filter by location, price and category on Nyumbani Hub.';

  const path = fixedCategory ? `/${fixedCategory}` : '/explore';

  const categoryOptions = fixedCategory ? [fixedCategoryLabels[fixedCategory]] : [...allCategoryOptions];

  const clearFilters = () => {
    if (!fixedCategory) setCategory('All');
    setCounty('');
    setPrice('Any Price');
    setVerifiedOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SEO
        title={title}
        description={description}
        path={path}
      />
      <Navbar />

      {!fixedCategory && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-3">
          <div className="max-w-7xl mx-auto space-y-2">
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
          </div>
        </div>
      )}

      <main className={fixedCategory ? 'pt-16' : 'pt-36 md:pt-28'}>
        {fixedCategory && (
          <>
            <div className="relative bg-gray-900 overflow-hidden">
              <img
                src={heroImage ?? fixedCategoryHero[fixedCategory].image}
                alt={fixedCategoryHero[fixedCategory].title}
                className="w-full h-52 md:h-72 object-cover object-center opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-3">
                  <span className="w-3 h-3 flex items-center justify-center"><i className="ri-shield-check-fill text-[10px]"></i></span>
                  Verified and trusted listings
                </span>
                <h1 className="text-white font-bold text-2xl md:text-4xl max-w-3xl">{fixedCategoryHero[fixedCategory].title}</h1>
                <p className="text-white/70 text-sm mt-2 max-w-md">
                  {fixedCategoryHero[fixedCategory].subtitle}
                </p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
              <div className="bg-white rounded-3xl border border-gray-100 p-4 md:p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr] items-center">
                  <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-3">
                    <i className="ri-search-line text-gray-400 text-lg"></i>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Search ${fixedCategoryLabels[fixedCategory]} listings...`}
                      className="w-full bg-transparent outline-none text-sm text-gray-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-3 bg-white text-gray-700 focus:outline-none cursor-pointer"
                    >
                      <option value="">All Counties</option>
                      {kenyaCounties.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-3 bg-white text-gray-700 focus:outline-none cursor-pointer"
                    >
                      {priceOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

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
                  onClick={clearFilters}
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
