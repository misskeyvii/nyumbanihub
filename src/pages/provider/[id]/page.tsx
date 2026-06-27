import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import MobileBottomNav from '../../../components/feature/MobileBottomNav';
import Footer from '../../../components/feature/Footer';
import VerifiedBadge from '../../../components/base/VerifiedBadge';
import { supabase } from '../../../lib/supabase';

type Provider = {
  id: string;
  name: string;
  business_name: string | null;
  phone: string;
  county: string;
  area: string;
  account_type: string;
  subcategory: string;
  avatar_url: string | null;
  profile_views: number;
};

type PortfolioItem = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      // Increment view count
      await supabase.rpc('increment_profile_views', { p_user_id: id });

      const [{ data: user }, { data: posts }] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, business_name, phone, county, area, account_type, subcategory, avatar_url, profile_views')
          .eq('id', id)
          .in('account_type', ['service', 'entertainment'])
          .eq('is_active', true)
          .single(),
        supabase
          .from('portfolios')
          .select('id, image_url, caption, created_at')
          .eq('user_id', id)
          .order('created_at', { ascending: false }),
      ]);

      setProvider(user ?? null);
      setPortfolio(posts ?? []);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3">
        <p className="text-gray-500 font-medium">Provider not found.</p>
        <Link to="/services" className="text-emerald-600 text-sm hover:underline">Back to Services</Link>
      </div>
    );
  }

  const isEntertainment = provider.account_type === 'entertainment';
  const backPath = isEntertainment ? '/entertainment' : '/services';
  const backLabel = isEntertainment ? 'Entertainment' : 'Services';
  const accentColor = isEntertainment ? 'bg-rose-600' : 'bg-emerald-600';
  const accentLight = isEntertainment ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16">

        {/* Hero / Cover */}
        <div className={`${accentColor} h-32 md:h-44 w-full`}></div>

        <div className="max-w-3xl mx-auto px-4 md:px-6">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 -mt-10 relative p-5 md:p-6 mb-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start">

              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-md -mt-12">
                {provider.avatar_url ? (
                  <img src={provider.avatar_url} alt={provider.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-gray-300">{provider.name?.[0]?.toUpperCase()}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h1 className="font-bold text-gray-900 text-xl leading-tight">{provider.business_name || provider.name}</h1>
                    {provider.subcategory && (
                      <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mt-1 ${accentLight}`}>
                        {provider.subcategory}
                      </span>
                    )}
                  </div>
                  <VerifiedBadge type="inspected" size="sm" />
                </div>

                {(provider.area || provider.county) && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                    <i className="ri-map-pin-2-line text-emerald-500"></i>
                    {[provider.area, provider.county].filter(Boolean).join(', ')}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <i className="ri-eye-line text-gray-400"></i>
                    <span><strong className="text-gray-700">{(provider.profile_views ?? 0).toLocaleString()}</strong> profile views</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <i className="ri-image-line text-gray-400"></i>
                    <span><strong className="text-gray-700">{portfolio.length}</strong> work photos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact buttons */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <a
                href={`tel:${provider.phone}`}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                <i className="ri-phone-fill"></i> Call Now
              </a>
              <a
                href={`https://wa.me/${provider.phone?.replace(/\D/g, '')}?text=Hi ${provider.name}, I found your profile on Nyumbani Hub and I need your services.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba58] text-white font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                <i className="ri-whatsapp-fill"></i> WhatsApp
              </a>
            </div>

            {/* Back link */}
            <div className="mt-4 pt-4 border-t border-gray-50">
              <Link to={backPath} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                <i className="ri-arrow-left-s-line"></i> Back to {backLabel}
              </Link>
            </div>
          </div>

          {/* Work Portfolio */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Work & Previous Events</h2>
              <span className="text-sm text-gray-400">{portfolio.length} photos</span>
            </div>

            {portfolio.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-3">
                  <i className="ri-image-line text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-500 font-medium">No work photos yet</p>
                <p className="text-gray-400 text-sm mt-1">This provider hasn't uploaded work photos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {portfolio.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLightbox(item.image_url)}
                    className="relative rounded-2xl overflow-hidden aspect-square bg-gray-100 group cursor-pointer"
                  >
                    <img
                      src={item.image_url}
                      alt={item.caption || 'Work photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-white text-xs truncate">{item.caption}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <i className="ri-zoom-in-line text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"></i>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trust banner */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4 mb-10">
            <div className="w-10 h-10 flex items-center justify-center bg-emerald-600 rounded-xl flex-shrink-0">
              <i className="ri-shield-check-fill text-white text-lg"></i>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Verified Provider</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                This provider has been physically verified by Nyumbani Hub. Their identity, services, and location have been confirmed.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <i className="ri-close-line text-xl"></i>
          </button>
          <img
            src={lightbox}
            alt="Work photo"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
