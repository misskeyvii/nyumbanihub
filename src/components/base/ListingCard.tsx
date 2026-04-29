import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface ListingCardProps {
  listing: any;
  promoted?: boolean;
}

const typeLabel: Record<string, string> = {
  home: 'Home', apartment: 'Apartment', airbnb: 'Airbnb',
  hotel: 'Hotel', shop: 'Shop', service: 'Service', marketplace: 'Marketplace',
};

const typeColor: Record<string, string> = {
  home: 'bg-emerald-100 text-emerald-700',
  apartment: 'bg-teal-100 text-teal-700',
  airbnb: 'bg-rose-100 text-rose-600',
  hotel: 'bg-amber-100 text-amber-700',
  shop: 'bg-sky-100 text-sky-700',
  service: 'bg-violet-100 text-violet-700',
  marketplace: 'bg-orange-100 text-orange-700',
};

export default function ListingCard({ listing, promoted = false }: ListingCardProps) {
  const [favId, setFavId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const image = listing.images?.[0] || listing.image || 'https://placehold.co/600x400?text=No+Image';
  const type = listing.listing_type || listing.category || '';
  const location = listing.area ? `${listing.area}, ${listing.county}` : listing.location || listing.county || '';
  const price = listing.price?.toString().includes('KSh') ? listing.price : `KSh ${listing.price}`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const uid = data.session.user.id;
      setUserId(uid);
      supabase.from('favorites').select('id').eq('user_id', uid).eq('listing_id', listing.id).maybeSingle()
        .then(({ data: fav }) => { if (fav) setFavId(fav.id); });
    });
  }, [listing.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    if (favId) {
      await supabase.from('favorites').delete().eq('id', favId);
      setFavId(null);
    } else {
      const { data } = await supabase.from('favorites').insert({ user_id: userId, listing_id: listing.id }).select().single();
      if (data) setFavId(data.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/listing/${listing.id}`;
    if (navigator.share) {
      navigator.share({ title: listing.title, text: `Check out this listing on Nyumbani Hub`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <Link to={`/listing/${listing.id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="relative overflow-hidden w-full h-44 sm:h-48">
          <img src={image} alt={listing.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
          {promoted && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-semibold py-0.5 px-1.5 rounded-full whitespace-nowrap">
                <i className="ri-star-fill text-[11px]"></i> Featured
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className={`text-[10px] font-semibold py-0.5 px-2 rounded-full ${typeColor[type] || 'bg-gray-100 text-gray-600'}`}>
              {typeLabel[type] || type}
            </span>
            <button
              onClick={handleShare}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <i className="ri-share-line text-sm"></i>
            </button>
            {userId && (
              <button
                onClick={toggleFavorite}
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                  favId ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-400 hover:text-rose-500'
                }`}
              >
                <i className={`${favId ? 'ri-heart-fill' : 'ri-heart-line'} text-sm`}></i>
              </button>
            )}
          </div>
        </div>
        <div className="p-3">
          <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {listing.title}
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-gray-500">
            <i className="ri-map-pin-2-line text-xs text-emerald-600"></i>
            <span className="text-xs truncate">{location}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-emerald-700 font-bold text-sm">{price}</span>
            {listing.phone && (
              <span className="text-xs text-gray-400">{listing.phone}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
