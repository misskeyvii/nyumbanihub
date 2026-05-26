import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../../../components/base/ListingCard';
import { supabase } from '../../../lib/supabase';

export default function FeaturedListings() {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('listings').select('*').eq('status', 'live').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setListings(data || []));

    const channel = supabase
      .channel('featured-changes')
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'listings' }, payload => {
        setListings(prev => prev.filter(l => l.id !== payload.old.id));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'listings' }, payload => {
        if (payload.new.status !== 'live') setListings(prev => prev.filter(l => l.id !== payload.new.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (listings.length === 0) return null;
  // feature products 

  const featured = listings[0];
  const rest = listings.slice(1, 5);
  const image = featured.images?.[0] || '';
  const location = [featured.area, featured.county].filter(Boolean).join(', ');
  const price = featured.price?.toString().includes('KSh') ? featured.price : `KSh ${featured.price}`;

  return (
    <section className="py-14 px-4 md:px-6 bg-white" id="featured">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Latest Listings</h2>
            <p className="text-gray-500 text-sm mt-1">{listings.length} verified listings live on Nyumbani Hub</p>
          </div>
          <Link to="/explore" className="hidden sm:inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">
            See All <i className="ri-arrow-right-line text-sm"></i>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Big Featured Card */}
          <Link to={`/listing/${featured.id}`} className="md:col-span-2 lg:col-span-1 group block">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-200 transition-all duration-300 h-full cursor-pointer">
              <div className="relative w-full h-56 md:h-72 overflow-hidden bg-gray-100">
                {image && <img src={image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-lg leading-tight">{featured.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 text-white/80">
                      <i className="ri-map-pin-2-line text-xs text-emerald-300"></i>
                      <span className="text-xs">{location}</span>
                    </div>
                    <span className="text-emerald-300 font-bold text-sm">{price}</span>
                  </div>
                </div>
              </div>
              {featured.description && (
                <div className="p-4">
                  <p className="text-gray-600 text-sm line-clamp-2">{featured.description}</p>
                </div>
              )}
            </div>
          </Link>

          {/* Smaller Cards */}
          <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-3 md:gap-4">
            {rest.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-5 py-2.5 rounded-xl transition-colors font-medium whitespace-nowrap">
            See All Listings <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
