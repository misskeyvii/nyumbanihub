import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import { serviceTypeInfo } from '../../mocks/services';
import { supabase } from '../../lib/supabase';

const slugToSubcategory: Record<string, string> = {
  'mama-fua': 'Mama Fua', 'movers': 'Movers', 'caretaker': 'Caretakers',
  'plumbing': 'Plumbing', 'electrician': 'Electricians', 'security': 'Security',
  'landscaping': 'Landscaping', 'painting': 'Painting',
  'gas-delivery': 'Gas Delivery', 'water-dispenser': 'Dispenser Water',
};

const serviceTypes = [
  { id: 'mama-fua', icon: 'ri-home-heart-line', color: 'bg-sky-50 text-sky-600' },
  { id: 'movers', icon: 'ri-truck-line', color: 'bg-amber-50 text-amber-600' },
  { id: 'caretaker', icon: 'ri-user-heart-line', color: 'bg-rose-50 text-rose-600' },
  { id: 'plumbing', icon: 'ri-water-flash-line', color: 'bg-blue-50 text-blue-600' },
  { id: 'electrician', icon: 'ri-flashlight-line', color: 'bg-yellow-50 text-yellow-600' },
  { id: 'security', icon: 'ri-shield-user-line', color: 'bg-gray-100 text-gray-700' },
  { id: 'landscaping', icon: 'ri-plant-line', color: 'bg-green-50 text-green-600' },
  { id: 'painting', icon: 'ri-paint-brush-line', color: 'bg-orange-50 text-orange-600' },
  { id: 'gas-delivery', icon: 'ri-fire-line', color: 'bg-red-50 text-red-600' },
  { id: 'water-dispenser', icon: 'ri-drop-line', color: 'bg-cyan-50 text-cyan-600' },
];

export default function ServicesPage() {
  const [hovered, setHovered] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [totalService, setTotalService] = useState(0);
  const [totalEntertainment, setTotalEntertainment] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase
        .from('users')
        .select('subcategory, account_type')
        .in('account_type', ['service', 'entertainment'])
        .eq('is_active', true);
      if (!data) return;
      const c: Record<string, number> = {};
      let svc = 0, ent = 0;
      data.forEach(u => {
        if (u.subcategory) c[u.subcategory] = (c[u.subcategory] || 0) + 1;
        if (u.account_type === 'service') svc++;
        if (u.account_type === 'entertainment') ent++;
      });
      setCounts(c);
      setTotalService(svc);
      setTotalEntertainment(ent);
    };
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="relative bg-gray-900 overflow-hidden">
          <img
            src="https://readdy.ai/api/search-image?query=professional%20service%20workers%20Kenya%20team%20mama%20fua%20cleaner%20mover%20caretaker%20uniformed%20modern%20building%20outdoor%20smiling%20confident%20group%20diverse&width=1400&height=380&seq=svcbg&orientation=landscape"
            alt="Nyumbani Hub Verified Services Kenya"
            className="w-full h-52 md:h-72 object-cover object-top opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span className="w-3 h-3 flex items-center justify-center"><i className="ri-shield-check-fill text-xs"></i></span>
              All Providers Verified
            </span>
            <h1 className="text-white font-bold text-2xl md:text-4xl">Trusted Services in Kenya</h1>
            <p className="text-white/70 text-sm mt-2 max-w-md">
              Every Mama Fua, mover, and caretaker is background-checked and physically verified by Nyumbani Hub.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { value: totalService + totalEntertainment, label: 'Verified Providers', icon: 'ri-user-check-line', color: 'text-emerald-600' },
              { value: '100%', label: 'Background Checked', icon: 'ri-shield-check-line', color: 'text-amber-600' },
              { value: 'Free', label: 'Direct Contact', icon: 'ri-phone-line', color: 'text-rose-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <div className={`w-8 h-8 flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                  <i className={`${stat.icon} text-lg`}></i>
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Service Type Grid */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Browse Services</h2>
            <p className="text-gray-500 text-sm mb-5">Click any service to see verified providers near you.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {serviceTypes.map((s) => {
                const info = serviceTypeInfo[s.id];
                return (
                  <Link
                    key={s.id}
                    to={`/services/${s.id}`}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered('')}
                    className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer block ${
                      hovered === s.id ? 'border-emerald-500 bg-emerald-50' : 'bg-white border-gray-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-3 transition-colors ${s.color}`}>
                      <i className={`${s.icon} text-xl`}></i>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{info?.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 mb-2">{info?.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-600 font-medium">{counts[slugToSubcategory[s.id]] || 0} providers</span>
                      <span className="w-5 h-5 flex items-center justify-center bg-emerald-50 rounded-full">
                        <i className="ri-arrow-right-s-line text-emerald-600 text-sm"></i>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Also see Entertainment */}
          <div className="mb-10 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-5">
            <div className="w-16 h-16 flex items-center justify-center bg-rose-500 rounded-2xl flex-shrink-0">
              <i className="ri-music-2-line text-white text-2xl"></i>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-gray-900 text-lg">Need Entertainment for an Event?</h3>
              <p className="text-gray-500 text-sm mt-1">Hire verified DJs, MCs, catering services, and sound systems for your events across Kenya.</p>
            </div>
            <Link
              to="/entertainment"
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors flex-shrink-0 whitespace-nowrap"
            >
              Browse Entertainment
            </Link>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-10">
            <h2 className="font-bold text-gray-900 text-xl text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '01', icon: 'ri-search-2-line', title: 'Choose Service', desc: 'Browse verified Mama Fua, movers, plumbers, and more.' },
                { step: '02', icon: 'ri-user-follow-line', title: 'View Provider', desc: 'Check ratings, experience, and verified badge.' },
                { step: '03', icon: 'ri-phone-line', title: 'Contact Directly', desc: 'Call or WhatsApp the provider — no fees, no middleman.' },
                { step: '04', icon: 'ri-star-line', title: 'Leave a Review', desc: 'Help other Kenyans find quality services near them.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 rounded-2xl mx-auto">
                      <i className={`${item.icon} text-emerald-600 text-lg`}></i>
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-emerald-600 text-white text-[10px] font-bold rounded-full">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Register as Provider CTA */}
          <div className="bg-emerald-700 rounded-2xl p-6 md:p-8 text-white text-center">
            <h3 className="font-bold text-xl mb-2">Are You a Service Provider?</h3>
            <p className="text-emerald-100 text-sm max-w-md mx-auto mb-5">
              Register on Nyumbani Hub, get physically verified, and grow your business with thousands of new clients across Kenya.
            </p>
            <Link to="/signin" className="inline-block bg-white text-emerald-700 font-bold text-sm px-7 py-3 rounded-xl hover:bg-emerald-50 transition-colors whitespace-nowrap">
              Register as Provider
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
