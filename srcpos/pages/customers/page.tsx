import { useState, useEffect } from 'react';
import PageHeader from '@/components/base/PageHeader';
import Modal from '@/components/base/Modal';
import { supabase } from '@/utils/supabaseClient';
import { formatMoney, formatDate, formatTime } from '@/utils/format';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

interface Customer {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
  email: string;
  total_spent: number;
  visits: number;
  last_visit: string;
}

interface Sale {
  id: string;
  receipt_no: string;
  date: string;
  total: number;
  customer_id: string;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const emptyForm: FormState = { name: '', phone: '', email: '', notes: '' };

export default function Customers() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<Sale[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (viewing) {
      loadPurchaseHistory(viewing.id);
    }
  }, [viewing]);

  async function loadCustomers() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_customers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (data) {
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPurchaseHistory(customerId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_sales')
        .select('*')
        .eq('user_id', user.id)
        .eq('customer_id', customerId)
        .order('date', { ascending: false })
        .limit(10);

      if (data) {
        setPurchaseHistory(data);
      }
    } catch (error) {
      console.error('Failed to load purchase history:', error);
    }
  }

  const filtered = items.filter((c) => {
    const q = query.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const handleSave = async (form: FormState) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editing) {
        // Update existing customer
        await supabase
          .from('pos_customers')
          .update({
            name: form.name.trim() || 'Unnamed Customer',
            phone: form.phone.trim() || '—',
            email: form.email.trim(),
          })
          .eq('id', editing.id);
      } else {
        // Create new customer
        await supabase
          .from('pos_customers')
          .insert({
            user_id: user.id,
            customer_id: `c-${Date.now()}`,
            name: form.name.trim() || 'Unnamed Customer',
            phone: form.phone.trim() || '—',
            email: form.email.trim(),
            total_spent: 0,
            visits: 0,
          });
      }

      await loadCustomers();
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    
    try {
      await supabase
        .from('pos_customers')
        .delete()
        .eq('id', deleting.id);

      await loadCustomers();
      setDeleting(null);
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Keep track of who's buying and how much they spend."
        action={
          <button type="button" onClick={() => { setEditing(null); setModalOpen(true); }} className={primaryBtn}>
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
            Add Customer
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Customers', value: loading ? '...' : String(items.length), icon: 'ri-user-line', tone: 'bg-primary-100 text-primary-700' },
          { label: 'Repeat Customers', value: loading ? '...' : String(items.filter((c) => c.visits > 1).length), icon: 'ri-repeat-line', tone: 'bg-secondary-100 text-secondary-700' },
          { label: 'Lifetime Value', value: loading ? '...' : formatMoney(items.reduce((s, c) => s + c.total_spent, 0)), icon: 'ri-coins-line', tone: 'bg-accent-100 text-accent-700' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-background-200 bg-background-50 p-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-md ${s.tone}`}>
              <i className={`${s.icon} text-lg`} />
            </span>
            <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{s.value}</p>
            <p className="mt-0.5 text-sm text-foreground-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-background-200 bg-background-50">
        <div className="border-b border-background-200 p-5">
          <div className="relative max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-foreground-400">
              <i className="ri-search-line text-sm" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone or email…"
              className="h-10 w-full rounded-md border border-background-200 bg-background-100 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Visits</th>
                <th className="px-5 py-3 font-medium">Total Spent</th>
                <th className="px-5 py-3 font-medium">Last Visit</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-foreground-500">Loading customers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-foreground-500">No customers found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => setViewing(c)} className="text-left">
                        <span className="block font-medium text-foreground-900 hover:text-primary-700">{c.name}</span>
                        {c.email && <span className="block text-xs text-foreground-500">{c.email}</span>}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-foreground-600">{c.phone}</td>
                    <td className="px-5 py-3 text-foreground-600">{c.visits}</td>
                    <td className="px-5 py-3 font-semibold text-foreground-900">{formatMoney(c.total_spent)}</td>
                    <td className="px-5 py-3 text-foreground-600">{c.last_visit ? formatDate(c.last_visit) : '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setViewing(c)} className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 hover:text-foreground-900" title="View">
                          <i className="ri-eye-line" />
                        </button>
                        <button type="button" onClick={() => { setEditing(c); setModalOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 hover:text-foreground-900" title="Edit">
                          <i className="ri-edit-line" />
                        </button>
                        <button type="button" onClick={() => setDeleting(c)} className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-accent-100 hover:text-accent-700" title="Delete">
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'} size="md">
        <CustomerForm initial={editing ? { name: editing.name, phone: editing.phone, email: editing.email, notes: '' } : emptyForm} onCancel={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name || ''} subtitle={viewing?.phone} size="md">
        <div className="space-y-4">
          {viewing?.email && (
            <div className="flex items-center gap-2 text-sm text-foreground-600">
              <span className="flex h-4 w-4 items-center justify-center text-foreground-400"><i className="ri-mail-line" /></span>
              {viewing.email}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-background-100 p-3">
              <p className="text-xs text-foreground-500">Total spent</p>
              <p className="font-heading text-lg font-bold text-foreground-950">{formatMoney(viewing?.total_spent || 0)}</p>
            </div>
            <div className="rounded-md bg-background-100 p-3">
              <p className="text-xs text-foreground-500">Visits</p>
              <p className="font-heading text-lg font-bold text-foreground-950">{viewing?.visits || 0}</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground-900">Purchase history</p>
            {purchaseHistory.length === 0 ? (
              <p className="text-sm text-foreground-500">No recorded purchases yet.</p>
            ) : (
              <div className="space-y-2">
                {purchaseHistory.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-md bg-background-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground-900">{s.receipt_no}</p>
                      <p className="text-xs text-foreground-500">{formatDate(s.date)} · {formatTime(s.date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground-900">{formatMoney(s.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete this customer?" size="sm">
        <p className="text-sm text-foreground-600">
          You're about to delete <span className="font-semibold text-foreground-950">{deleting?.name}</span>.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setDeleting(null)} className={ghostBtn}>Cancel</button>
          <button type="button" onClick={confirmDelete} className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-4 text-sm font-semibold text-background-50 transition-colors hover:bg-accent-600">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function CustomerForm({ initial, onCancel, onSave }: { initial: FormState; onCancel: () => void; onSave: (f: FormState) => void }) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Name *</label>
        <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Mary Achieng" />
      </div>
      <div>
        <label className={labelCls}>Phone</label>
        <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+254 712 345 678" />
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@email.com" />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className={ghostBtn}>Cancel</button>
        <button type="button" onClick={() => { if (form.name.trim()) onSave(form); }} className={primaryBtn}>Save Customer</button>
      </div>
    </div>
  );
}