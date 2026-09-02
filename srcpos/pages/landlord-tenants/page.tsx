import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { formatMoney, formatDate } from '@/utils/format';
import Modal from '@/components/base/Modal';
import PageHeader from '@/components/base/PageHeader';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

interface Tenant {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email: string | null;
  national_id: string | null;
  property_id: string | null;
  property_name: string | null;
  rent_amount: number;
  balance: number;
  lease_start: string | null;
  lease_end: string | null;
  status: 'Current' | 'Arrears' | 'Notice' | 'Former';
  notes: string | null;
}

interface Property {
  id: string;
  name: string;
}

const tenantTone: Record<string, string> = {
  Current: 'bg-primary-100 text-primary-700',
  Arrears: 'bg-accent-100 text-accent-700',
  Notice: 'bg-foreground-200 text-foreground-600',
  Former: 'bg-foreground-200 text-foreground-600',
};

export default function LandlordTenants() {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([loadTenants(), loadProperties()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadTenants() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_tenants')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (data) setTenants(data);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  }

  async function loadProperties() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_properties')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');

      if (data) setProperties(data);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  }

  async function saveTenant(formData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let propertyName = null;
      if (formData.property_id) {
        const property = properties.find(p => p.id === formData.property_id);
        propertyName = property?.name || null;
      }

      if (editingTenant) {
        await supabase
          .from('pos_tenants')
          .update({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            national_id: formData.national_id,
            property_id: formData.property_id || null,
            property_name: propertyName,
            rent_amount: Number(formData.rent_amount),
            balance: Number(formData.balance),
            lease_start: formData.lease_start,
            lease_end: formData.lease_end,
            status: formData.status,
            notes: formData.notes,
          })
          .eq('id', editingTenant.id);
      } else {
        await supabase
          .from('pos_tenants')
          .insert({
            user_id: user.id,
            tenant_id: `ten-${Date.now()}`,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            national_id: formData.national_id,
            property_id: formData.property_id || null,
            property_name: propertyName,
            rent_amount: Number(formData.rent_amount),
            balance: Number(formData.balance) || 0,
            lease_start: formData.lease_start,
            lease_end: formData.lease_end,
            status: formData.status || 'Current',
            notes: formData.notes,
          });
      }

      await loadTenants();
      setModalOpen(false);
      setEditingTenant(null);
    } catch (error) {
      console.error('Failed to save tenant:', error);
      alert('Failed to save tenant. Please try again.');
    }
  }

  async function deleteTenant(id: string) {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;
    
    try {
      await supabase
        .from('pos_tenants')
        .delete()
        .eq('id', id);

      await loadTenants();
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      alert('Failed to delete tenant. Please try again.');
    }
  }

  const filtered = tenants.filter((t) => {
    const q = query.toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.phone.includes(q);
  });

  const totalRent = tenants.reduce((sum, t) => sum + t.rent_amount, 0);
  const totalBalance = tenants.reduce((sum, t) => sum + t.balance, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Tenants"
        subtitle="Manage all your tenants and their rental information."
        action={
          <button
            type="button"
            onClick={() => { setEditingTenant(null); setModalOpen(true); }}
            className={primaryBtn}
          >
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-user-add-line" /></span>
            Add Tenant
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-700">
            <i className="ri-user-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : String(tenants.length)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Total Tenants</p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-700">
            <i className="ri-money-dollar-circle-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : formatMoney(totalRent, 0)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Total Monthly Rent</p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-100 text-accent-700">
            <i className="ri-alert-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : formatMoney(totalBalance, 0)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Outstanding Balance</p>
        </div>
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
              placeholder="Search by name or phone…"
              className="h-10 w-full rounded-md border border-background-200 bg-background-100 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-foreground-500">Loading tenants...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-foreground-500">No tenants found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                  <th className="px-5 py-3 font-medium">Tenant</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Property</th>
                  <th className="px-5 py-3 text-right font-medium">Monthly Rent</th>
                  <th className="px-5 py-3 text-right font-medium">Balance</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-700">
                          {tenant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                        <span className="font-medium text-foreground-900">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground-600">{tenant.phone}</td>
                    <td className="px-5 py-3 text-foreground-600">{tenant.property_name || '—'}</td>
                    <td className="px-5 py-3 text-right text-foreground-600">{formatMoney(tenant.rent_amount, 0)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={tenant.balance > 0 ? 'font-semibold text-accent-700' : 'text-foreground-600'}>
                        {formatMoney(tenant.balance, 0)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tenantTone[tenant.status]}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => { setEditingTenant(tenant); setModalOpen(true); }}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 hover:text-foreground-900"
                          title="Edit"
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTenant(tenant.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-accent-100 hover:text-accent-700"
                          title="Delete"
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTenant ? 'Edit Tenant' : 'Add Tenant'} size="lg">
        <TenantForm
          initial={editingTenant}
          properties={properties}
          onCancel={() => setModalOpen(false)}
          onSave={saveTenant}
        />
      </Modal>
    </div>
  );
}

function TenantForm({ initial, properties, onCancel, onSave }: { initial: Tenant | null; properties: Property[]; onCancel: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    national_id: initial?.national_id || '',
    property_id: initial?.property_id || '',
    rent_amount: initial?.rent_amount || 0,
    balance: initial?.balance || 0,
    lease_start: initial?.lease_start || '',
    lease_end: initial?.lease_end || '',
    status: initial?.status || 'Current',
    notes: initial?.notes || '',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Kamau" />
        </div>
        <div>
          <label className={labelCls}>Phone Number *</label>
          <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 712 345 678" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
        </div>
        <div>
          <label className={labelCls}>National ID</label>
          <input className={inputCls} value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} placeholder="12345678" />
        </div>
        <div>
          <label className={labelCls}>Property</label>
          <select className={inputCls} value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })}>
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Monthly Rent (KSh) *</label>
          <input type="number" className={inputCls} value={form.rent_amount} onChange={(e) => setForm({ ...form, rent_amount: Number(e.target.value) })} placeholder="45000" />
        </div>
        <div>
          <label className={labelCls}>Balance Owed (KSh)</label>
          <input type="number" className={inputCls} value={form.balance} onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })} placeholder="0" />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option value="Current">Current</option>
            <option value="Arrears">Arrears</option>
            <option value="Notice">Notice</option>
            <option value="Former">Former</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Lease Start</label>
          <input type="date" className={inputCls} value={form.lease_start} onChange={(e) => setForm({ ...form, lease_start: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Lease End</label>
          <input type="date" className={inputCls} value={form.lease_end} onChange={(e) => setForm({ ...form, lease_end: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Notes</label>
        <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional details..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={ghostBtn}>Cancel</button>
        <button
          type="button"
          onClick={() => {
            if (form.name && form.phone && form.rent_amount > 0) onSave(form);
          }}
          className={primaryBtn}
        >
          Save Tenant
        </button>
      </div>
    </div>
  );
}
