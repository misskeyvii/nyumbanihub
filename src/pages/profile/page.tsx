import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName') || 'User';
  const userPhone = localStorage.getItem('userPhone') || '';
  const accountType = localStorage.getItem('accountType') || '';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/signin'); return; }
      const [{ data: listingsData }, { data: userData }] = await Promise.all([
        supabase.from('listings').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('users').select('avatar_url').eq('id', session.user.id).single(),
      ]);
      setListings(listingsData || []);
      if (userData?.avatar_url) {
        setAvatarUrl(userData.avatar_url);
        localStorage.setItem('userAvatar', userData.avatar_url);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ext = file.name.split('.').pop();
    const path = `avatars/${session.user.id}.${ext}`;
    await supabase.storage.from('listings').upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from('listings').getPublicUrl(path);
    const url = urlData.publicUrl;
    await supabase.from('users').update({ avatar_url: url }).eq('id', session.user.id);
    setAvatarUrl(url);
    localStorage.setItem('userAvatar', url);
    setUploadingAvatar(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setDeletingId(id);
    const listing = listings.find(l => l.id === id);
    if (listing?.images?.length) {
      const paths = listing.images.map((url: string) => url.split('/listings/')[1]).filter(Boolean);
      if (paths.length) await supabase.storage.from('listings').remove(paths);
    }
    await supabase.from('listings').delete().eq('id', id);
    setListings(listings.filter(l => l.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16 px-4 md:px-6 pb-16">
        <div className="max-w-3xl mx-auto py-8 space-y-6">

          {/* Profile Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald-100 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-700 font-bold text-2xl">{initials}</span>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center bg-emerald-600 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors">
                  {uploadingAvatar ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <i className="ri-camera-line text-white text-xs"></i>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
              </div>

              <div className="flex-1">
                <h1 className="font-bold text-gray-900 text-xl">{userName}</h1>
                {userPhone && <p className="text-gray-500 text-sm mt-0.5">{userPhone}</p>}
                {accountType && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 capitalize">
                    <i className="ri-verified-badge-fill text-xs"></i>
                    {accountType}
                  </span>
                )}
                <p className="text-xs text-gray-400 mt-1">Tap the camera icon to update your profile photo</p>
              </div>

              <Link
                to="/post-listing"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
              >
                <i className="ri-add-line text-sm"></i>
                New Listing
              </Link>
            </div>
          </div>

          {/* My Listings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">My Listings</h2>
              <span className="text-sm text-gray-400">{listings.length} total</span>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                  <i className="ri-store-line text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-500 font-medium">No listings yet</p>
                <p className="text-gray-400 text-sm mt-1">Post your first listing to get started</p>
                <Link to="/post-listing" className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                  Post a Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => {
                  const image = listing.images?.[0];
                  const location = [listing.area, listing.county].filter(Boolean).join(', ');
                  const price = listing.price?.toString().includes('KSh') ? listing.price : `KSh ${listing.price}`;
                  return (
                    <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col sm:flex-row">
                      <div className="w-full sm:w-36 h-36 sm:h-auto flex-shrink-0 overflow-hidden bg-gray-100">
                        {image ? (
                          <img src={image} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="ri-image-line text-gray-300 text-3xl"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-gray-900 text-sm leading-tight">{listing.title}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${listing.status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {listing.status === 'live' ? 'Live' : listing.status}
                            </span>
                          </div>
                          {location && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <i className="ri-map-pin-2-line text-emerald-500 text-xs"></i>
                              {location}
                            </p>
                          )}
                          <p className="text-emerald-700 font-bold text-sm mt-1">{price}</p>
                          <p className="text-xs text-gray-300 mt-0.5">{new Date(listing.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Link to={`/listing/${listing.id}`} className="text-xs text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap">
                            <i className="ri-eye-line mr-1"></i>View
                          </Link>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            disabled={deletingId === listing.id}
                            className="text-xs text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                          >
                            {deletingId === listing.id ? 'Deleting...' : <><i className="ri-delete-bin-line mr-1"></i>Delete</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
