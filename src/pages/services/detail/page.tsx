import { useParams, Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import MobileBottomNav from '../../../components/feature/MobileBottomNav';
import Footer from '../../../components/feature/Footer';
import VerifiedBadge from '../../../components/base/VerifiedBadge';
import { getProvidersByType, serviceTypeInfo } from '../../../mocks/services';

export default function ServiceDetailPage() {
  const { type } = useParams<{ type: string }>();
  const info = serviceTypeInfo[type || ''];
  const providers = getProvidersByType(type as Parameters<typeof getProvidersByType>[0]);

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
          {providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {providers.map((provider) => (
                <div key={provider.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-emerald-200 transition-all group">
                  <div className="relative">
                    <div className="w-full h-48 overflow-hidden bg-gray-100">
                      <img
                        src={provider.image}
                        alt={provider.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {provider.verified && (
                      <div className="absolute top-3 left-3">
                        <VerifiedBadge type="inspected" size="sm" />
                      </div>
                    )}
                    {provider.available && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Available
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{provider.title}</h3>
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 flex items-center justify-center"><i className="ri-map-pin-2-line text-emerald-500"></i></span>
                      {provider.location}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{provider.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {provider.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                      ))}
                    </div>

                    {/* Rating & Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 flex items-center justify-center"><i className="ri-star-fill text-amber-400 text-xs"></i></span>
                        <span className="text-xs font-bold text-gray-800">{provider.rating}</span>
                        <span className="text-xs text-gray-400">({provider.reviews})</span>
                        <span className="text-xs text-gray-400 ml-1">• {provider.yearsExperience} yrs exp</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{provider.price}</span>
                        <span className="text-xs text-gray-400">{provider.priceUnit}</span>
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${provider.phone}`}
                        className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span className="w-3 h-3 flex items-center justify-center"><i className="ri-phone-fill text-xs"></i></span>
                        Call Now
                      </a>
                      <a
                        href={`https://wa.me/${provider.whatsApp.replace(/\D/g, '')}?text=Hi ${provider.name}, I found you on Mabidha and I need your services.`}
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
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 flex items-center justify-center bg-emerald-50 rounded-full mx-auto mb-4">
                <i className="ri-user-search-line text-emerald-400 text-2xl"></i>
              </div>
              <p className="text-gray-600 font-semibold">No providers listed yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first {info.label} provider on Mabidha!</p>
              <Link to="/signin" className="inline-block mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                Register as Provider
              </Link>
            </div>
          )}

          {/* Register CTA */}
          <div className="mt-12 bg-emerald-700 rounded-2xl p-6 md:p-8 text-white text-center">
            <h3 className="font-bold text-xl mb-2">Are You a {info.label} Provider?</h3>
            <p className="text-emerald-100 text-sm max-w-md mx-auto mb-5">
              Get listed on Mabidha, pass our physical verification, and connect with thousands of Kenyans who need your services.
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
