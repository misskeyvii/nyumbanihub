import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../../../components/feature/Navbar';
import MobileBottomNav from '../../../components/feature/MobileBottomNav';
import Footer from '../../../components/feature/Footer';
import VerifiedBadge from '../../../components/base/VerifiedBadge';
import { serviceTypeInfo } from '../../../mocks/services';
import { supabase } from '../../../lib/supabase';

// Maps URL slug -> subcategory value stored in DB
const slugToSubcategory: Record<string, string> = {
  'mama-fua': 'Mama Fua',
  'movers': 'Movers',
  'caretaker': 'Caretakers',
  'plumbing': 'Plumbing',
  'electrician': 'Electricians',
  'security': 'Security',
  'landscaping': 'Landscaping',
  'painting': 'Painting',
  'gas-delivery': 'Gas Delivery',
  'water-dispenser': 'Dispenser Water',
};

export default function ServiceDetailPage() {
  const { type } = useParams<{ type: string }>();
  const info = serviceTypeInfo[type || ''];
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subcategory = slugToSubcategory[type || ''];
    if (!subcategory) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, name, phone, county, area, subcategory, avatar_url, is_active')
        .eq('account_type', 'service')
        .eq('subcategory', subcategory)
        .eq('is_active', true);
      setProviders(data || []);
      setLoading(false);
    };
    fetch();
  }, [type]);

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Service not found. <Link to="/services" className="text-emerald-600">Back to Services</Link></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="relative bg-gray-900 overflow-hidden">
          <img
            src={info.bgImage}
            alt={info.label}
            className="w-full h-52 md:h-72 object-cover object-top opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <Link to="/services" className="inline-flex items-center gap-1 text-white/70 text-xs mb-3 hover:text-white transition-colors cursor-pointer">
              <span className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-s-line"></i></span>
              All Services
            </Link>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span className="w-3 h-3 flex items-center justify-center"><i className="ri-shield-check-fill text-xs"></i></span>
              All Providers Verified
            </span>
            <h1 className="text-white font-bold text-2xl md:text-4xl">{info.label}</h1>
            <p className="text-white/70 text-sm mt-2 max-w-md">{info.desc}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          {/* Stats row */}
          <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex-shrink-0 bg-white rounded-2xl border border-gray-100 px-5 py-3 text-center">
              <p className="text-xl font-bold text-gray-900">{providers.length}</p>
              <p className="text-xs text-gray-500">Verified Providers</p>
            </div>
            <div className="flex-shrink-0 bg-white rounded-2xl border border-gray-100 px-5 py-3 text-center">
              <p className="text-xl font-bold text-emerald-600">100%</p>
              <p className="text-xs text-gray-500">Background Checked</p>
            </div>
            <div className="flex-shrink-0 bg-white rounded-2xl border border-gray-100 px-5 py-3 text-center">
              <p className="text-xl font-bold text-gray-900">Direct</p>
              <p className="text-xs text-gray-500">Contact (No middleman)</p>
            </div>
          </div>

          {/* Providers Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {providers.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-emerald-200 transition-all group">
                  <div className="relative">
                    <div className="w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-5xl font-bold text-gray-300">{p.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute top-3 left-3">
                      <VerifiedBadge type="inspected" size="sm" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{p.name}</h3>
                    {(p.area || p.county) && (
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <i className="ri-map-pin-2-line text-emerald-500"></i>
                        {[p.area, p.county].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <a href={`tel:${p.phone}`} className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors whitespace-nowrap">
                        <i className="ri-phone-fill text-xs"></i> Call Now
                      </a>
                      <a href={`https://wa.me/${p.phone?.replace(/\D/g, '')}?text=Hi ${p.name}, I found you on Nyumbani Hub and I need your services.`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba58] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors whitespace-nowrap">
                        <i className="ri-whatsapp-fill text-xs"></i> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 flex items-center justify-center bg-emerald-50 rounded-full mx-auto mb-4">
                <i className="ri-user-search-line text-emerald-400 text-2xl"></i>
              </div>
              <p className="text-gray-600 font-semibold">No providers listed yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first {info.label} provider on Nyumbani Hub!</p>
              <Link to="/signin" className="inline-block mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                Register as Provider
              </Link>
            </div>
          )}

          {/* Register CTA */}
          <div className="mt-12 bg-emerald-700 rounded-2xl p-6 md:p-8 text-white text-center">
            <h3 className="font-bold text-xl mb-2">Are You a {info.label} Provider?</h3>
            <p className="text-emerald-100 text-sm max-w-md mx-auto mb-5">
              Get listed on Nyumbani Hub, pass our physical verification, and connect with thousands of Kenyans who need your services.
            </p>
            <Link to="/signin" className="inline-block bg-white text-emerald-700 font-bold text-sm px-7 py-3 rounded-xl hover:bg-emerald-50 transition-colors whitespace-nowrap">
              Register as {info.label}
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
