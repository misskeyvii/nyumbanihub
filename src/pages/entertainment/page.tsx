import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import VerifiedBadge from '../../components/base/VerifiedBadge';
import { supabase } from '../../lib/supabase';
import { entertainmentTypes } from '../../mocks/entertainment';

export default function EntertainmentPage() {
  const [activeType, setActiveType] = useState('all');
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, name, phone, county, area, subcategory, avatar_url, is_active')
        .eq('account_type', 'entertainment')
        .eq('is_active', true);
      setProviders(data || []);
      setLoading(false);
    };
    fetchProviders();
  }, []);

  const subcategoryToType: Record<string, string> = {
    'Sounds & PA': 'sounds', 'Catering': 'catering', 'DJs': 'dj', 'MCs': 'mc',
  };

  const displayed = activeType === 'all'
    ? providers
    : providers.filter(p => subcategoryToType[p.subcategory] === activeType);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="relative bg-gray-900 overflow-hidden">
          <img
            src="https://readdy.ai/api/search-image?query=entertainment%20event%20Kenya%20outdoor%20concert%20DJ%20MC%20catering%20sound%20system%20lights%20crowd%20dancing%20night%20party%20colorful%20stage%20Nairobi%20vibrant&width=1400&height=420&seq=entbg1&orientation=landscape"
            alt="Nyumbani Hub Entertainment Kenya"
            className="w-full h-60 md:h-80 object-cover object-top opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span className="w-3 h-3 flex items-center justify-center"><i className="ri-shield-check-fill text-xs"></i></span>
              All Providers Verified
            </span>
            <h1 className="text-white font-bold text-2xl md:text-4xl lg:text-5xl">Entertainment for Every Event</h1>
            <p className="text-white/80 text-sm md:text-base mt-3 max-w-xl">
              Hire verified sounds, catering, DJs, and MCs for weddings, corporate events, parties, and more across Kenya.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                onClick={() => setActiveType('all')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  activeType === 'all' ? 'border-emerald-500 bg-emerald-50' : 'bg-white border-gray-100 hover:border-emerald-200'
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-xl mx-auto mb-2">
                  <i className="ri-apps-2-line text-emerald-600 text-lg"></i>
                </div>
                <p className="text-xs font-semibold text-gray-800">All</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{providers.length} providers</p>
              </button>
              {entertainmentTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveType(t.id)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    activeType === t.id ? 'border-emerald-500 bg-emerald-50' : 'bg-white border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-2 ${t.color}`}>
                    <i className={`${t.icon} text-lg`}></i>
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{t.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{providers.filter(p => subcategoryToType[p.subcategory] === t.id).length} providers</p>
                </button>
              ))}
            </div>
          </div>

          {/* Providers Grid */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {activeType === 'all' ? 'All Providers' : entertainmentTypes.find(t => t.id === activeType)?.label}
              <span className="ml-2 text-sm font-normal text-gray-400">({displayed.length} verified)</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 flex items-center justify-center bg-rose-50 rounded-full mx-auto mb-4">
                <i className="ri-user-search-line text-rose-400 text-2xl"></i>
              </div>
              <p className="text-gray-600 font-semibold">No providers listed yet</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-rose-200 transition-all group">
                  <div className="relative">
                    <div className="w-full h-44 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-4xl font-bold text-gray-300">{p.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute top-3 left-3">
                      <VerifiedBadge type="verified" size="sm" />
                    </div>
                    {p.subcategory && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">
                        {p.subcategory}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{p.name}</h3>
                    {(p.area || p.county) && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                        <i className="ri-map-pin-2-line text-emerald-500"></i>
                        {[p.area, p.county].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <a href={`tel:${p.phone}`} className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors whitespace-nowrap">
                        <i className="ri-phone-fill text-xs"></i> Call
                      </a>
                      <a href={`https://wa.me/${p.phone?.replace(/\D/g, '')}?text=Hi ${p.name}, I found you on Nyumbani Hub and I would like to book your services.`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba58] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors whitespace-nowrap">
                        <i className="ri-whatsapp-fill text-xs"></i> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trust Banner */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: 'ri-shield-check-line', color: 'text-emerald-600 bg-emerald-50', title: 'All Providers Verified', desc: 'Every provider is physically verified by Nyumbani Hub before listing.' },
              { icon: 'ri-user-star-line', color: 'text-amber-600 bg-amber-50', title: 'Real Reviews', desc: 'Reviews are from real Kenyans who hired these providers.' },
              { icon: 'ri-phone-line', color: 'text-rose-600 bg-rose-50', title: 'Direct Contact', desc: 'Contact providers directly — no booking fees, no middleman.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${item.color}`}>
                  <i className={`${item.icon} text-lg`}></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-r from-rose-600 to-rose-500 rounded-2xl p-6 md:p-8 text-white text-center">
            <h3 className="font-bold text-xl mb-2">Are You an Entertainment Provider?</h3>
            <p className="text-rose-100 text-sm max-w-md mx-auto mb-5">
              List your entertainment services on Nyumbani Hub and get discovered by thousands of event organizers across Kenya.
            </p>
            <Link to="/signin" className="inline-block bg-white text-rose-600 font-bold text-sm px-7 py-3 rounded-xl hover:bg-rose-50 transition-colors whitespace-nowrap">
              Register as Entertainment Provider
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
