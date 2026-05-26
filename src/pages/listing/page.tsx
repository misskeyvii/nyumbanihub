import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';

const typeLabel: Record<string, string> = {
  home: 'Home & Rental', apartment: 'Apartment', airbnb: 'Airbnb Stay',
  hotel: 'Hotel / Lodge', shop: 'Shop / Business', service: 'Service Provider',
  marketplace: 'Marketplace',
};

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [ownerAvatar, setOwnerAvatar] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    if (!id) return;
    supabase.from('listings').select('*').eq('id', id).single()
      .then(({ data }) => { setListing(data); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!listing?.user_id) return;
    supabase.from('users').select('avatar_url, name').eq('id', listing.user_id).single()
      .then(({ data }) => {
        if (data?.avatar_url) setOwnerAvatar(data.avatar_url);
        if (data?.name) setOwnerName(data.name);
      });
  }, [listing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Listing not found</p>
          <Link to="/" className="mt-4 inline-block text-emerald-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const images: string[] = listing.images || [];
  const location = [listing.area, listing.county].filter(Boolean).join(', ');
  const price = listing.price?.toString().includes('KSh') ? listing.price : `KSh ${listing.price}`;
  const phone = listing.phone || '';
  const whatsapp = (listing.whatsapp || listing.phone || '').replace('+', '');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/explore" className="hover:text-emerald-600 transition-colors">Explore</Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-600 truncate max-w-[200px]">{listing.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Left: Images + Details */}
            <div className="lg:col-span-2 space-y-5">

              {/* Image Gallery */}
              {images.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-gray-100">
                    <img src={images[activeImage]} alt={listing.title} className="w-full h-full object-cover transition-all duration-300" />
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {activeImage + 1} / {images.length}
                    </div>
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white rounded-full cursor-pointer">
                          <i className="ri-arrow-left-s-line text-gray-800 text-xl"></i>
                        </button>
                        <button onClick={() => setActiveImage((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white rounded-full cursor-pointer">
                          <i className="ri-arrow-right-s-line text-gray-800 text-xl"></i>
                        </button>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button key={idx} onClick={() => setActiveImage(idx)} className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${activeImage === idx ? 'border-emerald-500' : 'border-transparent hover:border-gray-300'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <i className="ri-image-line text-gray-300 text-5xl"></i>
                </div>
              )}

              {/* Title & Info */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {typeLabel[listing.listing_type] || listing.listing_type}
                    </span>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-2 leading-tight">{listing.title}</h1>
                    <div className="flex items-center gap-1 mt-2 text-gray-500">
                      <i className="ri-map-pin-2-line text-sm text-emerald-600"></i>
                      <span className="text-sm">{location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-700">{price}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="font-bold text-gray-900 text-base mb-3">About This Listing</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
                </div>
              )}

              {/* Location */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-base mb-3">Location</h3>
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-map-pin-2-fill text-emerald-600"></i>
                  <span className="text-sm text-gray-700 font-medium">{location}</span>
                </div>
                <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                  {listing.map_url ? (
                    <iframe
                      title="Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={listing.map_url.replace('/maps/', '/maps/embed/').replace('?', '?output=embed&')}
                    ></iframe>
                  ) : (
                    <iframe
                      title="Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72NouZuhvLMux40EQ4VdXcKiw&q=${encodeURIComponent(location + ', Kenya')}`}
                    ></iframe>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Contact Card */}
            <div className="space-y-4">
              <div className="bg-emerald-700 rounded-2xl p-5 text-white sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">
                    <i className="ri-shield-check-fill text-emerald-300 text-lg"></i>
                  </span>
                  <div>
                    <p className="font-bold text-sm">Verified by Mabidha</p>
                    <p className="text-emerald-200 text-xs">Approved listing</p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3 mb-4">
                  <p className="text-2xl font-bold">{price}</p>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-white/10 rounded-xl">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center">
                    {ownerAvatar ? (
                      <img src={ownerAvatar} alt={ownerName} className="w-full h-full object-cover" />
                    ) : (
                      <i className="ri-user-line text-white text-base"></i>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{ownerName || 'Owner'}</p>
                    {phone && <p className="text-emerald-200 text-xs">{phone}</p>}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {phone && (
                    <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 bg-white text-emerald-700 font-semibold text-sm py-3 rounded-xl hover:bg-emerald-50 transition-colors w-full whitespace-nowrap">
                      <i className="ri-phone-fill text-sm"></i>
                      Call Now
                    </a>
                  )}
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp}?text=Hi, I saw your listing "${listing.title}" on Mabidha and I'm interested.`}
                      target="_blank"
                      rel="nofollow noreferrer"
                      className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm py-3 rounded-xl transition-colors w-full whitespace-nowrap"
                    >
                      <i className="ri-whatsapp-line text-sm"></i>
                      WhatsApp
                    </a>
                  )}
                </div>

                <p className="text-emerald-200 text-xs text-center mt-3 leading-relaxed">
                  Connect directly with the owner. No in-app payments.
                </p>
              </div>

              {/* Safety Tips */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <i className="ri-information-line text-amber-500"></i>
                  Safety Tips
                </h4>
                <ul className="space-y-2">
                  {[
                    'Always visit the property in person before paying',
                    'Never send money without seeing the property',
                    'Verify owner ID matches listing details',
                    'Report suspicious behavior to Mabidha',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <i className="ri-shield-check-line text-emerald-500 text-xs mt-0.5 flex-shrink-0"></i>
                      <span className="text-xs text-gray-500 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
