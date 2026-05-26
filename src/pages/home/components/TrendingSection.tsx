import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../../../components/base/ListingCard';
import { supabase } from '../../../lib/supabase';

export default function TrendingSection() {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('listings').select('*').eq('status', 'live').order('created_at', { ascending: false }).limit(8)
      .then(({ data }) => setListings(data || []));

    const channel = supabase
      .channel('trending-changes')
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

  return (
    <section className="py-14 px-4 md:px-6 bg-white" id="trending">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Recent Listings</h2>
            <p className="text-gray-500 text-sm mt-1">Latest verified listings across Kenya</p>
          </div>
          <Link to="/explore" className="hidden sm:flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors whitespace-nowrap">
            View All <i className="ri-arrow-right-line text-sm"></i>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-5 py-2.5 rounded-xl transition-colors font-medium whitespace-nowrap">
            View All Listings <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
