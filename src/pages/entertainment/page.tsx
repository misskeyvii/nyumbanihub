import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import VerifiedBadge from '../../components/base/VerifiedBadge';
import { entertainmentProviders, entertainmentTypes, getEntertainmentByType } from '../../mocks/entertainment';

export default function EntertainmentPage() {
  const [activeType, setActiveType] = useState<string>('all');

  const displayed = activeType === 'all' ? entertainmentProviders : getEntertainmentByType(activeType);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <div className="relative bg-gray-900 overflow-hidden">
          <img
            src="https://readdy.ai/api/search-image?query=entertainment%20event%20Kenya%20outdoor%20concert%20DJ%20MC%20catering%20sound%20system%20lights%20crowd%20dancing%20night%20party%20colorful%20stage%20Nairobi%20vibrant&width=1400&height=420&seq=entbg1&orientation=landscape"
            alt="Mabidha Entertainment Kenya"
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
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {['Weddings', 'Corporate Events', 'Concerts', 'Parties', 'Graduations', 'Funerals'].map((tag) => (
                <span key={tag} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full border border-white/30 backdrop-blur-sm">{tag}</span>
              ))}
            </div>
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
                <p className="text-[10px] text-gray-400 mt-0.5">{entertainmentProviders.length} providers</p>
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
                  <p className="text-[10px] text-gray-400 mt-0.5">{getEntertainmentByType(t.id).length} providers</p>
                </button>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-10">
            <h2 className="font-bold text-gray-900 text-lg text-center mb-6">How to Book Entertainment</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { step: '01', icon: 'ri-search-2-line', title: 'Browse Providers', desc: 'Find verified DJs, caterers, MCs, and sound providers in your county.' },
                { step: '02', icon: 'ri-user-follow-line', title: 'Check Profile', desc: 'View ratings, past events, tags, and pricing before deciding.' },
                { step: '03', icon: 'ri-whatsapp-line', title: 'Contact Directly', desc: 'Call or WhatsApp the provider — zero middleman fees.' },
                { step: '04', icon: 'ri-star-line', title: 'Rate Experience', desc: 'Leave a review to help future Kenyans make great choices.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="relative inline-block mb-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-rose-50 rounded-2xl mx-auto">
                      <i className={`${item.icon} text-rose-500 text-lg`}></i>
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayed.map((provider) => (
              <div key={provider.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-rose-200 transition-all group">
                <div className="relative">
                  <div className="w-full h-44 overflow-hidden bg-gray-100">
                    <img
                      src={provider.image}
                      alt={provider.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute top-3 left-3">
                    <VerifiedBadge type="verified" size="sm" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">
                    {entertainmentTypes.find(t => t.id === provider.type)?.label || provider.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{provider.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <span className="w-3 h-3 flex items-center justify-center"><i className="ri-map-pin-2-line text-emerald-500"></i></span>
                    {provider.location}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {provider.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 flex items-center justify-center"><i className="ri-star-fill text-amber-400 text-xs"></i></span>
                      <span className="text-xs font-bold text-gray-800">{provider.rating}</span>
                      <span className="text-xs text-gray-400">({provider.reviews})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{provider.price}</span>
                      <span className="text-xs text-gray-400">{provider.priceUnit}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 mb-3 flex items-center gap-1">
                    <span className="w-3 h-3 flex items-center justify-center"><i className="ri-calendar-check-line text-gray-400"></i></span>
                    {provider.eventsHosted}+ events hosted
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${provider.phone}`}
                      className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span className="w-3 h-3 flex items-center justify-center"><i className="ri-phone-fill text-xs"></i></span>
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${provider.whatsApp.replace(/\D/g, '')}?text=Hi, I found you on Mabidha and I would like to book your services.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba58] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span className="w-3 h-3 flex items-center justify-center"><i className="ri-whatsapp-fill text-xs"></i></span>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Banner */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: 'ri-shield-check-line', color: 'text-emerald-600 bg-emerald-50', title: 'All Providers Verified', desc: 'Every provider is physically verified by Mabidha before listing.' },
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

          {/* Register CTA */}
          <div className="mt-8 bg-gradient-to-r from-rose-600 to-rose-500 rounded-2xl p-6 md:p-8 text-white text-center">
            <h3 className="font-bold text-xl mb-2">Are You an Entertainment Provider?</h3>
            <p className="text-rose-100 text-sm max-w-md mx-auto mb-5">
              List your entertainment services on Mabidha and get discovered by thousands of event organizers across Kenya.
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
