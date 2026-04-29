import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kenyaCounties } from '../../../mocks/listings';
import { supabase } from '../../../lib/supabase';

const categories = ['All', 'Homes', 'Apartments', 'Airbnb', 'Hotels', 'Shops', 'Services', 'Marketplace'];

export default function HeroSection() {
  const [county, setCounty] = useState('');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({ listings: 0, users: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'live'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true).eq('role', 'user'),
    ]).then(([{ count: listings }, { count: users }]) => {
      setStats({ listings: listings || 0, users: users || 0 });
    });
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category.toLowerCase());
    if (county) params.set('county', county);
    if (query.trim()) params.set('q', query.trim());
    navigate(`/explore${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative flex flex-col justify-center overflow-hidden min-h-[285px] md:min-h-screen">

      {/* ── Background image ── */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://i.postimg.cc/Gt0TBpYL/nai.jpg"
          alt="Nairobi Kenya"
          className="w-full h-full object-cover object-center"
        />
        {/* Multi-layer gradient for depth and richness */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-emerald-950/40 to-black/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        {/* Emerald glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-900/40 to-transparent" />
        {/* Subtle vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
      </div>

      {/* ── Floating decorative o rbs ── */} 
      <div className="absolute top-8 right-6 w-28 h-28 md:w-64 md:h-64 rounded-full bg-emerald-500/20 blur-2xl md:blur-3xl orb-float pointer-events-none" />
      <div className="absolute top-1/2 -left-8 w-24 h-24 md:w-56 md:h-56 rounded-full bg-teal-400/15 blur-2xl md:blur-3xl orb-float-slow pointer-events-none" />
      <div className="absolute bottom-6 right-1/3 w-20 h-20 md:w-44 md:h-44 rounded-full bg-emerald-300/15 blur-xl md:blur-2xl orb-float-mid pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full pt-16 pb-5 md:pt-28 md:pb-20">
        <div className="max-w-3xl mx-auto text-center">

          {/* Verified pill */}
          <div className="fade-slide-up inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-emerald-400/30 rounded-full px-3 py-1 mb-2.5 md:mb-6 md:px-4 md:py-1.5">
            <span className="w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
              <i className="ri-shield-check-fill text-emerald-400 text-xs md:text-sm" />
            </span>
            <span className="text-white/90 text-[10px] md:text-xs font-semibold tracking-wide">
              100% Verified — Zero Scams
            </span>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="fade-slide-up-1 font-bold text-white leading-tight">
            <span className="block text-xl md:text-5xl lg:text-6xl">
              Find Verified
              <span className="ml-2 shimmer-text">Homes,</span>
            </span>
            <span className="block text-base md:text-5xl lg:text-6xl mt-0.5 md:mt-1">
              <span className="shimmer-text">Services</span>
              <span className="text-white mx-1.5">&amp;</span>
              <span className="shimmer-text">Products</span>
              <span className="text-white/80 text-sm md:text-4xl ml-2">in Kenya</span>
            </span>
          </h1>

          {/* Tagline — short on mobile */}
          <p className="fade-slide-up-2 text-white/65 text-[11px] md:text-lg mt-2 mb-3 md:mt-4 md:mb-8 max-w-[240px] md:max-w-xl mx-auto leading-snug md:leading-relaxed">
            <span className="md:hidden">Trusted landlords, shops &amp; services — physically verified.</span>
            <span className="hidden md:inline">Nyumbani Hub connects you to trusted landlords, businesses, and service providers — all physically verified, zero scams.</span>
          </p>

          {/* Desktop stats */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-3 mb-8 fade-slide-up-2">
            {[
              { icon: 'ri-list-check-3', val: `${stats.listings.toLocaleString()}+`, label: 'Verified Listings' },
              { icon: 'ri-user-check-fill', val: `${stats.users.toLocaleString()}+`, label: 'Verified Users' },
              { icon: 'ri-shield-check-fill', val: '100%', label: 'Scam-Free' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5">
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className={`${s.icon} text-emerald-400 text-sm`} />
                </span>
                <span className="text-white font-bold text-sm">{s.val}</span>
                <span className="text-white/70 text-xs">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── Search box ── */}
          <div className="fade-slide-up-3 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl p-2 md:p-4 max-w-2xl mx-auto glow-pulse">

            {/* Category tabs */}
            <div className="flex gap-1 mb-2 md:mb-3 overflow-x-auto pb-0.5 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] md:text-xs font-semibold px-2.5 md:px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Row: search input | county | search button */}
            <div className="flex gap-1.5">
              <div className="flex-1 flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-2 md:py-2.5 bg-gray-50">
                <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  <i className="ri-search-line text-emerald-600 text-xs" />
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  type="text"
                  placeholder="Search homes, shops, services..."
                  className="flex-1 text-xs text-gray-700 bg-transparent outline-none min-w-0"
                />
              </div>

              <div className="flex-shrink-0 flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-2 md:py-2.5 bg-gray-50">
                <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  <i className="ri-map-pin-2-line text-emerald-600 text-xs" />
                </span>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="text-xs text-gray-700 bg-transparent outline-none cursor-pointer"
                >
                  <option value="">All Counties</option>
                  {kenyaCounties.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSearch}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs md:text-sm px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
              >
                <i className="ri-search-line text-xs md:text-sm" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Mobile search — full width prominent */}
          <div className="flex md:hidden mt-3 fade-slide-up-3 w-full max-w-sm mx-auto">
            <div className="flex w-full gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-lg">
                <i className="ri-search-line text-emerald-600 text-sm flex-shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  type="text"
                  placeholder="Search homes, services..."
                  className="flex-1 text-sm text-gray-700 bg-transparent outline-none min-w-0"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-emerald-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex-shrink-0 cursor-pointer"
              >
                <i className="ri-search-line" />
              </button>
            </div>
          </div>

          {/* Mobile sign-in nudge */}
          <div className="flex md:hidden items-center justify-center gap-3 mt-3 fade-slide-up-3">
            {!isLoggedIn && (
              <>
                <a
                  href="/signin"
                  onClick={(e) => { e.preventDefault(); navigate('/signin'); }}
                  className="text-white/80 text-xs font-medium underline underline-offset-2 cursor-pointer hover:text-white transition-colors"
                >
                  Sign In
                </a>
                <span className="text-white/30 text-xs">·</span>
              </>
            )}
            <a
              href="/post-listing"
              onClick={(e) => { e.preventDefault(); navigate('/post-listing'); }}
              className="inline-flex items-center gap-1 bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-400/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="w-3 h-3 flex items-center justify-center">
                <i className="ri-add-line text-xs" />
              </span>
              Post a Listing
            </a>
          </div>

          {/* Desktop popular searches */}
          <div className="hidden md:flex mt-5 flex-wrap items-center justify-center gap-2">
            <span className="text-white/55 text-xs">Popular:</span>
            {['Bedsitter Nairobi', 'Airbnb Mombasa', 'Mama Fua Westlands', '2BR Kilimani'].map((t) => (
              <button
                key={t}
                onClick={() => navigate(`/explore?q=${encodeURIComponent(t)}`)}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 px-3 py-1 rounded-full transition-colors cursor-pointer whitespace-nowrap"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
