import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../../components/base/SEO';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import Footer from '../../components/feature/Footer';
import ListingCard from '../../components/base/ListingCard';
import ListingCardSkeleton from '../../components/base/ListingCardSkeleton';
import { supabase } from '../../lib/supabase';
import { countyFromSlug, kenyaCounties, slugifyLocation } from '../../lib/seoLocations';

export default function HouseHuntingPage() {
  const { countySlug } = useParams<{ countySlug: string }>();
  const county = countyFromSlug(countySlug);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!county) {
      setLoading(false);
      return;
    }

    supabase
      .from('listings')
      .select('*')
      .eq('status', 'live')
      .in('listing_type', ['home', 'apartment'])
      .eq('county', county)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setListings(data || []);
        setLoading(false);
      });
  }, [county]);

  const nearbyCounties = useMemo(
    () => kenyaCounties.filter((item) => item !== county).slice(0, 10),
    [county]
  );

  if (!county) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <main className="pt-28 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">County not found</h1>
          <p className="text-sm text-gray-500 mt-2">Browse verified homes across Kenya instead.</p>
          <Link to="/homes" className="inline-block mt-5 bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-xl">
            Browse Homes
          </Link>
        </main>
      </div>
    );
  }

  const title = `Vacant Homes in ${county}`;
  const description = `Find verified vacant homes, bedsitters, studios and apartments for rent in ${county}. Browse scam-free house hunting listings on Nyumbani Link.`;
  const path = `/house-hunting/${slugifyLocation(county)}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${title} | Nyumbani Link`,
    description,
    url: `https://nyumbanilink.com${path}`,
    about: [
      { '@type': 'Thing', name: 'House hunting' },
      { '@type': 'Thing', name: `Vacant homes in ${county}` },
      { '@type': 'Place', name: `${county}, Kenya` },
    ],
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: listings.slice(0, 12).map((listing, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://nyumbanilink.com/listing/${listing.id}`,
        name: listing.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SEO title={title} description={description} path={path} structuredData={structuredData} />
      <Navbar />
      <main className="pt-16">
        <section className="bg-white border-b border-gray-100 px-4 md:px-6 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <Link to="/homes" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                House Hunting Kenya
              </Link>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2">{title}</h1>
              <p className="text-gray-500 text-sm md:text-base mt-3 leading-relaxed">
                Browse verified vacant homes, bedsitters, studios, one-bedroom houses and apartments in {county}. Nyumbani Link helps tenants contact trusted landlords directly and avoid scams.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                <Link to={`/homes?county=${encodeURIComponent(county)}`} className="bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-xl">
                  View Homes in {county}
                </Link>
                <Link to={`/apartments?county=${encodeURIComponent(county)}`} className="bg-gray-100 text-gray-700 text-sm font-bold px-5 py-3 rounded-xl">
                  View Apartments
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-xl font-bold text-gray-900">Available Rentals in {county}</h2>
            <span className="text-sm text-gray-500">{listings.length} found</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, index) => <ListingCardSkeleton key={index} />)}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
              <p className="font-bold text-gray-900">No vacant homes listed in {county} yet</p>
              <p className="text-sm text-gray-500 mt-2">Check the main listings page or come back soon as new verified rentals are added.</p>
              <Link to="/homes" className="inline-block mt-5 bg-emerald-600 text-white text-sm font-bold px-5 py-3 rounded-xl">
                Browse All Homes
              </Link>
            </div>
          )}
        </section>

        <section className="bg-white border-t border-gray-100 px-4 md:px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-3">House Hunting in Other Counties</h2>
            <div className="flex flex-wrap gap-2">
              {nearbyCounties.map((item) => (
                <Link key={item} to={`/house-hunting/${slugifyLocation(item)}`} className="text-sm bg-gray-50 border border-gray-200 hover:border-emerald-400 hover:text-emerald-700 px-3 py-2 rounded-xl">
                  Vacant homes in {item}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
