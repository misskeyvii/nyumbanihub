import { useState, useEffect } from 'react';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import ListingCard from '../../components/base/ListingCard';
import { kenyaCounties } from '../../mocks/listings';
import { supabase } from '../../lib/supabase';

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [county, setCounty] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('listings').select('*').eq('status', 'live').eq('listing_type', 'marketplace').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        console.log('marketplace listings:', data, error);
        setProducts(data || []);
      });
  }, []);

  const filtered = products.filter((p) => {
    const countyMatch = !county || p.county === county;
    const searchMatch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.area?.toLowerCase().includes(search.toLowerCase());
    return countyMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16">
        {/* Hero Banner */}
        <div className="relative bg-gray-900 overflow-hidden">
          <img
            src="https://readdy.ai/api/search-image?query=Kenya%20marketplace%20modern%20shop%20interior%20products%20display%20verified%20business%20clean%20organized%20retail%20shelves%20bright%20colorful&width=1400&height=400&seq=600&orientation=landscape"
            alt="Nyumbani Hub Marketplace"
            className="w-full h-48 md:h-64 object-cover object-top opacity-40"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span className="w-3 h-3 flex items-center justify-center"><i className="ri-store-2-fill text-xs"></i></span>
              Verified Shops Only
            </span>
            <h1 className="text-white font-bold text-2xl md:text-4xl">Nyumbani Hub Marketplace</h1>
            <p className="text-white/70 text-sm mt-2 max-w-lg">Every product is from a verified, traceable physical shop in Kenya. You can visit the seller in real life.</p>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="bg-amber-50 border-b border-amber-100 px-4 md:px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {[
              { icon: 'ri-shield-check-fill', text: 'All shops physically verified', color: 'text-emerald-600' },
              { icon: 'ri-map-pin-2-fill', text: 'Real shop locations visible', color: 'text-emerald-600' },
              { icon: 'ri-walk-line', text: 'Visit any seller in person', color: 'text-amber-600' },
              { icon: 'ri-spy-line', text: 'Zero anonymous sellers', color: 'text-rose-500' },
            ].map((t) => (
              <div key={t.text} className="flex items-center gap-1.5">
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className={`${t.icon} text-sm ${t.color}`}></i>
                </span>
                <span className="text-xs text-gray-600 font-medium whitespace-nowrap">{t.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Search + County Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-emerald-400 transition-colors">
              <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className="ri-search-line text-gray-400 text-sm"></i>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or shops..."
                className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
              />
            </div>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="sm:w-48 text-sm border border-gray-200 bg-white text-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option value="">All Counties</option>
              {kenyaCounties.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Result Count */}
          <p className="text-sm text-gray-500 mb-4">
            <strong className="text-gray-900">{filtered.length}</strong> products from verified shops
          </p>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((product) => (
              <ListingCard key={product.id} listing={product} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-3">
                <i className="ri-store-2-line text-gray-300 text-2xl"></i>
              </div>
              <p className="text-gray-500">No products found. Try adjusting your filters.</p>
            </div>
          )}

          {/* List Your Shop CTA */}
          <div className="mt-12 bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-white">
            <div className="w-14 h-14 flex items-center justify-center bg-white/10 rounded-2xl flex-shrink-0">
              <i className="ri-store-2-line text-white text-2xl"></i>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-xl">Own a Shop? List Your Products Here</h3>
              <p className="text-emerald-100 text-sm mt-1">Join 892+ verified businesses. Get your shop inspected and start selling to thousands of Kenyan customers.</p>
            </div>
            <a href="/post-listing" className="bg-white text-emerald-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors whitespace-nowrap flex-shrink-0">
              List Your Shop
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
