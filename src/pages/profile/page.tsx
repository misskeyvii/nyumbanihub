import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import { supabase } from '../../lib/supabase';

type Favorite = {
  id: string;
  listing_id: string;
  listings: { id: string; title: string; images: string[]; price: string; county: string; area: string } | null;
};

const SERVICE_TYPES = ['service', 'entertainment'];

export default function ProfilePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingWork, setUploadingWork] = useState(false);
  const [workCaption, setWorkCaption] = useState('');
  const [workFile, setWorkFile] = useState<File | null>(null);
  const [workPreview, setWorkPreview] = useState<string | null>(null);
  const [testimonial, setTestimonial] = useState('');
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState(false);
  const [profileTab, setProfileTab] = useState<'listings' | 'favorites' | 'request'>('listings');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [removingFavId, setRemovingFavId] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({ business_name: '', account_type: '', phone: '', county: '', message: '' });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [searchParams] = useSearchParams();
  const isNewUser = searchParams.get('new') === 'true';
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || '';
  const isNormalUser = userRole === 'user';

  const [displayName, setDisplayName] = useState(localStorage.getItem('userName') || 'User');
  const [displayPhone, setDisplayPhone] = useState(localStorage.getItem('userPhone') || '');
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const userName = displayName;
  const userPhone = displayPhone;
  const accountType = localStorage.getItem('accountType') || '';
  const isServiceProvider = SERVICE_TYPES.includes(accountType);
  const isMarketer = userRole === 'marketer';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/signin'); return; }
      const promises: Promise<any>[] = [
        (async () => {
          const { data } = await supabase.from('users').select('avatar_url, subscription_expires_at, has_notification, notification_message, account_type, extra_account_types').eq('id', session.user.id).single();
          return { data };
        })(),
      ];
      if (isNormalUser) {
        supabase
          .from('favorites')
          .select('id, listing_id, listings(id, title, images, price, county, area)')
          .eq('user_id', session.user.id)
          .then(({ data }) => setFavorites((data as unknown as Favorite[]) || []));
      }
      if (isServiceProvider) {
        promises.push((async () => {
          const { data } = await supabase.from('portfolios').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
          return { data };
        })());
      } else {
        promises.push((async () => {
          const { data } = await supabase.from('listings').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
          return { data };
        })());
      }
      const [{ data: userData }, { data: contentData }] = await Promise.all(promises);
      if (userData?.avatar_url) {
        setAvatarUrl(userData.avatar_url);
        localStorage.setItem('userAvatar', userData.avatar_url);
      }
      if (userData?.subscription_expires_at) {
        setSubscriptionExpiresAt(userData.subscription_expires_at);
      }
      if (userData?.has_notification && userData?.notification_message) {
        setNotification(userData.notification_message);
        // Clear notification after reading
        await supabase.from('users').update({ has_notification: false, notification_message: null }).eq('id', session.user.id);
      }
      // Sync account_type from DB to localStorage so removed types reflect immediately
      if (userData?.account_type !== undefined) {
        localStorage.setItem('accountType', userData.account_type || '');
      }
      if (isServiceProvider) setPortfolio(contentData || []);
      else setListings(contentData || []);
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
    const path = `${session.user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('listings').upload(path, file, { upsert: true });
    if (uploadError) { alert('Upload failed: ' + uploadError.message); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from('listings').getPublicUrl(path);
    const url = urlData.publicUrl;
    const { error: updateError } = await supabase.from('users').update({ avatar_url: url }).eq('id', session.user.id);
    if (updateError) { alert('Save failed: ' + updateError.message); setUploadingAvatar(false); return; }
    setAvatarUrl(url);
    localStorage.setItem('userAvatar', url);
    setUploadingAvatar(false);
  };

  const handleWorkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWorkFile(file);
    setWorkPreview(URL.createObjectURL(file));
  };

  const handlePostWork = async () => {
    if (!workFile) return;
    setUploadingWork(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ext = workFile.name.split('.').pop();
    const path = `portfolio/${session.user.id}/${Date.now()}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('listings').upload(path, workFile, { upsert: true });
    if (uploadError) { setUploadingWork(false); return; }
    const { data: urlData } = supabase.storage.from('listings').getPublicUrl(uploadData.path);
    const { data: inserted } = await supabase.from('portfolios').insert({
      user_id: session.user.id,
      image_url: urlData.publicUrl,
      caption: workCaption || null,
    }).select().single();
    if (inserted) setPortfolio([inserted, ...portfolio]);
    setWorkFile(null);
    setWorkPreview(null);
    setWorkCaption('');
    setUploadingWork(false);
  };

  const handleDeleteWork = async (id: string, imageUrl: string) => {
    if (!confirm('Delete this work photo?')) return;
    const path = imageUrl.split('/listings/')[1];
    if (path) await supabase.storage.from('listings').remove([path]);
    await supabase.from('portfolios').delete().eq('id', id);
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  const handleSubmitTestimonial = async () => {
    if (!testimonial.trim()) return;
    setSubmittingTestimonial(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('testimonials').insert({
      user_id: session.user.id,
      name: userName,
      account_type: accountType,
      subcategory: localStorage.getItem('userSubcategory') || null,
      message: testimonial.trim(),
      avatar_url: avatarUrl || null,
    });
    setTestimonial('');
    setTestimonialSuccess(true);
    setSubmittingTestimonial(false);
    setTimeout(() => setTestimonialSuccess(false), 4000);
  };

  const handleRemoveFavorite = async (favId: string) => {
    setRemovingFavId(favId);
    await supabase.from('favorites').delete().eq('id', favId);
    setFavorites(favorites.filter(f => f.id !== favId));
    setRemovingFavId(null);
  };

  const handleSubmitRequest = async () => {
    if (!requestForm.business_name || !requestForm.account_type) {
      setRequestError('Business name and account type are required.');
      return;
    }
    setSubmittingRequest(true);
    setRequestError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Block if user already has this exact account_type
    const { data: userData } = await supabase.from('users').select('account_type, extra_account_types').eq('id', session.user.id).single();
    const allTypes = [userData?.account_type, ...(userData?.extra_account_types || [])].filter(Boolean);
    if (allTypes.includes(requestForm.account_type)) {
      setRequestError(`You already have a "${requestForm.account_type}" listing account.`);
      setSubmittingRequest(false);
      return;
    }

    // Block if user already has a pending request for same type
    const { data: existing } = await supabase.from('pending_requests')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('account_type', requestForm.account_type)
      .eq('status', 'pending')
      .maybeSingle();
    if (existing) {
      setRequestError(`You already have a pending request for "${requestForm.account_type}". Please wait while it's being processed.`);
      setSubmittingRequest(false);
      return;
    }

    const { error } = await supabase.from('pending_requests').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_name: userName,
      business_name: requestForm.business_name,
      account_type: requestForm.account_type,
      phone: requestForm.phone || null,
      county: requestForm.county || null,
      message: requestForm.message || null,
      status: 'pending',
    });
    if (error) { setRequestError(error.message); setSubmittingRequest(false); return; }
    setRequestSuccess(true);
    setSubmittingRequest(false);
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

          {/* Approval notification banner */}
          {notification && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full flex-shrink-0">
                <i className="ri-checkbox-circle-fill text-emerald-600"></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-emerald-800 text-sm">Account Approved! 🎉</p>
                <p className="text-emerald-700 text-xs mt-0.5">{notification}</p>
              </div>
              <button onClick={() => setNotification(null)} className="text-emerald-400 hover:text-emerald-600 cursor-pointer flex-shrink-0">
                <i className="ri-close-line"></i>
              </button>
            </div>
          )}

          {/* New user welcome edit form */}
          {isNewUser && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Welcome to Nyumbani Hub! 👋</h2>
                <p className="text-sm text-gray-500 mt-1">Complete your profile to get started.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Full Name *</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder={userName}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phone Number</label>
                <input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  type="tel"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white"
                />
              </div>
              <button
                onClick={async () => {
                  if (!editName.trim()) return;
                  setSavingProfile(true);
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  const { error } = await supabase.from('users').update({
                    name: editName.trim(),
                    phone: editPhone.trim() || null,
                  }).eq('id', session.user.id);
                  if (error) { alert('Save failed: ' + error.message); setSavingProfile(false); return; }
                  localStorage.setItem('userName', editName.trim());
                  if (editPhone) localStorage.setItem('userPhone', editPhone.trim());
                  setSavingProfile(false);
                  setDisplayName(editName.trim());
                  if (editPhone) setDisplayPhone(editPhone.trim());
                  navigate('/profile');
                }}
                disabled={!editName.trim() || savingProfile}
                className={`w-full font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${
                  editName.trim() && !savingProfile ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {savingProfile ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                {subscriptionExpiresAt && (
                  <p className={`text-xs mt-1 font-medium ${
                    new Date(subscriptionExpiresAt) < new Date() ? 'text-rose-500' :
                    new Date(subscriptionExpiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'text-amber-500' :
                    'text-gray-400'
                  }`}>
                    <i className="ri-calendar-line mr-1"></i>
                    {new Date(subscriptionExpiresAt) < new Date() ? 'Expired on ' : 'Subscription expires '}
                    {new Date(subscriptionExpiresAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Tap the camera icon to update your profile photo</p>
              </div>

              {/* Profile completion indicator */}
              {(() => {
                const steps = [
                  { done: !!avatarUrl, label: 'Profile photo' },
                  { done: userName !== 'User' && userName.length > 1, label: 'Full name' },
                  { done: !!userPhone, label: 'Phone number' },
                  { done: !!accountType, label: 'Listing account' },
                ];
                const completed = steps.filter(s => s.done).length;
                const percent = Math.round((completed / steps.length) * 100);
                if (percent === 100) return null;
                return (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold text-gray-500">Profile {percent}% complete</p>
                      <p className="text-xs text-gray-400">{completed}/{steps.length}</p>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {steps.filter(s => !s.done).map(s => (
                        <span key={s.label} className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          + {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => { setShowEditProfile(!showEditProfile); setEditName(userName); setEditPhone(userPhone); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <i className="ri-edit-line text-sm"></i>Edit Profile
                </button>
                {!isServiceProvider && !isMarketer && (
                  <Link to="/post-listing" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5">
                    <i className="ri-add-line text-sm"></i>New Listing
                  </Link>
                )}
                {userRole === 'admin' && (
                  <Link to="/kelly" className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5">
                    <i className="ri-shield-check-line text-sm"></i>Admin Panel
                  </Link>
                )}
                {userRole === 'marketer' && (
                  <Link to="/marketer" className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5">
                    <i className="ri-user-star-line text-sm"></i>My Portal
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          {showEditProfile && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-bold text-gray-900">Edit Profile</h2>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Full Name *</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phone Number</label>
                <input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  type="tel"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!editName.trim()) return;
                    setSavingProfile(true);
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;
                    const { error } = await supabase.from('users').update({
                      name: editName.trim(),
                      phone: editPhone.trim() || null,
                    }).eq('id', session.user.id);
                    if (error) { alert('Save failed: ' + error.message); setSavingProfile(false); return; }
                    localStorage.setItem('userName', editName.trim());
                    if (editPhone) localStorage.setItem('userPhone', editPhone.trim());
                    setSavingProfile(false);
                    setShowEditProfile(false);
                    setDisplayName(editName.trim());
                    if (editPhone) setDisplayPhone(editPhone.trim());
                  }}
                  disabled={!editName.trim() || savingProfile}
                  className={`flex-1 font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${
                    editName.trim() && !savingProfile ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Tab switcher for normal users */}
          {isNormalUser && (
            <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1">
              {(['listings', 'favorites', 'request'] as const).map(t => (
                <button key={t} onClick={() => setProfileTab(t)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer capitalize ${
                    profileTab === t ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {t === 'listings' ? 'My Listings' : t === 'favorites' ? 'Favorites' : 'Request Account'}
                </button>
              ))}
            </div>
          )}

          {/* Favorites tab */}
          {isNormalUser && profileTab === 'favorites' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-lg">Saved Listings</h2>
                <span className="text-sm text-gray-400">{favorites.length} saved</span>
              </div>
              {favorites.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <i className="ri-heart-line text-gray-300 text-3xl mb-3"></i>
                  <p className="text-gray-500 font-medium">No saved listings yet</p>
                  <p className="text-gray-400 text-sm mt-1">Tap the heart icon on any listing to save it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites.map(fav => {
                    const l = fav.listings;
                    if (!l) return null;
                    return (
                      <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex">
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 overflow-hidden">
                          {l.images?.[0] ? (
                            <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><i className="ri-image-line text-gray-300 text-2xl"></i></div>
                          )}
                        </div>
                        <div className="flex-1 p-3 flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-tight">{l.title}</p>
                            {(l.area || l.county) && (
                              <p className="text-xs text-gray-400 mt-0.5"><i className="ri-map-pin-2-line text-emerald-500 mr-1"></i>{[l.area, l.county].filter(Boolean).join(', ')}</p>
                            )}
                            <p className="text-emerald-700 font-bold text-sm mt-0.5">{l.price?.toString().includes('KSh') ? l.price : `KSh ${l.price}`}</p>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/listing/${l.id}`} className="text-xs text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                              <i className="ri-eye-line mr-1"></i>View
                            </Link>
                            <button onClick={() => handleRemoveFavorite(fav.id)} disabled={removingFavId === fav.id} className="text-xs text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50">
                              <i className="ri-heart-line mr-1"></i>Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Request listing account tab */}
          {isNormalUser && profileTab === 'request' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="font-bold text-gray-900">Request a Listing Account</h2>
                <p className="text-xs text-gray-400 mt-1">Submit your details to request a listing account.</p>
              </div>
              {requestSuccess ? (
                <div className="text-center py-8">
                  <i className="ri-checkbox-circle-line text-emerald-500 text-4xl mb-3"></i>
                  <p className="font-semibold text-gray-900">Request Submitted!</p>
                  <p className="text-xs text-gray-400 mt-1">Your request has been received. You'll be notified once it's processed.</p>
                </div>
              ) : (
                <>
                  {requestError && <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{requestError}</p>}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Business / Listing Name *</label>
                      <input value={requestForm.business_name} onChange={e => setRequestForm({ ...requestForm, business_name: e.target.value })} placeholder="e.g. Sunrise Apartments" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Account Type *</label>
                      <select value={requestForm.account_type} onChange={e => setRequestForm({ ...requestForm, account_type: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                        <option value="">Select type</option>
                        {['landlord', 'airbnb', 'hotel', 'shop', 'marketplace', 'service', 'entertainment'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phone Number</label>
                      <input value={requestForm.phone} onChange={e => setRequestForm({ ...requestForm, phone: e.target.value })} type="tel" placeholder="+254 7XX XXX XXX" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">County</label>
                      <input value={requestForm.county} onChange={e => setRequestForm({ ...requestForm, county: e.target.value })} placeholder="e.g. Nairobi" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Additional Info</label>
                      <textarea value={requestForm.message} onChange={e => setRequestForm({ ...requestForm, message: e.target.value })} placeholder="Tell us more about your business..." rows={3} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 resize-none" />
                    </div>
                  </div>
                  <button onClick={handleSubmitRequest} disabled={submittingRequest} className={`w-full font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${submittingRequest ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}>
                    {submittingRequest ? 'Submitting...' : 'Submit Request'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Portfolio — service/entertainment users */}
          {isServiceProvider && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-lg">My Work</h2>
                <span className="text-sm text-gray-400">{portfolio.length} photos</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500">Post a work photo</p>
                {workPreview ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video">
                    <img src={workPreview} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => { setWorkFile(null); setWorkPreview(null); }} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 rounded-full text-white cursor-pointer">
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center hover:border-emerald-400 transition-colors cursor-pointer">
                    <i className="ri-image-add-line text-gray-400 text-2xl mb-1"></i>
                    <p className="text-xs text-gray-400">Tap to choose a photo</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleWorkFileSelect} />
                  </label>
                )}
                <input value={workCaption} onChange={e => setWorkCaption(e.target.value)} placeholder="Add a caption (optional)" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                <button onClick={handlePostWork} disabled={!workFile || uploadingWork} className={`w-full font-bold text-sm py-2.5 rounded-xl transition-colors whitespace-nowrap ${!workFile || uploadingWork ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}>
                  {uploadingWork ? 'Uploading...' : 'Post Work Photo'}
                </button>
              </div>
              {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : portfolio.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                    <i className="ri-image-line text-gray-400 text-2xl"></i>
                  </div>
                  <p className="text-gray-500 font-medium">No work photos yet</p>
                  <p className="text-gray-400 text-sm mt-1">Upload photos of your past work to attract clients</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map(p => (
                    <div key={p.id} className="relative rounded-2xl overflow-hidden aspect-square bg-gray-100 group">
                      <img src={p.image_url} alt={p.caption || ''} className="w-full h-full object-cover" />
                      {p.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                          <p className="text-white text-[10px] truncate">{p.caption}</p>
                        </div>
                      )}
                      <button onClick={() => handleDeleteWork(p.id, p.image_url)} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <i className="ri-delete-bin-line text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Listings — non-service users */}
          {!isServiceProvider && (!isNormalUser || profileTab === 'listings') && (
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
                  {!isMarketer && (
                    <Link to="/post-listing" className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                      Post a Listing
                    </Link>
                  )}
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
                            <Link to={`/edit-listing/${listing.id}`} className="text-xs text-sky-600 border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-colors whitespace-nowrap">
                              <i className="ri-edit-line mr-1"></i>Edit
                            </Link>
                            <button onClick={() => handleDelete(listing.id)} disabled={deletingId === listing.id} className="text-xs text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">
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
          )}

          {/* Testimonial — all users */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500">Share your experience on Nyumbani Hub</p>
            {testimonialSuccess && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <i className="ri-checkbox-circle-line mr-1"></i>Testimonial submitted — it will appear on the home page!
              </p>
            )}
            <textarea
              value={testimonial}
              onChange={e => { if (e.target.value.length <= 300) setTestimonial(e.target.value); }}
              placeholder={isServiceProvider ? 'Tell clients about your experience offering services on Nyumbani Hub...' : 'Tell others how Nyumbani Hub has helped you market your products or listings...'}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{testimonial.length}/300</span>
              <button
                onClick={handleSubmitTestimonial}
                disabled={!testimonial.trim() || submittingTestimonial}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${!testimonial.trim() || submittingTestimonial ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}
              >
                {submittingTestimonial ? 'Submitting...' : 'Submit Testimonial'}
              </button>
            </div>
          </div>

        </div>
      </main>
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}

