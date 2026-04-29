import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import MobileBottomNav from '../../components/feature/MobileBottomNav';
import { kenyaCounties } from '../../mocks/listings';
import { supabase } from '../../lib/supabase';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', county: '', area: '', price: '', description: '',
    phone: '', whatsapp: '', map_url: '',
  });

  useEffect(() => {
    if (!id) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate('/signin'); return; }
      const { data } = await supabase.from('listings').select('*').eq('id', id).eq('user_id', session.user.id).single();
      if (!data) { navigate('/profile'); return; }
      setForm({
        title: data.title || '',
        county: data.county || '',
        area: data.area || '',
        price: data.price || '',
        description: data.description || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        map_url: data.map_url || '',
      });
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.title || !form.county || !form.price) {
      setError('Title, county and price are required.');
      return;
    }
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.from('listings').update({
      title: form.title,
      county: form.county,
      area: form.area,
      price: form.price,
      description: form.description,
      phone: form.phone,
      whatsapp: form.whatsapp,
      map_url: form.map_url || null,
    }).eq('id', id);
    if (updateError) { setError(updateError.message); setSaving(false); return; }
    setSaving(false);
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="pt-16 px-4 md:px-6 pb-16">
        <div className="max-w-2xl mx-auto py-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Edit Listing</h1>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            {error && <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Listing Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">County *</label>
                <select name="county" value={form.county} onChange={handleChange} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white">
                  <option value="">Select County</option>
                  {kenyaCounties.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Area / Estate</label>
                <input name="area" value={form.area} onChange={handleChange} placeholder="e.g. Westlands" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Price (KSh) *</label>
              <input name="price" value={form.price} onChange={handleChange} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={e => { if (e.target.value.length <= 500) handleChange(e); }} rows={4} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 resize-none" />
              <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} type="tel" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">WhatsApp</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} type="tel" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Google Maps Link <span className="font-normal text-gray-400">(optional)</span></label>
              <input name="map_url" value={form.map_url} onChange={handleChange} type="url" placeholder="Paste Google Maps link" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400" />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={saving} className={`flex-1 font-bold text-sm py-3 rounded-xl transition-colors whitespace-nowrap ${saving ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => navigate('/profile')} className="px-5 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                Cancel
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
