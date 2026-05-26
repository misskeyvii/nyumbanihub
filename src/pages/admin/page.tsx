import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { kenyaCounties } from '../../mocks/listings';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  county: string;
  area: string;
  account_type: string;
  role: string;
  is_active: boolean;
  subscription_expires_at: string | null;
  created_at: string;
};

const accountTypes = ['landlord', 'airbnb', 'hotel', 'shop', 'marketplace', 'service', 'entertainment'];
const emptyForm = { name: '', email: '', password: '', phone: '', county: '', area: '', account_type: '' };
const serviceTypes = ['Mama Fua', 'Movers', 'Caretaker', 'Plumbing', 'Electrician', 'Security', 'Landscaping', 'Painting', 'Gas Delivery', 'Water Dispenser'];
const emptyProvider = { name: '', phone: '', whatsapp: '', county: '', area: '', service_type: '', description: '', price: '', price_unit: '/day' };

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [search, setSearch] = useState('');
  const [statFilter, setStatFilter] = useState<'all' | 'active' | 'blocked' | 'expired'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resetPasswords, setResetPasswords] = useState<{ [id: string]: string }>({});
  const [resetingId, setResetingId] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'users' | 'services'>('users');
  const [providers, setProviders] = useState<any[]>([]);
  const [providerForm, setProviderForm] = useState(emptyProvider);
  const [addingProvider, setAddingProvider] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [providerError, setProviderError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/signin'); return; }
      const { data: me } = await supabase.from('users').select('role').eq('id', session.user.id).single();
      if (me?.role !== 'admin') { navigate('/'); return; }
      setAuthChecking(false);
      fetchUsers();
      fetchProviders();
    };
    check();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, phone, county, area, account_type, role, is_active, subscription_expires_at, created_at')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password || !form.account_type) {
      setCreateError('Name, email, password and account type are required.');
      return;
    }
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (signUpError) { setCreateError(signUpError.message); setCreating(false); return; }
    const userId = data.user?.id;
    if (userId) {
      const { error: insertError } = await supabase.from('users').insert({
        id: userId, name: form.name, email: form.email,
        phone: form.phone || null, county: form.county || null,
        area: form.area || null, account_type: form.account_type,
        role: 'user', is_active: true,
      });
      if (insertError) { setCreateError(insertError.message); setCreating(false); return; }
    }
    setCreateSuccess(`Account created for ${form.name}!`);
    setForm(emptyForm);
    setCreating(false);
    fetchUsers();
  };

  const updateField = async (id: string, field: string, value: string | boolean) => {
    await supabase.from('users').update({ [field]: value }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const toggleActive = async (u: User) => {
    const newValue = !u.is_active;
    await supabase.from('users').update({ is_active: newValue }).eq('id', u.id);
    setUsers(users.map(x => x.id === u.id ? { ...x, is_active: newValue } : x));
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await supabase.from('users').delete().eq('id', id);
    setUsers(users.filter(u => u.id !== id));
  };

  const handleResetPassword = async (u: User) => {
    const newPw = resetPasswords[u.id];
    if (!newPw || newPw.length < 6) return;
    if (!confirm(`Send password reset email to ${u.email}?`)) return;
    setResetingId(u.id);
    await supabase.auth.resetPasswordForEmail(u.email, {
      redirectTo: `${window.location.origin}/signin`,
    });
    setResetPasswords({ ...resetPasswords, [u.id]: '' });
    setResetingId(null);
    setResetSuccess(u.id);
    setTimeout(() => setResetSuccess(null), 4000);
  };

  const isExpired = (date: string | null) => !!date && new Date(date) < new Date();

  const statCounts = {
    all: users.length,
    active: users.filter(u => u.is_active && !isExpired(u.subscription_expires_at)).length,
    blocked: users.filter(u => !u.is_active).length,
    expired: users.filter(u => isExpired(u.subscription_expires_at)).length,
  };

  const filtered = users
    .filter(u => {
      if (statFilter === 'active') return u.is_active && !isExpired(u.subscription_expires_at);
      if (statFilter === 'blocked') return !u.is_active;
      if (statFilter === 'expired') return isExpired(u.subscription_expires_at);
      return true;
    })
    .filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.account_type?.toLowerCase().includes(search.toLowerCase()) ||
      u.county?.toLowerCase().includes(search.toLowerCase())
    );

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-emerald-600 rounded-xl flex-shrink-0">
            <i className="ri-shield-check-fill text-white text-sm"></i>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Mabidha Admin</h1>
            <p className="text-xs text-gray-400">{users.length} users</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowCreate(!showCreate); setCreateError(''); setCreateSuccess(''); }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-add-line"></i> Add User
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); localStorage.clear(); navigate('/'); }}
            className="text-xs text-rose-500 border border-rose-200 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* Create User Form */}
        {showCreate && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="font-bold text-gray-900 text-sm">Create New User</h2>
            {createError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{createError}</p>}
            {createSuccess && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2"><i className="ri-checkbox-circle-line mr-1"></i>{createSuccess}</p>}
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
                <select value={form.account_type} onChange={e => setForm({ ...form, account_type: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                  <option value="">Select type</option>
                  {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">County</label>
                <select value={form.county} onChange={e => setForm({ ...form, county: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                  <option value="">Select county</option>
                  {kenyaCounties.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 block mb-1">Allowed Area <span className="font-normal text-gray-400">(leave blank for all areas)</span></label>
                <input value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="e.g. Westlands, Kilimani" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
              </div>
            </div>
            <button onClick={handleCreate} disabled={creating} className={`w-full font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${creating ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}>
              {creating ? 'Creating...' : 'Create User Account'}
            </button>
          </div>
        )}

        {/* Clickable Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { key: 'all', label: 'Total', color: 'text-gray-900', ring: 'ring-gray-400' },
            { key: 'active', label: 'Active', color: 'text-emerald-600', ring: 'ring-emerald-400' },
            { key: 'blocked', label: 'Blocked', color: 'text-rose-500', ring: 'ring-rose-400' },
            { key: 'expired', label: 'Expired', color: 'text-amber-500', ring: 'ring-amber-400' },
          ] as const).map(s => (
            <button
              key={s.key}
              onClick={() => setStatFilter(statFilter === s.key ? 'all' : s.key)}
              className={`bg-white rounded-xl border p-3 text-left transition-all cursor-pointer w-full ${statFilter === s.key ? `ring-2 ${s.ring} border-transparent` : 'border-gray-100 hover:border-gray-200'}`}
            >
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{statCounts[s.key]}</p>
              {statFilter === s.key && <p className="text-[10px] text-gray-400 mt-0.5">tap to clear</p>}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <i className="ri-search-line text-gray-400 text-sm"></i>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, county or type..." className="text-sm outline-none bg-transparent flex-1 text-gray-700" />
          {search && <button onClick={() => setSearch('')} className="text-gray-400 cursor-pointer"><i className="ri-close-line text-sm"></i></button>}
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No users found</div>
          ) : filtered.map(u => (
            <div key={u.id} className={`bg-white rounded-2xl border p-4 space-y-3 ${!u.is_active ? 'border-rose-100' : isExpired(u.subscription_expires_at) ? 'border-amber-100' : 'border-gray-100'}`}>

              {/* Top row — always visible */}
              <div className="flex items-start justify-between gap-3">
                <button className="flex-1 min-w-0 text-left cursor-pointer" onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{u.name || '—'}</p>
                    {!u.is_active ? (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">Blocked</span>
                    ) : isExpired(u.subscription_expires_at) ? (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Expired</span>
                    ) : u.subscription_expires_at ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">Active</span>
                    ) : null}
                    <i className={`ri-arrow-${expandedId === u.id ? 'up' : 'down'}-s-line text-gray-400 text-sm ml-auto`}></i>
                  </div>
                  <p className="text-xs text-gray-400">{u.email}</p>
                  {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                  {u.county && <p className="text-xs text-gray-400">{[u.area, u.county].filter(Boolean).join(', ')}</p>}
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(u)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${u.is_active ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    {u.is_active ? 'Block' : 'Unblock'}
                  </button>
                  <button onClick={() => deleteUser(u.id)} className="text-rose-400 hover:text-rose-600 cursor-pointer">
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>

              {/* Expanded section */}
              {expandedId === u.id && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-gray-50 pt-3">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 block mb-1">Account Type</label>
                      <select value={u.account_type || ''} onChange={e => updateField(u.id, 'account_type', e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                        <option value="">— none —</option>
                        {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 block mb-1">County</label>
                      <select value={u.county || ''} onChange={e => updateField(u.id, 'county', e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-emerald-400 bg-white cursor-pointer">
                        <option value="">— any —</option>
                        {kenyaCounties.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 block mb-1">Allowed Area</label>
                      <input value={u.area || ''} onChange={e => updateField(u.id, 'area', e.target.value)} placeholder="e.g. Westlands" className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 block mb-1">
                        Subscription Expires
                        {isExpired(u.subscription_expires_at) && <span className="ml-1 text-amber-500">— EXPIRED</span>}
                      </label>
                      <input
                        type="date"
                        value={u.subscription_expires_at ? u.subscription_expires_at.split('T')[0] : ''}
                        onChange={e => updateField(u.id, 'subscription_expires_at', e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Reset Password — separate section with confirm */}
                  <div className="border-t border-gray-50 pt-3">
                    <label className="text-[10px] font-semibold text-gray-400 block mb-1.5">
                      <i className="ri-lock-password-line mr-1"></i>Reset Password
                    </label>
                    {resetSuccess === u.id ? (
                      <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                        <i className="ri-checkbox-circle-line mr-1"></i>Reset email sent to {u.email}
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Type new password to confirm intent"
                          value={resetPasswords[u.id] || ''}
                          onChange={e => setResetPasswords({ ...resetPasswords, [u.id]: e.target.value })}
                          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-sky-400"
                        />
                        <button
                          onClick={() => handleResetPassword(u)}
                          disabled={resetingId === u.id || !resetPasswords[u.id] || (resetPasswords[u.id]?.length ?? 0) < 6}
                          className="text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {resetingId === u.id ? 'Sending...' : 'Send Reset'}
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">A reset link will be emailed to the user. You won't see their new password.</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
