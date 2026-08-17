import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import { supabase } from '../../lib/supabase';
import { getSubscriptionExpiry, accountTypeToListingTypes, parseSubscriptionDetails } from '../../lib/subscription';
import { serviceSubcategories, entertainmentSubcategories } from '../../lib/subcategories';
import { checkPosEligibility } from '../../lib/posAccess';

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
  const REQUEST_ACCOUNT_TYPES = ['landlord', 'airbnb', 'hotel', 'shop', 'marketplace', 'service', 'entertainment'];
  const [requestForm, setRequestForm] = useState({ business_name: '', account_type: '', phone: '', county: '', message: '', subcategory: '', lister_type: '' });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [pendingRequests, setPendingRequests] = useState<{ id: string; account_type: string; subcategory?: string; status: string; created_at: string }[]>([]);
  const [showRenew, setShowRenew] = useState(false);
  const [renewStep, setRenewStep] = useState<'account' | 'months' | 'method' | 'mpesa' | 'airtel' | 'pesapal' | 'waiting'>('account');
  const [renewPhone, setRenewPhone] = useState('');
  const [renewing, setRenewing] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState(false);
  const [renewAccountType, setRenewAccountType] = useState('');
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewError, setRenewError] = useState('');
  const [renewalId, setRenewalId] = useState<string | null>(null);
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<'mpesa' | 'airtel' | 'pesapal'>('mpesa');
  const [pesapalTrackingId, setPesapalTrackingId] = useState<string | null>(null);
  const [approvedTypes, setApprovedTypes] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const isNewUser = searchParams.get('new') === 'true';
  const renewalFromCallback = searchParams.get('renewal');
  const trackingFromCallback = searchParams.get('OrderTrackingId');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccountType, setDeletingAccountType] = useState<string | null>(null);
  const [isDeletingAccountType, setIsDeletingAccountType] = useState(false);
  const [reactivatingType, setReactivatingType] = useState<string | null>(null);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || '';
  const isNormalUser = userRole === 'user';

  const [businessName, setBusinessName] = useState('');
  const [businessAvatarUrl, setBusinessAvatarUrl] = useState<string | null>(null);
  const [editBusinessName, setEditBusinessName] = useState('');
  const [uploadingBusinessAvatar, setUploadingBusinessAvatar] = useState(false);
  const [savingBusinessProfile, setSavingBusinessProfile] = useState(false);
  const [showEditBusinessProfile, setShowEditBusinessProfile] = useState(false);
  const [businessProfileSaved, setBusinessProfileSaved] = useState(false);
  const [displayName, setDisplayName] = useState(localStorage.getItem('userName') || 'User');
  const [displayPhone, setDisplayPhone] = useState(localStorage.getItem('userPhone') || '');
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<Record<string, unknown>>({});
  const [primaryAccountType, setPrimaryAccountType] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const userName = displayName;
  const userPhone = displayPhone;
  const isServiceProvider = approvedTypes.length > 0
    ? approvedTypes.some(t => SERVICE_TYPES.includes(t))
    : SERVICE_TYPES.includes(primaryAccountType);
  const canRenew = approvedTypes.length > 0 || !!primaryAccountType;
  const isMarketer = userRole === 'marketer';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const pendingOnly = pendingRequests.filter(r => r.status === 'pending');
  const approvedHistoryTypes = Array.from(new Set(
    pendingRequests.filter(r => r.status === 'approved').map(r => r.account_type)
  ));
  const reactivatableTypes = Array.from(new Set([
    ...Object.keys(subscriptionDetails),
    ...approvedHistoryTypes,
  ])).filter(t => !approvedTypes.includes(t));

  const getExpiryForType = (type: string) =>
    getSubscriptionExpiry(subscriptionDetails, type, type === primaryAccountType ? subscriptionExpiresAt : null);

  const refreshSubscriptionData = async (userId: string) => {
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_expires_at, subscription_details, account_type, extra_account_types, has_notification, notification_message')
      .eq('id', userId)
      .single();

    if (!userData) return;

    setSubscriptionExpiresAt(userData.subscription_expires_at ?? null);
    setSubscriptionDetails(parseSubscriptionDetails(userData.subscription_details) ?? {});
    setPrimaryAccountType(userData.account_type || '');
    if (userData.has_notification && userData.notification_message) setNotification(userData.notification_message);
    if (userData.account_type !== undefined) localStorage.setItem('accountType', userData.account_type || '');

    const types = [userData.account_type, ...(userData.extra_account_types || [])].filter(Boolean) as string[];
    setApprovedTypes(types);
  };

  useEffect(() => {
    if (renewStep !== 'waiting' || !renewalId) return;

    let attempts = 0;
    const maxAttempts = 40;

    const poll = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      attempts += 1;

      const { data: statusData, error: statusError } = await supabase.functions.invoke(
        renewPaymentMethod === 'pesapal' ? 'pesapal-status' : 'check-renewal-payment',
        {
          body: renewPaymentMethod === 'pesapal'
            ? { renewal_id: renewalId, user_id: session.user.id, order_tracking_id: pesapalTrackingId }
            : { renewal_id: renewalId, user_id: session.user.id },
        }
      );

      if (!statusError && statusData?.status === 'paid') {
        await refreshSubscriptionData(session.user.id);
        setRenewSuccess(true);
        return true;
      }

      if (!statusError && statusData?.status === 'failed') {
        setRenewError(statusData.failure_reason || 'Payment failed or was cancelled.');
        setRenewStep(renewPaymentMethod === 'pesapal' ? 'method' : renewPaymentMethod);
        setRenewalId(null);
        return true;
      }

      const { data: renewal } = await supabase
        .from('renewal_requests')
        .select('status, failure_reason')
        .eq('id', renewalId)
        .maybeSingle();

      if (renewal?.status === 'paid') {
        await refreshSubscriptionData(session.user.id);
        setRenewSuccess(true);
        return true;
      }

      if (renewal?.status === 'failed') {
        setRenewError(renewal.failure_reason || 'Payment failed or was cancelled.');
        setRenewStep(renewPaymentMethod);
        setRenewalId(null);
        return true;
      }

      if (attempts >= maxAttempts) {
        setRenewError('Payment is taking longer than expected. If you completed payment, refresh your profile in a minute.');
      }

      return false;
    };

    const interval = window.setInterval(async () => {
      const done = await poll();
      if (done) window.clearInterval(interval);
    }, 3000);

    poll();

    return () => window.clearInterval(interval);
  }, [renewStep, renewalId, renewPaymentMethod]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/signin'); return; }
      setSession(session);
      const promises: Promise<any>[] = [
        (async () => {
          const { data } = await supabase.from('users').select('avatar_url, subscription_expires_at, subscription_details, has_notification, notification_message, account_type, extra_account_types, business_name, business_avatar_url').eq('id', session.user.id).single();
          return { data };
        })(),
        (async () => {
          const { data } = await supabase.from('pending_requests').select('id, account_type, subcategory, status, created_at').eq('user_id', session.user.id).order('created_at', { ascending: false });
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

      const [{ data: userData }, { data: pendingData }] = await Promise.all(promises);

      if (pendingData) setPendingRequests(pendingData);
      if (userData?.avatar_url) {
        setAvatarUrl(userData.avatar_url);
        localStorage.setItem('userAvatar', userData.avatar_url);
      }
      if (userData?.business_name) setBusinessName(userData.business_name);
      if (userData?.business_avatar_url) setBusinessAvatarUrl(userData.business_avatar_url);
      if (userData?.business_name) setBusinessName(userData.business_name);
      if (userData?.business_avatar_url) setBusinessAvatarUrl(userData.business_avatar_url);
      if (userData?.subscription_expires_at !== undefined) {
        setSubscriptionExpiresAt(userData.subscription_expires_at ?? null);
      }
      setSubscriptionDetails(parseSubscriptionDetails(userData?.subscription_details) ?? {});
      setPrimaryAccountType(userData?.account_type || '');
      if (userData?.has_notification && userData?.notification_message) {
        setNotification(userData.notification_message);
        await supabase.from('users').update({ has_notification: false, notification_message: null }).eq('id', session.user.id);
      }
      if (userData?.account_type !== undefined) {
        localStorage.setItem('accountType', userData.account_type || '');
      }
      const types = [userData?.account_type, ...(userData?.extra_account_types || [])].filter(Boolean) as string[];
      setApprovedTypes(types);
      if (types.length > 0) setRenewAccountType(types[0]);

      // Handle Pesapal callback redirect
      if (renewalFromCallback) {
        setRenewalId(renewalFromCallback);
        if (trackingFromCallback) setPesapalTrackingId(trackingFromCallback);
        setRenewPaymentMethod('pesapal');
        setShowRenew(true);
        setRenewStep('waiting');
      }

      const hasService = types.some(t => SERVICE_TYPES.includes(t));

      // Fetch portfolio if service/entertainment user
      if (hasService) {
        const { data: portfolioData } = await supabase.from('portfolios').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
        setPortfolio(portfolioData || []);
      }

      // Always fetch listings
      const { data: listingsData } = await supabase.from('listings').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      setListings(listingsData || []);

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

  const handleBusinessAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBusinessAvatar(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ext = file.name.split('.').pop();
    const path = `${session.user.id}/business_avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('listings').upload(path, file, { upsert: true });
    if (uploadError) { alert('Upload failed: ' + uploadError.message); setUploadingBusinessAvatar(false); return; }
    const { data: urlData } = supabase.storage.from('listings').getPublicUrl(path);
    const url = urlData.publicUrl;
    await supabase.from('users').update({ business_avatar_url: url }).eq('id', session.user.id);
    setBusinessAvatarUrl(url);
    setUploadingBusinessAvatar(false);
  };

  const handleSaveBusinessProfile = async () => {
    if (!editBusinessName.trim()) return;
    setSavingBusinessProfile(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('users').update({ business_name: editBusinessName.trim() }).eq('id', session.user.id);
    setBusinessName(editBusinessName.trim());
    setShowEditBusinessProfile(false);
    setSavingBusinessProfile(false);
    setBusinessProfileSaved(true);
    setTimeout(() => setBusinessProfileSaved(false), 3000);
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
      account_type: primaryAccountType || approvedTypes[0] || '',
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
      subcategory: requestForm.subcategory || null,
      lister_type: requestForm.lister_type || null,
      phone: requestForm.phone || null,
      county: requestForm.county || null,
      message: requestForm.message || null,
      status: 'pending',
    });
    if (error) { setRequestError(error.message); setSubmittingRequest(false); return; }
    setPendingRequests(prev => [{
      id: crypto.randomUUID(),
      account_type: requestForm.account_type,
      subcategory: requestForm.subcategory || undefined,
      status: 'pending',
      created_at: new Date().toISOString(),
    }, ...prev]);
    setRequestForm({ business_name: '', account_type: '', phone: '', county: '', message: '', subcategory: '', lister_type: '' });
    setRequestSuccess(true);
    setSubmittingRequest(false);
  };

  const handleReactivate = async (type: string) => {
    setReactivatingType(type);
    setRequestError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setReactivatingType(null); return; }

    const expiry = getExpiryForType(type);
    if (expiry && new Date(expiry) < new Date()) {
      setReactivatingType(null);
      setRenewAccountType(type);
      setShowRenew(true);
      setRenewStep('account');
      setRequestError('Subscription expired for this account. Please renew to reactivate.');
      return;
    }

    const { data, error } = await supabase.rpc('reactivate_account_type', {
      p_user_id: session.user.id,
      p_account_type: type,
    });

    if (error) {
      setRequestError(error.message);
      setReactivatingType(null);
      return;
    }

    if (data?.[0]?.success === false) {
      const msg = data[0].message as string;
      if (msg.includes('expired') || msg.includes('renew')) {
        setRenewAccountType(type);
        setShowRenew(true);
        setRenewStep('account');
      }
      setRequestError(msg);
      setReactivatingType(null);
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('account_type, extra_account_types')
      .eq('id', session.user.id)
      .single();
    const types = [userData?.account_type, ...(userData?.extra_account_types || [])].filter(Boolean) as string[];
    setApprovedTypes(types);
    setPrimaryAccountType(userData?.account_type || '');
    if (userData?.account_type !== undefined) {
      localStorage.setItem('accountType', userData.account_type || '');
    }
    setReactivatingType(null);
    setRequestError('');
  };

  const PRICING: Record<string, number> = {
    landlord: 500, airbnb: 500, hotel: 500,
    shop: 800, marketplace: 800,
    service: 400, entertainment: 400,
    // POS Add-on pricing (monthly)
    'shop-pos': 1500, 'landlord-pos': 1500, 'airbnb-pos': 1500, 'hotel-pos': 1500, 'marketplace-pos': 1500,
    'service-pos': 1500, 'entertainment-pos': 1500,
    // POS-only pricing (for users who only want POS)
    'pos-only': 2100,
  };

  const renewAmount = (PRICING[renewAccountType] || 500) * renewMonths;

  const handlePesapalRenew = async () => {
    setRenewing(true);
    setRenewError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setRenewing(false); return; }
    try {
      const { data, error } = await supabase.functions.invoke('pesapal-initiate', {
        body: {
          amount: renewAmount,
          account_type: renewAccountType,
          months: renewMonths,
          user_id: session.user.id,
          user_name: displayName,
          user_email: session.user.email,
        },
      });
      if (error || !data?.redirect_url) {
        setRenewError(error?.message || data?.error || 'Could not start Pesapal payment.');
        setRenewing(false);
        return;
      }
      setRenewalId(data.renewal_id ?? null);
      setPesapalTrackingId(data.order_tracking_id ?? null);
      window.open(data.redirect_url, '_blank');
      setRenewStep('waiting');
    } catch {
      setRenewError('Something went wrong. Please try again.');
    }
    setRenewing(false);
  };

  const handleRenew = async () => {
    if (!renewPhone.trim()) return;
    setRenewing(true);
    setRenewError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setRenewing(false); return; }

    const paymentMethod = renewStep === 'airtel' ? 'airtel' : 'mpesa';
    setRenewPaymentMethod(paymentMethod);

    try {
      const { data, error } = await supabase.functions.invoke(
        paymentMethod === 'mpesa' ? 'mpesa-stk' : 'airtel-stk',
        {
          body: {
            phone: renewPhone.trim(),
            amount: renewAmount,
            account_ref: `${session.user.id.slice(0, 8)}-${renewAccountType}`,
            user_id: session.user.id,
            months: renewMonths,
            account_type: renewAccountType,
            user_name: displayName,
            user_email: session.user.email,
          },
        }
      );

      if (error) {
        setRenewError(error.message || 'Could not start payment. Please try again.');
        setRenewing(false);
        return;
      }

      if (!data?.success) {
        setRenewError(data?.message || 'Payment could not be started. Please try again.');
        setRenewing(false);
        return;
      }

      setRenewalId(data.renewal_id ?? null);
      setRenewStep('waiting');
    } catch {
      setRenewError('Something went wrong. Please try again.');
    }
    setRenewing(false);
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

  const handleDeleteAccountType = async (typeToDelete: string) => {
    setDeletingAccountType(typeToDelete);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccountType = async () => {
    if (!deletingAccountType) return;
    setIsDeletingAccountType(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use RPC to safely delete account type and listings
      const { data, error } = await supabase.rpc('delete_user_account_type', { 
        p_user_id: session.user.id, 
        p_account_type: deletingAccountType 
      });

      if (error) throw error;
      if (data?.[0]?.success === false) {
        throw new Error(data[0].message);
      }

      // Update UI
      const deletedCount = data?.[0]?.deleted_listing_count || 0;
      const newApprovedTypes = approvedTypes.filter(t => t !== deletingAccountType);
      setApprovedTypes(newApprovedTypes);
      const removedListingTypes = accountTypeToListingTypes[deletingAccountType] ?? [deletingAccountType];
      setListings(listings.filter(l => !removedListingTypes.includes(l.listing_type)));
      setPendingRequests(prev => prev.filter(r => !(r.account_type === deletingAccountType && r.status === 'pending')));
      
      // Update primary account if it was deleted
      if (deletingAccountType === primaryAccountType) {
        const newPrimary = newApprovedTypes[0] || '';
        setPrimaryAccountType(newPrimary);
        localStorage.setItem('accountType', newPrimary);
      }

      setShowDeleteConfirm(false);
      setDeletingAccountType(null);
      alert(`Removed "${deletingAccountType}" account. Deleted ${deletedCount} listing(s).`);
    } catch (err) {
      alert(`Failed to remove account type: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsDeletingAccountType(false);
    }
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
                <h2 className="font-bold text-gray-900 text-lg">Welcome to Nyumbani Link! 👋</h2>
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
                {approvedTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {approvedTypes.map(type => (
                      <span key={type} className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">
                        <i className="ri-verified-badge-fill text-xs"></i>
                        {type}
                        <button
                          onClick={() => handleDeleteAccountType(type)}
                          className="text-emerald-500 hover:text-rose-500 cursor-pointer transition-colors ml-0.5"
                        >
                          <i className="ri-close-line text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                ) : primaryAccountType ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 capitalize">
                    <i className="ri-verified-badge-fill text-xs"></i>
                    {primaryAccountType}
                    <button
                      onClick={() => handleDeleteAccountType(primaryAccountType)}
                      className="text-emerald-500 hover:text-rose-500 cursor-pointer transition-colors ml-0.5"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </span>
                ) : null}
                {/* Per-account subscription expiry */}
                {(approvedTypes.length > 0 || primaryAccountType) && (
                  <div className="mt-1 space-y-0.5">
                    {(approvedTypes.length > 0 ? approvedTypes : [primaryAccountType]).map(type => {
                      const expiry = getExpiryForType(type);
                      if (!expiry) {
                        return (
                          <p key={type} className="text-xs font-medium text-amber-600">
                            <i className="ri-calendar-line mr-1"></i>
                            <span className="capitalize font-semibold">{type}</span>: No subscription date - renew to activate
                          </p>
                        );
                      }
                      const expired = new Date(expiry) < new Date();
                      const expiringSoon = !expired && new Date(expiry) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                      return (
                        <p key={type} className={`text-xs font-medium ${
                          expired ? 'text-rose-500' : expiringSoon ? 'text-amber-500' : 'text-gray-400'
                        }`}>
                          <i className="ri-calendar-line mr-1"></i>
                          <span className="capitalize font-semibold">{type}</span>: {expired ? 'Expired ' : 'Expires '}
                          {new Date(expiry).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Tap the camera icon to update your profile photo</p>
                {canRenew && (
                  <button
                    onClick={() => { setShowRenew(true); setRenewStep('account'); setRenewPhone(''); setRenewSuccess(false); setRenewError(''); setRenewMonths(1); setRenewalId(null); if (approvedTypes.length === 1) { setRenewAccountType(approvedTypes[0]); } }}
                    className="mt-2 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-refresh-line text-xs"></i> Renew Account
                  </button>
                )}
              </div>

              {/* Profile completion indicator */}
              {(() => {
                const steps = [
                  { done: !!avatarUrl, label: 'Profile photo' },
                  { done: userName !== 'User' && userName.length > 1, label: 'Full name' },
                  { done: !!userPhone, label: 'Phone number' },
                  { done: approvedTypes.length > 0 || !!primaryAccountType, label: 'Listing account' },
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

          {/* POS Access Card */}
          {(() => {
            const posEligibility = checkPosEligibility(
              primaryAccountType,
              approvedTypes,
              subscriptionExpiresAt,
              subscriptionDetails
            );

            if (posEligibility.canAccess) {
              if (posEligibility.hasSubscription) {
                // User has active POS subscription
                return (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-xl flex-shrink-0">
                        <i className="ri-store-2-line text-emerald-600 text-2xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">Nyumbani Link POS</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          Complete business management system - Active subscription
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3 text-xs">
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Point of Sale</span>
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Inventory Management</span>
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Customer Management</span>
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Reports</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <a
                        href={`https://pos.nyumbanilink.com?email=${encodeURIComponent(session?.user?.email || '')}&redirect=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="ri-external-link-line"></i>
                        Open POS System
                      </a>
                      <button className="bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2">
                        <i className="ri-question-line"></i>
                        Learn More
                      </button>
                    </div>
                  </div>
                );
              } else {
                // User needs to subscribe to POS
                const pricing = posEligibility.pricing || (posEligibility.hasActiveAccount ? 1500 : 2100);
                const pricingText = posEligibility.hasActiveAccount 
                  ? `KSh 1,500/month (Add-on)` 
                  : `KSh 2,100/month (Standalone)`;
                
                return (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl flex-shrink-0">
                        <i className="ri-store-2-line text-gray-600 text-2xl"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">Nyumbani Link POS</h3>
                          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {posEligibility.hasActiveAccount ? 'Add-on' : 'Standalone'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Complete business management system for your business
                          {posEligibility.hasActiveAccount && ` (${posEligibility.accountType} account holder)`}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3 text-xs">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Point of Sale</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Inventory Management</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Customer Management</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Reports</span>
                        </div>
                        {!posEligibility.hasActiveAccount && (
                          <p className="text-amber-600 text-xs mt-2 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1">
                            <i className="ri-information-line mr-1"></i>
                            Includes basic business account access
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button 
                        onClick={() => {
                          // Set POS subscription parameters with new pricing
                          const posAccountType = posEligibility.hasActiveAccount 
                            ? `${posEligibility.accountType}-pos` 
                            : 'pos-only';
                          setRenewAccountType(posAccountType);
                          setShowRenew(true);
                          setRenewStep('account');
                          setRenewMonths(1);
                          setRenewError('');
                          setRenewSuccess(false);
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="ri-vip-crown-line"></i>
                        Subscribe to POS ({pricingText})
                      </button>
                      <button className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <i className="ri-question-line"></i>
                        Learn More
                      </button>
                    </div>
                  </div>
                );
              }
            }

            return null;
          })()}

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
                <p className="text-xs text-gray-400 mt-1">Request a new category, or reactivate one you removed earlier.</p>
              </div>
              {requestSuccess ? (
                <div className="text-center py-8">
                  <i className="ri-checkbox-circle-line text-emerald-500 text-4xl mb-3"></i>
                  <p className="font-semibold text-gray-900">Request Submitted!</p>
                  <p className="text-xs text-gray-400 mt-1">Your request has been received. You'll be notified once it's processed.</p>
                  <button
                    onClick={() => setRequestSuccess(false)}
                    className="mt-4 text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <>
                  {requestError && <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{requestError}</p>}

                  {reactivatableTypes.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-emerald-800 mb-2">Reactivate a previous account</p>
                      <p className="text-[11px] text-emerald-700 mb-3">These were approved before. Reactivate instantly - no admin approval needed.</p>
                      <div className="flex flex-wrap gap-2">
                        {reactivatableTypes.map(type => (
                          <button
                            key={type}
                            onClick={() => handleReactivate(type)}
                            disabled={reactivatingType === type}
                            className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full capitalize hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <i className="ri-refresh-line text-xs"></i>
                            {reactivatingType === type ? 'Reactivating...' : type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {pendingOnly.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-800 mb-2">Waiting for admin approval</p>
                      {pendingOnly.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-xs text-amber-900 py-1">
                          <div className="capitalize">{p.account_type}{p.subcategory ? ` - ${p.subcategory}` : ''}</div>
                          <div className="text-amber-600">{new Date(p.created_at).toLocaleDateString('en-KE')}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500">Request a new account type</p>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Business / Listing Name *</label>
                      <input value={requestForm.business_name} onChange={e => setRequestForm({ ...requestForm, business_name: e.target.value })} placeholder="e.g. Sunrise Apartments" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Account Type *</label>
                      <select value={requestForm.account_type} onChange={e => setRequestForm({ ...requestForm, account_type: e.target.value, subcategory: '', lister_type: '' })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                        <option value="">Select type</option>
                        {REQUEST_ACCOUNT_TYPES.filter(t => !approvedTypes.includes(t) && !reactivatableTypes.includes(t)).map(t => (
                          <option key={t} value={t}>{
                            t === 'landlord' ? 'Landlord / Apartments & Homes' :
                            t === 'airbnb' ? 'Airbnb Stay' :
                            t === 'hotel' ? 'Hotel / Lodge' :
                            t === 'shop' ? 'Shop / Business' :
                            t === 'marketplace' ? 'Marketplace Product' :
                            t === 'service' ? 'Service Provider' :
                            t === 'entertainment' ? 'Entertainment' :
                            t.charAt(0).toUpperCase() + t.slice(1)
                          }</option>
                        ))}
                      </select>
                      {requestForm.account_type === 'landlord' && (
                        <p className="text-[11px] text-emerald-700 mt-1.5 flex items-center gap-1">
                          <i className="ri-information-line"></i>
                          This lets you post both <strong>Apartments</strong> and <strong>Home / Rental</strong> listings.
                        </p>
                      )}
                    </div>
                    {/* Lister type — only for landlord/home/apartment posters */}
                    {(requestForm.account_type === 'landlord' || requestForm.account_type === 'airbnb' || requestForm.account_type === 'hotel') && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">I am a... *</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['landlord', 'agent', 'caretaker'] as const).map(lt => (
                            <button
                              key={lt}
                              type="button"
                              onClick={() => setRequestForm({ ...requestForm, lister_type: lt })}
                              className={`py-2.5 rounded-xl border-2 text-xs font-semibold capitalize transition-all cursor-pointer ${
                                requestForm.lister_type === lt
                                  ? lt === 'agent' ? 'border-sky-500 bg-sky-50 text-sky-700'
                                    : lt === 'caretaker' ? 'border-violet-500 bg-violet-50 text-violet-700'
                                    : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              {lt === 'agent' && <i className="ri-user-star-line block text-base mb-0.5"></i>}
                              {lt === 'landlord' && <i className="ri-home-4-line block text-base mb-0.5"></i>}
                              {lt === 'caretaker' && <i className="ri-key-2-line block text-base mb-0.5"></i>}
                              {lt}
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1.5">
                          {requestForm.lister_type === 'agent' && 'Agents represent multiple properties and may charge a viewing fee.'}
                          {requestForm.lister_type === 'landlord' && 'Landlords own the property directly.'}
                          {requestForm.lister_type === 'caretaker' && 'Caretakers manage a property on behalf of the owner.'}
                          {!requestForm.lister_type && 'This helps renters know who they\'re dealing with.'}
                        </p>
                      </div>
                    )}
                    {requestForm.account_type === 'service' && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Service Type *</label>
                        <select value={requestForm.subcategory} onChange={e => setRequestForm({ ...requestForm, subcategory: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                          <option value="">Select service type</option>
                          {serviceSubcategories.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    {requestForm.account_type === 'entertainment' && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Entertainment Type *</label>
                        <select value={requestForm.subcategory} onChange={e => setRequestForm({ ...requestForm, subcategory: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                          <option value="">Select entertainment type</option>
                          {entertainmentSubcategories.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
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

          {/* Business Profile — service/entertainment users only */}
          {isServiceProvider && (
            <div className="bg-white rounded-2xl border border-emerald-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Business Profile</h2>
                  <p className="text-xs text-gray-400 mt-0.5">This is what clients see on the services page - separate from your personal profile.</p>
                </div>
                <button
                  onClick={() => { setShowEditBusinessProfile(!showEditBusinessProfile); setEditBusinessName(businessName); }}
                  className="text-xs font-semibold text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-1"></i>Edit
                </button>
              </div>

              {businessProfileSaved && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  <i className="ri-checkbox-circle-line mr-1"></i>Business profile updated!
                </p>
              )}

              {/* Business avatar + name preview */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald-100 flex items-center justify-center">
                    {businessAvatarUrl ? (
                      <img src={businessAvatarUrl} alt={businessName || 'Business'} className="w-full h-full object-cover" />
                    ) : (
                      <i className="ri-store-2-line text-emerald-400 text-2xl"></i>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center bg-emerald-600 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors">
                    {uploadingBusinessAvatar ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className="ri-camera-line text-white text-xs"></i>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBusinessAvatarUpload} disabled={uploadingBusinessAvatar} />
                  </label>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{businessName || <span className="text-gray-400 font-normal">No business name set</span>}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tap camera to change business photo</p>
                </div>
              </div>

              {showEditBusinessProfile && (
                <div className="space-y-3 border-t border-gray-100 pt-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Business / Service Name *</label>
                    <input
                      value={editBusinessName}
                      onChange={e => setEditBusinessName(e.target.value)}
                      placeholder="e.g. Amor Gas Delivery, Natty Sounds"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBusinessProfile}
                      disabled={!editBusinessName.trim() || savingBusinessProfile}
                      className={`flex-1 font-bold text-sm py-2.5 rounded-xl transition-colors whitespace-nowrap ${
                        editBusinessName.trim() && !savingBusinessProfile ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {savingBusinessProfile ? 'Saving...' : 'Save Business Name'}
                    </button>
                    <button onClick={() => setShowEditBusinessProfile(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
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

          {/* Listings — non-service users or mixed users */}
          {(!isServiceProvider || approvedTypes.some(t => !SERVICE_TYPES.includes(t))) && (!isNormalUser || profileTab === 'listings') && (
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
            <p className="text-xs font-semibold text-gray-500">Share your experience on Nyumbani Link</p>
            {testimonialSuccess && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <i className="ri-checkbox-circle-line mr-1"></i>Testimonial submitted — it will appear on the home page!
              </p>
            )}
            <textarea
              value={testimonial}
              onChange={e => { if (e.target.value.length <= 300) setTestimonial(e.target.value); }}
              placeholder={isServiceProvider ? 'Tell clients about your experience offering services on Nyumbani Link...' : 'Tell others how Nyumbani Link has helped you market your products or listings...'}
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

      {/* Renew Account Modal */}
      {showRenew && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto">

            {/* SUCCESS */}
            {renewSuccess && (
              <div className="text-center py-4">
                <div className="w-14 h-14 flex items-center justify-center bg-emerald-100 rounded-full mx-auto mb-3">
                  <i className="ri-checkbox-circle-fill text-emerald-600 text-2xl"></i>
                </div>
                <p className="font-bold text-gray-900">Payment Confirmed!</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your {renewAccountType.includes('-pos') ? `POS subscription (${renewAccountType})` : `${renewAccountType} account`} has been renewed. 
                  {renewAccountType.includes('-pos') ? ' You can now access the POS system.' : ' You can post listings again.'}
                </p>
                <button onClick={() => { setShowRenew(false); setRenewSuccess(false); setRenewalId(null); }} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap">Done</button>
              </div>
            )}

            {/* WAITING FOR PIN / PESAPAL */}
            {!renewSuccess && renewStep === 'waiting' && (
              <div className="text-center py-4 space-y-4">
                {renewPaymentMethod === 'pesapal' ? (
                  <>
                    <div className="w-14 h-14 flex items-center justify-center bg-[#1a1a2e]/10 rounded-full mx-auto">
                      <div className="w-8 h-8 border-2 border-[#1a1a2e] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="font-bold text-gray-900">Complete Payment in New Tab</p>
                    <p className="text-sm text-gray-500">A Pesapal payment page has opened in a new tab. Complete your payment there, then come back here.</p>
                    <div className="bg-[#1a1a2e]/10 border border-[#1a1a2e]/20 rounded-xl p-4 text-left space-y-2">
                      <p className="text-xs font-bold text-gray-700">KSh {renewAmount.toLocaleString()} · {renewMonths} month{renewMonths > 1 ? 's' : ''} · {renewAccountType}</p>
                      <p className="text-xs text-gray-400">This page will update automatically once payment is confirmed.</p>
                    </div>
                    <button
                      onClick={handlePesapalRenew}
                      className="w-full text-sm font-semibold text-[#1a1a2e] border border-[#1a1a2e]/30 py-2.5 rounded-xl hover:bg-[#1a1a2e]/5 transition-colors cursor-pointer"
                    >
                      <i className="ri-external-link-line mr-1"></i>Reopen Payment Page
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`w-14 h-14 flex items-center justify-center rounded-full mx-auto ${
                      renewPaymentMethod === 'mpesa' ? 'bg-[#00A550]/10' : 'bg-[#E40000]/10'
                    }`}>
                      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="font-bold text-gray-900">Check Your Phone</p>
                    <p className="text-sm text-gray-500">
                      A {renewPaymentMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} prompt has been sent to{' '}
                      <strong className="text-gray-900">{renewPhone}</strong>.
                    </p>
                    <div className={`rounded-xl p-4 text-left space-y-2 ${
                      renewPaymentMethod === 'mpesa' ? 'bg-[#00A550]/10 border border-[#00A550]/20' : 'bg-[#E40000]/10 border border-[#E40000]/20'
                    }`}>
                      <p className="text-xs font-bold text-gray-700">
                        Pay <span className={renewPaymentMethod === 'mpesa' ? 'text-[#00A550]' : 'text-[#E40000]'}>
                          KSh {renewAmount.toLocaleString()}
                        </span> for {renewMonths} month{renewMonths > 1 ? 's' : ''} · {renewAccountType}
                      </p>
                      <p className="text-xs text-gray-500">Enter your PIN on your phone to complete payment.</p>
                      <p className="text-xs text-gray-400">Waiting for confirmation… this usually takes a few seconds.</p>
                    </div>
                  </>
                )}
                {renewError && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">{renewError}</p>
                )}
                <button
                  onClick={() => { setShowRenew(false); setRenewStep('account'); setRenewalId(null); setRenewError(''); }}
                  className="w-full text-sm text-gray-400 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}

            {!renewSuccess && renewStep !== 'waiting' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renewStep !== 'account' && (
                      <button onClick={() => setRenewStep(renewStep === 'months' ? 'account' : renewStep === 'method' ? 'months' : renewStep === 'mpesa' ? 'method' : renewStep === 'airtel' ? 'method' : renewStep === 'pesapal' ? 'method' : 'account')} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer">
                        <i className="ri-arrow-left-s-line text-gray-600"></i>
                      </button>
                    )}
                    <h2 className="font-bold text-gray-900 text-sm">
                      {renewStep === 'account' && (renewAccountType?.includes('-pos') ? 'POS Subscription' : 'Select Account to Renew')}
                      {renewStep === 'months' && 'How Many Months?'}
                      {renewStep === 'method' && 'Payment Method'}
                      {renewStep === 'mpesa' && 'Pay via M-Pesa'}
                      {renewStep === 'airtel' && 'Pay via Airtel Money'}
                      {renewStep === 'pesapal' && 'Pay via Pesapal'}
                    </h2>
                  </div>
                  <button onClick={() => setShowRenew(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer">
                    <i className="ri-close-line text-gray-500"></i>
                  </button>
                </div>

                {/* STEP 1 — Select account type */}
                {renewStep === 'account' && (
                  <div className="space-y-3">
                    {renewAccountType?.includes('-pos') ? (
                      // POS subscription flow - account type already selected
                      <div className="space-y-3">
                        <p className="text-xs text-gray-400">POS access subscription{renewAccountType.includes('-pos') ? ` (${renewAccountType.replace('-pos', '')} add-on)` : ' (standalone)'}.</p>
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-lg">
                              <i className="ri-store-2-line text-emerald-600 text-xl"></i>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Nyumbani Link POS</p>
                              <p className="text-xs text-gray-600">
                                KSh {(PRICING[renewAccountType] || 1500).toLocaleString()}/month
                                {renewAccountType === 'pos-only' && ' (includes basic business account)'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setRenewStep('months')}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Continue
                        </button>
                      </div>
                    ) : approvedTypes.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No approved accounts found. Request an account first.</p>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400">Select which listing account you want to renew.</p>
                        <div className="space-y-2">
                          {approvedTypes.map(type => (
                            <button
                              key={type}
                              onClick={() => setRenewAccountType(type)}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                                renewAccountType === type ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white hover:border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                                  renewAccountType === type ? 'bg-emerald-100' : 'bg-gray-100'
                                }`}>
                                  <i className={`${
                                    type === 'service' || type === 'entertainment' ? 'ri-customer-service-2-line' :
                                    type === 'shop' || type === 'marketplace' ? 'ri-store-2-line' : 'ri-home-4-line'
                                  } text-sm ${renewAccountType === type ? 'text-emerald-600' : 'text-gray-500'}`}></i>
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-gray-900 capitalize">{type}</p>
                                  <p className="text-xs text-gray-400">KSh {(PRICING[type] || 500).toLocaleString()}/month</p>
                                </div>
                              </div>
                              {renewAccountType === type && <i className="ri-checkbox-circle-fill text-emerald-500 text-lg"></i>}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => renewAccountType && setRenewStep('months')}
                          disabled={!renewAccountType}
                          className={`w-full font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${
                            renewAccountType ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Continue
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* STEP 2 — Select months */}
                {renewStep === 'months' && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-400">Pay for multiple months at once to keep your account active longer.</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[1,2,3,4,5,6,9,12].map(m => (
                        <button
                          key={m}
                          onClick={() => setRenewMonths(m)}
                          className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                            renewMonths === m ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                          }`}
                        >
                          {m}mo
                        </button>
                      ))}
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 capitalize">
                            {renewAccountType.includes('-pos') ? 'POS Subscription' : renewAccountType} × {renewMonths} month{renewMonths > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-400">KSh {(PRICING[renewAccountType] || 500).toLocaleString()} × {renewMonths}</p>
                        </div>
                        <p className="text-2xl font-black text-emerald-700">KSh {renewAmount.toLocaleString()}</p>
                      </div>
                      {renewMonths >= 3 && (
                        <p className="text-xs text-emerald-600 font-semibold mt-2">
                          <i className="ri-shield-check-line mr-1"></i>
                          {renewAccountType.includes('-pos') ? 'POS access' : 'Account'} stays active for {renewMonths} months!
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setRenewStep('method')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Continue — Pay KSh {renewAmount.toLocaleString()}
                    </button>
                  </div>
                )}

                {/* STEP 3 — Choose payment method */}
                {renewStep === 'method' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">Total: <strong className="text-gray-900">KSh {renewAmount.toLocaleString()}</strong> for {renewMonths} month{renewMonths > 1 ? 's' : ''}</p>
                    <button
                      onClick={() => { setRenewStep('mpesa'); setRenewPaymentMethod('mpesa'); setRenewError(''); }}
                      className="w-full flex items-center gap-3 bg-gray-100 text-gray-400 font-bold text-sm px-4 py-4 rounded-xl cursor-not-allowed relative"
                      disabled
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg flex-shrink-0">
                        <img src="https://i.postimg.cc/nrmPqSKD/mpesa-seeklogo.png" alt="M-Pesa" className="w-8 h-auto object-contain opacity-40" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-base">M-Pesa</p>
                        <p className="text-xs text-gray-400">Coming soon</p>
                      </div>
                      <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Soon</span>
                    </button>
                    <button
                      onClick={() => { setRenewStep('airtel'); setRenewPaymentMethod('airtel'); setRenewError(''); }}
                      className="w-full flex items-center gap-3 bg-gray-100 text-gray-400 font-bold text-sm px-4 py-4 rounded-xl cursor-not-allowed relative"
                      disabled
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg flex-shrink-0">
                        <img src="https://i.postimg.cc/VLc73RBp/airtel-money-tanzania-seeklogo.png" alt="Airtel Money" className="w-8 h-auto object-contain opacity-40" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-base">Airtel Money</p>
                        <p className="text-xs text-gray-400">Coming soon</p>
                      </div>
                      <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Soon</span>
                    </button>
                    <button
                      onClick={() => { setRenewStep('pesapal'); setRenewPaymentMethod('pesapal'); setRenewError(''); }}
                      className="w-full flex items-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-bold text-sm px-4 py-4 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg flex-shrink-0">
                        <img src="https://i.postimg.cc/qMVd9KMK/pesapal-logo.png" alt="Pesapal" className="w-8 h-auto object-contain" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-base">Pesapal</p>
                        <p className="text-xs text-gray-500">Card, M-Pesa, Airtel · Secure checkout</p>
                      </div>
                      <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
                    </button>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5"><i className="ri-information-line text-emerald-500"></i> How it works</p>
                      <p className="text-xs text-gray-400">1. Click Pesapal below to open the secure payment page</p>
                      <p className="text-xs text-gray-400">2. Pay via M-Pesa, Airtel or card on Pesapal's page</p>
                      <p className="text-xs text-gray-400">3. Come back here — your account renews automatically</p>
                    </div>
                  </div>
                )}

                {/* STEP 4b — Pesapal redirect */}
                {renewStep === 'pesapal' && (
                  <div className="space-y-4">
                    <div className="bg-[#1a1a2e]/10 border border-[#1a1a2e]/20 rounded-xl p-3">
                      <p className="text-xs font-bold text-gray-700">Amount: <span className="text-[#1a1a2e]">KSh {renewAmount.toLocaleString()}</span></p>
                      <p className="text-xs text-gray-500 mt-0.5">{renewMonths} month{renewMonths > 1 ? 's' : ''} · {renewAccountType} account</p>
                    </div>
                    {renewError && (
                      <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{renewError}</p>
                    )}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5"><i className="ri-information-line text-emerald-500"></i> How Pesapal works</p>
                      <p className="text-xs text-gray-400">1. Click the button below — a new tab opens</p>
                      <p className="text-xs text-gray-400">2. Complete payment on the Pesapal page (card, M-Pesa, etc.)</p>
                      <p className="text-xs text-gray-400">3. Come back here — your account renews automatically</p>
                    </div>
                    <button
                      onClick={handlePesapalRenew}
                      disabled={renewing}
                      className={`w-full font-bold text-sm py-4 rounded-xl transition-all bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 shadow-sm ${renewing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {renewing ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                          Opening Pesapal...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-external-link-line"></i>
                          Pay KSh {renewAmount.toLocaleString()} via Pesapal
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* STEP 4 — Enter phone & trigger STK */}
                {(renewStep === 'mpesa' || renewStep === 'airtel') && (
                  <div className="space-y-4">
                    <div className={`rounded-xl p-3 ${
                      renewStep === 'mpesa' ? 'bg-[#00A550]/10 border border-[#00A550]/20' : 'bg-[#E40000]/10 border border-[#E40000]/20'
                    }`}>
                      <p className="text-xs font-bold text-gray-700">Amount: <span className={renewStep === 'mpesa' ? 'text-[#00A550]' : 'text-[#E40000]'}>KSh {renewAmount.toLocaleString()}</span></p>
                      <p className="text-xs text-gray-500 mt-0.5">{renewMonths} month{renewMonths > 1 ? 's' : ''} · {renewAccountType} account</p>
                    </div>
                    {renewError && (
                      <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{renewError}</p>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                        Your {renewStep === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} Number *
                      </label>
                      <input
                        value={renewPhone}
                        onChange={e => setRenewPhone(e.target.value)}
                        type="tel"
                        placeholder="e.g. 0712345678"
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400"
                      />
                      <p className="text-xs text-gray-400 mt-1">A payment prompt will be sent to this number. Enter your PIN to pay.</p>
                    </div>
                    <button
                      onClick={handleRenew}
                      disabled={!renewPhone.trim() || renewing}
                      className={`w-full font-bold text-sm py-4 rounded-xl transition-all ${
                        renewStep === 'mpesa'
                          ? 'bg-[#00A550] hover:bg-[#008f45] text-white shadow-lg shadow-[#00A550]/30'
                          : 'bg-[#E40000] hover:bg-[#cc0000] text-white shadow-lg shadow-[#E40000]/30'
                      } ${!renewPhone.trim() || renewing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {renewing ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <img
                            src={renewStep === 'mpesa' ? 'https://i.postimg.cc/nrmPqSKD/mpesa-seeklogo.png' : 'https://i.postimg.cc/VLc73RBp/airtel-money-tanzania-seeklogo.png'}
                            alt={renewStep === 'mpesa' ? 'M-Pesa' : 'Airtel Money'}
                            className="w-5 h-5 object-contain flex-shrink-0"
                          />
                          <span>Pay KSh {renewAmount.toLocaleString()} via {renewStep === 'mpesa' ? 'M-Pesa' : 'Airtel Money'}</span>
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Type Confirmation Modal */}
      {showDeleteConfirm && deletingAccountType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 flex items-center justify-center bg-rose-100 rounded-full mx-auto mb-3">
                <i className="ri-alert-line text-rose-600 text-xl"></i>
              </div>
              <h2 className="font-bold text-gray-900 text-base">Remove Account?</h2>
              <p className="text-sm text-gray-500 mt-2">
                All listings posted under your <span className="font-semibold capitalize">{deletingAccountType}</span> account will be permanently deleted. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingAccountType(null);
                }}
                disabled={isDeletingAccountType}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                onClick={confirmDeleteAccountType}
                disabled={isDeletingAccountType}
                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingAccountType ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <i className="ri-delete-bin-line"></i>
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
