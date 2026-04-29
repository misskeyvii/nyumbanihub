import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import { kenyaCounties } from '../../mocks/listings';
import { supabase } from '../../lib/supabase';

const accountTypeMap: Record<string, string[]> = {
  landlord: ['home', 'apartment'],
  airbnb: ['airbnb'],
  hotel: ['hotel'],
  shop: ['shop'],
  service: ['service'],
  marketplace: ['marketplace'],
  entertainment: [],
};

const steps = ['Category', 'Details', 'Images', 'Review'];
const listingTypes = [
  { id: 'home', icon: 'ri-home-4-fill', label: 'Home / Rental', desc: 'Bedsitters, single rooms, maisonettes', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'apartment', icon: 'ri-building-4-fill', label: 'Apartment', desc: 'Studio, 1BR, 2BR, 3BR apartments', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { id: 'airbnb', icon: 'ri-hotel-bed-fill', label: 'Airbnb Stay', desc: 'Short-term holiday rentals', color: 'bg-rose-50 border-rose-200 text-rose-600' },
  { id: 'hotel', icon: 'ri-building-2-fill', label: 'Hotel / Lodge', desc: 'Guesthouses, hotels, lodges', color: 'bg-amber-50 border-amber-200 text-amber-600' },
  { id: 'shop', icon: 'ri-store-2-fill', label: 'Shop / Business', desc: 'Retail shops, restaurants, salons', color: 'bg-sky-50 border-sky-200 text-sky-600' },
  { id: 'service', icon: 'ri-customer-service-2-fill', label: 'Service Provider', desc: 'Cleaners, movers, plumbers', color: 'bg-violet-50 border-violet-200 text-violet-600' },
  { id: 'marketplace', icon: 'ri-shopping-bag-3-fill', label: 'Marketplace Product', desc: 'Physical shop products', color: 'bg-orange-50 border-orange-200 text-orange-600' },
];

export default function PostListingPage() {
  const [accountType, setAccountType] = useState(localStorage.getItem('accountType') ?? '');
  const [extraAccountTypes, setExtraAccountTypes] = useState<string[]>([]);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') ?? '');
  const [userPhone, setUserPhone] = useState(localStorage.getItem('userPhone') ?? '');
  const [userCounty, setUserCounty] = useState(localStorage.getItem('userCounty') ?? '');
  const [authChecked, setAuthChecked] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAuthChecked(true); return; }
      const { data } = await supabase
        .from('users')
        .select('account_type, extra_account_types, role, phone, county, name, subscription_expires_at')
        .eq('id', session.user.id)
        .single();
      if (data) {
        const at = data.account_type ?? '';
        const extraTypes = data.extra_account_types || [];
        const role = data.role ?? '';
        setAccountType(at);
        setExtraAccountTypes(extraTypes);
        setUserRole(role);
        setUserPhone(data.phone ?? '');
        setUserCounty(data.county ?? '');
        localStorage.setItem('accountType', at);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userPhone', data.phone ?? '');
        localStorage.setItem('userCounty', data.county ?? '');
        localStorage.setItem('userName', data.name ?? '');
        if (data.subscription_expires_at && new Date(data.subscription_expires_at) < new Date()) {
          setIsExpired(true);
        }
      }
      setAuthChecked(true);
    });
  }, []);

  // Combine all allowed listing types from primary + extra account types
  const allAccountTypes = [accountType, ...extraAccountTypes].filter(Boolean);
  const allowedTypes = allAccountTypes.length > 0
    ? allAccountTypes.flatMap(at => accountTypeMap[at] ?? [])
    : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [form, setForm] = useState({ title: '', county: '', area: '', price: '', description: '', phone: '', whatsapp: '', map_url: '' });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update form defaults when user data loads
  useEffect(() => {
    setForm(f => ({ ...f, county: userCounty, phone: userPhone, whatsapp: userPhone }));
  }, [userCounty, userPhone]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <main className="pt-16 px-4 pb-16 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 flex items-center justify-center bg-amber-100 rounded-full mx-auto mb-4">
              <i className="ri-time-line text-amber-500 text-2xl"></i>
            </div>
            <p className="font-bold text-gray-900">Subscription Expired</p>
            <p className="text-gray-400 text-sm mt-1">Your subscription has expired. Please renew to continue posting listings.</p>
            <Link to="/profile" className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Go to Profile
            </Link>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  if (allAccountTypes.every(t => ['service', 'entertainment'].includes(t)) && allAccountTypes.length > 0 || userRole === 'marketer') {
    const isMarketer = userRole === 'marketer';
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <main className="pt-16 px-4 pb-16 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
              <i className="ri-forbid-line text-gray-400 text-2xl"></i>
            </div>
            <p className="font-bold text-gray-900">{isMarketer ? 'Not available for marketers' : 'Listings not available'}</p>
            <p className="text-gray-400 text-sm mt-1">
              {isMarketer
                ? 'Your role is to market and add users. Head to your portal.'
                : 'Service and entertainment providers post work photos from their profile.'}
            </p>
            <Link
              to={isMarketer ? '/marketer' : '/profile'}
              className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              {isMarketer ? 'Go to My Portal' : 'Go to Profile'}
            </Link>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
    const newImages = [...images, ...valid].slice(0, 10);
    setImages(newImages);
    setPreviews(newImages.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (i: number) => {
    const updated = images.filter((_, idx) => idx !== i);
    setImages(updated);
    setPreviews(updated.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setError('You must be signed in to post.'); setSubmitting(false); return; }

    // Upload images
    const imageUrls: string[] = [];
    for (const file of images) {
      const ext = file.name.split('.').pop();
      const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('listings').upload(path, file, { upsert: true });
      if (uploadError) { setError('Upload failed: ' + uploadError.message); setSubmitting(false); return; }
      const { data: urlData } = supabase.storage.from('listings').getPublicUrl(uploadData.path);
      imageUrls.push(urlData.publicUrl);
    }

    // Save listing
    const { error: insertError } = await supabase.from('listings').insert({
      user_id: session.user.id,
      title: form.title,
      listing_type: selectedType,
      county: form.county,
      area: form.area,
      price: form.price,
      description: form.description,
      phone: form.phone,
      whatsapp: form.whatsapp,
      images: imageUrls,
      map_url: form.map_url || null,
      status: 'live',
    });

    if (insertError) { setError(insertError.message); setSubmitting(false); return; }

    setSubmitting(false);
    navigate('/');
  };

  const canProceed =
    currentStep === 0 ? !!selectedType :
    currentStep === 1 ? !!(form.title && form.county && form.price) :
    currentStep === 2 ? images.length >= 1 : true;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16 px-4 md:px-6 pb-16">
        <div className="max-w-2xl mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Post a Listing</h1>
            <p className="text-gray-500 text-sm mt-1">Fill in your details and your listing goes live immediately.</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i < currentStep ? 'bg-emerald-600 text-white' : i === currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {i < currentStep ? <i className="ri-check-line text-sm"></i> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium whitespace-nowrap ${i === currentStep ? 'text-emerald-600' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 0: Category */}
          {currentStep === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-1">What are you listing?</h2>
              <p className="text-gray-500 text-sm mb-5">Select the type that best matches your listing.</p>
              {!accountType && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs text-amber-700">
                    <i className="ri-information-line mr-1"></i>
                    You need to <Link to="/signin" className="font-semibold underline">sign in</Link> before posting a listing.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listingTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => allowedTypes?.includes(t.id) && setSelectedType(t.id)}
                    disabled={!!allowedTypes && !allowedTypes.includes(t.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      allowedTypes && !allowedTypes.includes(t.id)
                        ? 'bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed'
                        : selectedType === t.id ? t.color + ' border-2 cursor-pointer' : 'bg-gray-50 border-gray-100 hover:border-gray-200 cursor-pointer'
                    }`}
                  >
                    <div className="w-9 h-9 flex items-center justify-center bg-white/60 rounded-xl mb-2">
                      <i className={`${t.icon} text-lg ${selectedType === t.id ? '' : 'text-gray-500'}`}></i>
                    </div>
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-gray-900 text-lg mb-1">Listing Details</h2>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Listing Title *</label>
                <input name="title" value={form.title} onChange={handleChange} type="text" placeholder="e.g. Modern 2BR Apartment in Westlands" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">County *</label>
                  <select name="county" value={form.county} onChange={handleChange} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white">
                    <option value="">Select County</option>
                    {kenyaCounties.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Area / Estate</label>
                  <input name="area" value={form.area} onChange={handleChange} type="text" placeholder="e.g. Westlands" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Price (KSh) *</label>
                <input name="price" value={form.price} onChange={handleChange} type="text" placeholder="e.g. 35000" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => { if (e.target.value.length <= 500) handleChange(e); }}
                  rows={4}
                  placeholder="Describe your listing in detail..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="+254 7XX XXX XXX" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">WhatsApp</label>
                  <input name="whatsapp" value={form.whatsapp} onChange={handleChange} type="tel" placeholder="+254 7XX XXX XXX" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                  Google Maps Link <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input name="map_url" value={form.map_url} onChange={handleChange} type="url" placeholder="Paste your Google Maps link here" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white" />
                <p className="text-xs text-gray-400 mt-1">Open Google Maps → find your location → tap Share → Copy link</p>
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-1">Upload Images</h2>
              <p className="text-gray-500 text-sm mb-5">Upload up to 10 photos. Max 5MB each.</p>
              <label className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer group flex flex-col items-center">
                <div className="w-14 h-14 flex items-center justify-center bg-gray-100 group-hover:bg-emerald-50 rounded-2xl mb-4 transition-colors">
                  <i className="ri-image-add-line text-gray-400 group-hover:text-emerald-500 text-2xl transition-colors"></i>
                </div>
                <p className="font-semibold text-gray-700 text-sm">Tap to choose photos</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — Max 5MB each</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              </label>
              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/50 rounded-full text-white cursor-pointer">
                        <i className="ri-close-line text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3 text-center">{images.length}/10 photos selected</p>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-bold text-gray-900 text-lg">Review & Submit</h2>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-gray-900">{form.title}</p>
                <p className="text-xs text-gray-600">Type: <strong>{listingTypes.find(t => t.id === selectedType)?.label}</strong></p>
                <p className="text-xs text-gray-600">Location: <strong>{[form.area, form.county].filter(Boolean).join(', ')}</strong></p>
                <p className="text-xs text-gray-600">Price: <strong>KSh {form.price}</strong></p>
                <p className="text-xs text-gray-600">Photos: <strong>{images.length}</strong></p>
              </div>

              {/* Image previews on review */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="rounded-xl overflow-hidden aspect-square">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full font-bold text-sm py-3.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${submitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                {submitting ? 'Publishing...' : 'Publish Listing'}
              </button>
              <p className="text-xs text-gray-400 text-center">Your listing goes live immediately after submitting.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            {currentStep > 0 ? (
              <button onClick={() => setCurrentStep(s => s - 1)} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 bg-white px-5 py-2.5 rounded-xl hover:border-gray-300 transition-colors cursor-pointer whitespace-nowrap">
                <span className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-s-line text-base"></i></span>
                Back
              </button>
            ) : <div />}
            {currentStep < steps.length - 1 && (
              <button
                onClick={() => canProceed && setCurrentStep(s => s + 1)}
                disabled={!canProceed}
                className={`flex items-center gap-1.5 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors whitespace-nowrap ${canProceed ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                Continue
                <span className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line text-base"></i></span>
              </button>
            )}
          </div>
        </div>
      </main>
      <div className="h-16 md:hidden"></div>
      <MobileBottomNav />
    </div>
  );
}
