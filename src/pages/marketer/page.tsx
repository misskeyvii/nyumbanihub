import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { kenyaCounties } from '../../mocks/listings';

const accountTypes = ['landlord', 'airbnb', 'hotel', 'shop', 'marketplace', 'service', 'entertainment'];
const serviceSubcategories = ['Mama Fua', 'Movers', 'Caretakers', 'Plumbing', 'Electricians', 'Security', 'Landscaping', 'Painting', 'Gas Delivery', 'Dispenser Water'];
const entertainmentSubcategories = ['Sounds & PA', 'Catering', 'DJs', 'MCs'];
const emptyForm = { name: '', email: '', password: '', phone: '', county: '', area: '', account_type: '', subcategory: '', subscription_expires_at: '' };

export default function MarketerPage() {
  const [authChecking, setAuthChecking] = useState(true);
  const [marketerName, setMarketerName] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/signin'); return; }
      const { data: me } = await supabaseAdmin.from('users').select('role, name').eq('id', session.user.id).single();
      if (me?.role !== 'marketer') { navigate('/'); return; }
      setMarketerName(me.name || 'Marketer');
      setAuthChecking(false);
    };
    check();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password || !form.account_type) {
      setError('Name, email, password and account type are required.');
      return;
    }
    setCreating(true);
    setError('');
    setSuccess('');
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (signUpError) { setError(signUpError.message); setCreating(false); return; }
    const userId = data.user?.id;
    if (userId) {
      const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: userId, name: form.name, email: form.email,
        phone: form.phone || null, county: form.county || null,
        area: form.area || null, account_type: form.account_type,
        subcategory: form.subcategory || null,
        role: 'user', is_active: true,
        subscription_expires_at: form.subscription_expires_at || null,
      });
      if (insertError) { setError(insertError.message); setCreating(false); return; }
    }
    setSuccess(`Account created for ${form.name}!`);
    setForm(emptyForm);
    setCreating(false);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-emerald-600 rounded-xl">
            <i className="ri-user-star-line text-white text-sm"></i>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Marketer Portal</h1>
            <p className="text-xs text-gray-400">{marketerName}</p>
          </div>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); navigate('/'); }}
          className="text-xs text-rose-500 border border-rose-200 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm">Create New User Account</h2>

          {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
          {success && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <i className="ri-checkbox-circle-line mr-1"></i>{success}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Full Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Kamau" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Email Address *</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="user@email.com" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Password *</label>
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" placeholder="Min. 6 characters" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Phone Number</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} type="tel" placeholder="+254 7XX XXX XXX" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Account Type *</label>
              <select value={form.account_type} onChange={e => setForm({ ...form, account_type: e.target.value, subcategory: '' })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                <option value="">Select type</option>
                {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {(form.account_type === 'service' || form.account_type === 'entertainment') && (
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Subcategory</label>
                <select value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                  <option value="">Select subcategory</option>
                  {(form.account_type === 'service' ? serviceSubcategories : entertainmentSubcategories).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">County</label>
              <select value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                <option value="">Select county</option>
                {kenyaCounties.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Area / Estate</label>
              <input value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="e.g. Westlands, Kilimani" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Subscription Expires</label>
              <input value={form.subscription_expires_at} onChange={e => setForm({ ...form, subscription_expires_at: e.target.value })} type="date" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 cursor-pointer" />
            </div>
          </div>

          <button onClick={handleCreate} disabled={creating} className={`w-full font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${creating ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}>
            {creating ? 'Creating...' : 'Create User Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
