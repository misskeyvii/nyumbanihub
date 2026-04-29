import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { kenyaCounties } from '../../mocks/listings';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  county: string;
  area: string;
  account_type: string;
  extra_account_types?: string[];
  role: string;
  is_active: boolean;
  subscription_expires_at: string | null;
  created_at: string;
};

type PendingRequest = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  business_name: string;
  account_type: string;
  phone: string | null;
  county: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const accountTypes = ['landlord', 'airbnb', 'hotel', 'shop', 'marketplace', 'service', 'entertainment'];

type Report = {
  id: string;
  listing_id: string;
  reason: string;
  created_at: string;
  listings: { id: string; title: string; listing_type: string } | null;
  users: { id: string; name: string; email: string } | null;
};

const serviceSubcategories = ['Mama Fua', 'Movers', 'Caretakers', 'Plumbing', 'Electricians', 'Security', 'Landscaping', 'Painting', 'Gas Delivery', 'Dispenser Water'];
const entertainmentSubcategories = ['Sounds & PA', 'Catering', 'DJs', 'MCs'];
const emptyForm = { name: '', email: '', password: '', phone: '', county: '', area: '', account_type: '', subcategory: '' };
const emptyMarketerForm = { name: '', email: '', password: '', phone: '' };

const SUPER_ADMIN_EMAIL = 'kellyoburuodhiambo@yahoo.com';

export default function AdminPage() {
  const [tab, setTab] = useState<'users' | 'marketers' | 'admins' | 'requests' | 'reports' | 'listings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [marketers, setMarketers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [search, setSearch] = useState('');
  const [statFilter, setStatFilter] = useState<'all' | 'browsers' | 'active' | 'blocked' | 'expired'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resetPasswords, setResetPasswords] = useState<{ [id: string]: string }>({});
  const [resetingId, setResetingId] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [showAddMarketer, setShowAddMarketer] = useState(false);
  const [marketerForm, setMarketerForm] = useState(emptyMarketerForm);
  const [addingMarketer, setAddingMarketer] = useState(false);
  const [marketerError, setMarketerError] = useState('');
  const [marketerSuccess, setMarketerSuccess] = useState('');
  const [admins, setAdmins] = useState<User[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [approvingListingId, setApprovingListingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/signin'); return; }
      const { data: me } = await supabaseAdmin.from('users').select('role').eq('id', session.user.id).single();
      if (me?.role !== 'admin') { navigate('/'); return; }
      const email = session.user.email ?? '';
      setIsSuperAdmin(email === SUPER_ADMIN_EMAIL);
      localStorage.setItem('userEmail', email);
      setAuthChecking(false);
      fetchUsers();
      fetchMarketers();
      fetchRequests();
      fetchReports();
      fetchPendingListings();
      if (email === SUPER_ADMIN_EMAIL) fetchAdmins();
    };
    check();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, phone, county, area, account_type, extra_account_types, role, is_active, subscription_expires_at, created_at')
      .not('role', 'in', '(admin,marketer)')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const fetchMarketers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, phone, county, area, account_type, role, is_active, subscription_expires_at, created_at')
      .eq('role', 'marketer')
      .order('created_at', { ascending: false })
      .throwOnError();
    setMarketers(data || []);
  };

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, phone, county, area, account_type, role, is_active, subscription_expires_at, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false })
      .throwOnError();
    setAdmins(data || []);
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('pending_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  const fetchReports = async () => {
    const { data } = await supabaseAdmin
      .from('reports')
      .select('id, listing_id, reason, created_at, listings(id, title, listing_type), users!reports_reporter_id_fkey(id, name, email)')
      .order('created_at', { ascending: false });
    setReports((data as unknown as Report[]) || []);
  };

  const fetchPendingListings = async () => {
    const { data } = await supabaseAdmin
      .from('listings')
      .select('id, title, listing_type, county, area, price, images, created_at, users(name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setPendingListings(data || []);
  };

  const handleApproveRequest = async (req: PendingRequest) => {
    setApprovingId(req.id);
    // Fetch current user data
    const { data: userData } = await supabaseAdmin.from('users').select('account_type, extra_account_types').eq('id', req.user_id).single();
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    let updateData: any = {
      ...(req.phone && { phone: req.phone }),
      ...(req.county && { county: req.county }),
      subscription_expires_at: expiresAt.toISOString(),
    };

    const hasPrimary = !!userData?.account_type && userData.account_type.trim() !== '';
    if (!hasPrimary) {
      // First account type — set as primary
      updateData.account_type = req.account_type;
    } else if (userData.account_type !== req.account_type) {
      // Already has primary — add to extra_account_types array (avoid duplicates)
      const existing = (userData.extra_account_types || []).filter(Boolean);
      if (!existing.includes(req.account_type)) {
        updateData.extra_account_types = [...existing, req.account_type];
      }
    }

    const { error } = await supabaseAdmin.from('users').update(updateData).eq('id', req.user_id);
    if (error) {
      alert('Error: ' + error.message);
      setApprovingId(null);
      return;
    }
    await supabaseAdmin.from('pending_requests').update({ status: 'approved' }).eq('id', req.id);

    // Send in-app notification to user
    await supabaseAdmin.from('users').update({ 
      has_notification: true,
      notification_message: `Your "${req.account_type}" listing account for "${req.business_name}" has been approved! Your subscription is active until ${expiresAt.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}.`
    }).eq('id', req.user_id);

    setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
    setApprovingId(null);
  };

  const handleRejectRequest = async (id: string) => {
    if (!confirm('Reject this request?')) return;
    await supabaseAdmin.from('pending_requests').update({ status: 'rejected' }).eq('id', id);
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const handleDeleteReportedListing = async (listingId: string, _reportId: string) => {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return;
    setDeletingListingId(listingId);
    const { error } = await supabaseAdmin.from('listings').delete().eq('id', listingId);
    if (error) {
      alert('Delete failed: ' + error.message);
      setDeletingListingId(null);
      return;
    }
    setReports(prev => prev.filter(r => r.listing_id !== listingId));
    setDeletingListingId(null);
    await fetchReports();
  };

  const handleDismissReport = async (reportId: string) => {
    await supabaseAdmin.from('reports').delete().eq('id', reportId);
    setReports(reports.filter(r => r.id !== reportId));
  };

  const handleApproveListing = async (id: string) => {
    setApprovingListingId(id);
    await supabaseAdmin.from('listings').update({ status: 'live' }).eq('id', id);
    setPendingListings(pendingListings.filter(l => l.id !== id));
    setApprovingListingId(null);
  };

  const handleRejectListing = async (id: string) => {
    if (!confirm('Reject and delete this listing?')) return;
    const { error } = await supabaseAdmin.from('listings').delete().eq('id', id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    setPendingListings(pendingListings.filter(l => l.id !== id));
  };

  const handleAddAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      setAdminError('Name, email and password are required.');
      return;
    }
    setAddingAdmin(true);
    setAdminError('');
    setAdminSuccess('');
    const { data, error } = await supabase.auth.signUp({ email: adminForm.email, password: adminForm.password });
    if (error) { setAdminError(error.message); setAddingAdmin(false); return; }
    const userId = data.user?.id;
    if (userId) {
      const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: userId, name: adminForm.name, email: adminForm.email,
        phone: adminForm.phone || null, role: 'admin', is_active: true,
      });
      if (insertError) { setAdminError(insertError.message); setAddingAdmin(false); return; }
    }
    setAdminSuccess(`Admin account created for ${adminForm.name}!`);
    setAdminForm({ name: '', email: '', password: '', phone: '' });
    setAddingAdmin(false);
    fetchAdmins();
  };

  const removeAdmin = async (id: string) => {
    if (!confirm('Remove this admin?')) return;
    await supabaseAdmin.from('users').update({ role: 'user' }).eq('id', id);
    fetchAdmins();
  };

  const handleAddMarketer = async () => {
    if (!marketerForm.name || !marketerForm.email || !marketerForm.password) {
      setMarketerError('Name, email and password are required.');
      return;
    }
    setAddingMarketer(true);
    setMarketerError('');
    setMarketerSuccess('');
    const { data, error } = await supabase.auth.signUp({ email: marketerForm.email, password: marketerForm.password });
    if (error) { setMarketerError(error.message); setAddingMarketer(false); return; }
    const userId = data.user?.id;
    if (userId) {
      const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: userId, name: marketerForm.name, email: marketerForm.email,
        phone: marketerForm.phone || null, role: 'marketer', is_active: true,
      });
      if (insertError) { setMarketerError(insertError.message); setAddingMarketer(false); return; }
    }
    setMarketerSuccess(`Marketer account created for ${marketerForm.name}!`);
    setMarketerForm(emptyMarketerForm);
    setAddingMarketer(false);
    fetchMarketers();
  };

  const removeMarketer = async (id: string) => {
    if (!confirm('Remove this marketer?')) return;
    await supabaseAdmin.from('users').update({ role: 'user' }).eq('id', id);
    fetchMarketers();
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
      const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: userId, name: form.name, email: form.email,
        phone: form.phone || null, county: form.county || null,
        area: form.area || null, account_type: form.account_type,
        subcategory: form.subcategory || null,
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
    await supabaseAdmin.from('users').update({ [field]: value }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const toggleActive = async (u: User) => {
    if (!isSuperAdmin) return;
    const newValue = !u.is_active;
    await supabaseAdmin.from('users').update({ is_active: newValue }).eq('id', u.id);
    setUsers(users.map(x => x.id === u.id ? { ...x, is_active: newValue } : x));
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
    browsers: users.filter(u => !u.account_type).length,
    active: users.filter(u => u.is_active && !isExpired(u.subscription_expires_at)).length,
    blocked: users.filter(u => !u.is_active).length,
    expired: users.filter(u => isExpired(u.subscription_expires_at)).length,
  };

  const filtered = users
    .filter(u => {
      if (statFilter === 'browsers') return !u.account_type;
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
            <h1 className="font-bold text-gray-900 text-sm">Nyumbani Hub Admin</h1>
            <p className="text-xs text-gray-400">{users.length} users</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowCreate(!showCreate); setCreateError(''); setCreateSuccess(''); }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-add-line"></i> {tab === 'users' ? 'Add User' : tab === 'marketers' ? 'Add Marketer' : 'Add Admin'}
          </button>
          <button
            onClick={() => navigate('/post-listing')}
            className="flex items-center gap-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i> Post Listing
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

        {/* Tabs */}
        <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 overflow-x-auto">
          {(['users', 'marketers', 'requests', 'listings', 'reports', ...(isSuperAdmin ? ['admins'] : [])] as const).map(t => (
            <button key={t} onClick={() => { setTab(t as any); setShowCreate(false); }}
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors cursor-pointer capitalize whitespace-nowrap ${
                tab === t ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'users' ? `Users (${users.length})` :
               t === 'marketers' ? `Marketers (${marketers.length})` :
               t === 'requests' ? `Requests (${requests.filter(r => r.status === 'pending').length})` :
               t === 'listings' ? `Listings (${pendingListings.length})` :
               t === 'reports' ? `Reports (${reports.length})` :
               `Admins (${admins.length})`}
            </button>
          ))}
        </div>

        {/* USERS TAB */}
        {tab === 'users' && (<>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {([
            { key: 'all', label: 'Total', color: 'text-gray-900', ring: 'ring-gray-400' },
            { key: 'browsers', label: 'Browsers', color: 'text-sky-600', ring: 'ring-sky-400' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, county or type..." autoComplete="off" className="text-sm outline-none bg-transparent flex-1 text-gray-700" />
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
                  {u.subscription_expires_at && (
                    <p className={`text-xs font-medium mt-0.5 ${
                      isExpired(u.subscription_expires_at) ? 'text-rose-500' :
                      new Date(u.subscription_expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'text-amber-500' :
                      'text-gray-400'
                    }`}>
                      <i className="ri-calendar-line mr-1"></i>
                      {isExpired(u.subscription_expires_at) ? 'Expired ' : 'Expires '}
                      {new Date(u.subscription_expires_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {[u.account_type, ...(u.extra_account_types || [])].filter(Boolean).length > 0 && (
                    <span className="text-xs text-gray-500 capitalize">{[u.account_type, ...(u.extra_account_types || [])].filter(Boolean).join(', ')}</span>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => toggleActive(u)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${u.is_active ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded section */}
              {expandedId === u.id && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-gray-50 pt-3">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-semibold text-gray-400 block mb-2">Listing Account Types</label>
                      {/* Current types as removable tags */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {[u.account_type, ...(u.extra_account_types || [])].filter(Boolean).map(at => (
                          <span key={at} className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                            {at}
                            <button
                              onClick={async () => {
                                if (!confirm(`Remove "${at}" from ${u.name}?`)) return;
                                if (at === u.account_type) {
                                  // Remove primary — promote first extra or set null
                                  const extras = (u.extra_account_types || []).filter(e => e !== at);
                                  const newPrimary = extras[0] || null;
                                  const newExtras = extras.slice(1);
                                  await supabaseAdmin.from('users').update({ account_type: newPrimary, extra_account_types: newExtras }).eq('id', u.id);
                                  setUsers(users.map(x => x.id === u.id ? { ...x, account_type: newPrimary || '', extra_account_types: newExtras } : x));
                                } else {
                                  // Remove from extras
                                  const newExtras = (u.extra_account_types || []).filter(e => e !== at);
                                  await supabaseAdmin.from('users').update({ extra_account_types: newExtras }).eq('id', u.id);
                                  setUsers(users.map(x => x.id === u.id ? { ...x, extra_account_types: newExtras } : x));
                                }
                              }}
                              className="text-emerald-500 hover:text-rose-500 cursor-pointer transition-colors"
                            >
                              <i className="ri-close-line text-xs"></i>
                            </button>
                          </span>
                        ))}
                        {![u.account_type, ...(u.extra_account_types || [])].filter(Boolean).length && (
                          <span className="text-xs text-gray-400">No account types assigned</span>
                        )}
                      </div>
                      {/* Add new type */}
                      <div className="flex gap-2">
                        <select
                          defaultValue=""
                          onChange={async (e) => {
                            const newType = e.target.value;
                            if (!newType) return;
                            const allCurrent = [u.account_type, ...(u.extra_account_types || [])].filter(Boolean);
                            if (allCurrent.includes(newType)) { e.target.value = ''; return; }
                            if (!u.account_type) {
                              await supabaseAdmin.from('users').update({ account_type: newType }).eq('id', u.id);
                              setUsers(users.map(x => x.id === u.id ? { ...x, account_type: newType } : x));
                            } else {
                              const newExtras = [...(u.extra_account_types || []), newType];
                              await supabaseAdmin.from('users').update({ extra_account_types: newExtras }).eq('id', u.id);
                              setUsers(users.map(x => x.id === u.id ? { ...x, extra_account_types: newExtras } : x));
                            }
                            e.target.value = '';
                          }}
                          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-emerald-400 bg-white cursor-pointer"
                        >
                          <option value="">+ Add account type</option>
                          {accountTypes.filter(t => ![u.account_type, ...(u.extra_account_types || [])].includes(t)).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
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
                      <input
                        key={u.id + '-area'}
                        defaultValue={u.area || ''}
                        onBlur={e => updateField(u.id, 'area', e.target.value)}
                        placeholder="e.g. Westlands"
                        autoComplete="off"
                        name={`area-${u.id}`}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 block mb-1">
                        Subscription Expires
                        {isExpired(u.subscription_expires_at) && <span className="ml-1 text-amber-500">— EXPIRED</span>}
                      </label>
                      <input
                        type="date"
                        autoComplete="off"
                        name={`expiry-${u.id}`}
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
                          autoComplete="new-password"
                          name={`reset-${u.id}`}
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
        </>)}

        {/* REQUESTS TAB */}
        {tab === 'requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No requests yet</div>
            ) : requests.map(req => (
              <div key={req.id} className={`bg-white rounded-2xl border p-4 space-y-2 ${
                req.status === 'pending' ? 'border-amber-100' : req.status === 'approved' ? 'border-emerald-100' : 'border-rose-100'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{req.business_name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>{req.status}</span>
                    </div>
                    <p className="text-xs text-gray-400">{req.user_name} · {req.user_email}</p>
                    {req.phone && <p className="text-xs text-gray-400">{req.phone}</p>}
                    {req.county && <p className="text-xs text-gray-400">{req.county}</p>}
                    <p className="text-xs text-gray-500 capitalize mt-1">Type: <span className="font-semibold">{req.account_type}</span></p>
                    {req.message && <p className="text-xs text-gray-400 mt-1 italic">"{req.message}"</p>}
                    <p className="text-[10px] text-gray-300 mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApproveRequest(req)}
                        disabled={approvingId === req.id}
                        className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {approvingId === req.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="text-xs font-semibold text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LISTINGS TAB */}
        {tab === 'listings' && (
          <div className="space-y-3">
            {pendingListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No pending listings</div>
            ) : pendingListings.map(l => (
              <div key={l.id} className="bg-white rounded-2xl border border-amber-100 p-4 flex gap-4">
                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  {l.images?.[0] ? (
                    <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-image-line text-gray-300 text-xl"></i>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{l.title}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{l.listing_type} · {[l.area, l.county].filter(Boolean).join(', ')}</p>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">KSh {l.price}</p>
                      {l.users && <p className="text-xs text-gray-400 mt-1">{l.users.name} · {l.users.email}</p>}
                      <p className="text-[10px] text-gray-300 mt-0.5">{new Date(l.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApproveListing(l.id)}
                        disabled={approvingListingId === l.id}
                        className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {approvingListingId === l.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectListing(l.id)}
                        className="text-xs font-semibold text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPORTS TAB */}
        {tab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No reports yet</div>
            ) : reports.map(rep => (
              <div key={rep.id} className="bg-white rounded-2xl border border-rose-100 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full capitalize">{rep.reason}</span>
                      <span className="text-[10px] text-gray-300">{new Date(rep.created_at).toLocaleDateString()}</span>
                    </div>
                    {rep.listings && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-500">Reported Listing</p>
                        <p className="text-sm font-bold text-gray-900">{rep.listings.title}</p>
                        <span className="text-[10px] text-gray-400 capitalize">{rep.listings.listing_type}</span>
                      </div>
                    )}
                    {rep.users && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-500">Reported by</p>
                        <p className="text-sm text-gray-700">{rep.users.name}</p>
                        <p className="text-xs text-gray-400">{rep.users.email}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {rep.listings && (
                      <a
                        href={`/listing/${rep.listing_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-sky-600 border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-colors whitespace-nowrap text-center"
                      >
                        View Listing
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteReportedListing(rep.listing_id, rep.id)}
                      disabled={deletingListingId === rep.listing_id}
                      className="text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {deletingListingId === rep.listing_id ? 'Deleting...' : 'Delete Listing'}
                    </button>
                    <button
                      onClick={() => handleDismissReport(rep.id)}
                      className="text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MARKETERS TAB */}
        {tab === 'marketers' && (
          <div className="space-y-4">
            <button
              onClick={() => { setShowAddMarketer(!showAddMarketer); setMarketerError(''); setMarketerSuccess(''); }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-user-add-line"></i> Add Marketer
            </button>

            {showAddMarketer && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="font-bold text-gray-900 text-sm">Create Marketer Account</h2>
                {marketerError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{marketerError}</p>}
                {marketerSuccess && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2"><i className="ri-checkbox-circle-line mr-1"></i>{marketerSuccess}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Full Name *</label>
                    <input value={marketerForm.name} onChange={e => setMarketerForm({ ...marketerForm, name: e.target.value })} placeholder="e.g. Jane Wanjiku" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Email Address *</label>
                    <input value={marketerForm.email} onChange={e => setMarketerForm({ ...marketerForm, email: e.target.value })} type="email" placeholder="marketer@email.com" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Password *</label>
                    <input value={marketerForm.password} onChange={e => setMarketerForm({ ...marketerForm, password: e.target.value })} type="password" placeholder="Min. 6 characters" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Phone Number</label>
                    <input value={marketerForm.phone} onChange={e => setMarketerForm({ ...marketerForm, phone: e.target.value })} type="tel" placeholder="+254 7XX XXX XXX" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                </div>
                <button onClick={handleAddMarketer} disabled={addingMarketer} className={`w-full font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${addingMarketer ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}>
                  {addingMarketer ? 'Creating...' : 'Create Marketer Account'}
                </button>
              </div>
            )}

            {marketers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No marketers yet</div>
            ) : marketers.map(m => (
              <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                  {m.phone && <p className="text-xs text-gray-400">{m.phone}</p>}
                </div>
                <button onClick={() => removeMarketer(m.id)} className="text-xs text-rose-500 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ADMINS TAB — super admin only */}
        {tab === 'admins' && isSuperAdmin && (
          <div className="space-y-4">
            <button
              onClick={() => { setShowAddAdmin(!showAddAdmin); setAdminError(''); setAdminSuccess(''); }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-user-add-line"></i> Add Admin
            </button>

            {showAddAdmin && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="font-bold text-gray-900 text-sm">Create Admin Account</h2>
                {adminError && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{adminError}</p>}
                {adminSuccess && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2"><i className="ri-checkbox-circle-line mr-1"></i>{adminSuccess}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Full Name *</label>
                    <input value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} placeholder="e.g. Jane Admin" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Email Address *</label>
                    <input value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} type="email" placeholder="admin@email.com" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Password *</label>
                    <input value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} type="password" placeholder="Min. 6 characters" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Phone Number</label>
                    <input value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} type="tel" placeholder="+254 7XX XXX XXX" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
                  </div>
                </div>
                <button onClick={handleAddAdmin} disabled={addingAdmin} className={`w-full font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${addingAdmin ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}>
                  {addingAdmin ? 'Creating...' : 'Create Admin Account'}
                </button>
              </div>
            )}

            {admins.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No other admins yet</div>
            ) : admins.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.email}</p>
                  {a.phone && <p className="text-xs text-gray-400">{a.phone}</p>}
                </div>
                {a.email !== SUPER_ADMIN_EMAIL && (
                  <button onClick={() => removeAdmin(a.id)} className="text-xs text-rose-500 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
