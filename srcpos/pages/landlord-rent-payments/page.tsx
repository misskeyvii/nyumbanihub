import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { formatMoney, formatDate } from '@/utils/format';
import Modal from '@/components/base/Modal';
import PageHeader from '@/components/base/PageHeader';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

interface RentPayment {
  id: string;
  payment_id: string;
  tenant_id: string;
  tenant_name: string;
  property_id: string;
  property_name: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  period_month: string;
  receipt_no: string;
  notes: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

interface Property {
  id: string;
  name: string;
}

const paymentMethodColor: Record<string, string> = {
  'M-Pesa': 'bg-primary-100 text-primary-700',
  'Bank Transfer': 'bg-secondary-100 text-secondary-700',
  'Cash': 'bg-accent-100 text-accent-700',
  'Cheque': 'bg-foreground-200 text-foreground-600',
};

export default function LandlordRentPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RentPayment | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([loadPayments(), loadTenants(), loadProperties()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_rent_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (data) setPayments(data);
    } catch (error) {
      console.error('Failed to load rent payments:', error);
    }
  }

  async function loadTenants() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_tenants')
        .select('id, name')
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

  async function savePayment(formData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tenant = tenants.find(t => t.id === formData.tenant_id);
      const property = properties.find(p => p.id === formData.property_id);

      if (editingPayment) {
        await supabase
          .from('pos_rent_payments')
          .update({
            tenant_id: formData.tenant_id,
            tenant_name: tenant?.name,
            property_id: formData.property_id,
            property_name: property?.name,
            amount: Number(formData.amount),
            payment_method: formData.payment_method,
            payment_date: formData.payment_date,
            period_month: formData.period_month,
            receipt_no: formData.receipt_no,
            notes: formData.notes,
          })
          .eq('id', editingPayment.id);
      } else {
        await supabase
          .from('pos_rent_payments')
          .insert({
            user_id: user.id,
            payment_id: `pay-${Date.now()}`,
            tenant_id: formData.tenant_id,
            tenant_name: tenant?.name,
            property_id: formData.property_id,
            property_name: property?.name,
            amount: Number(formData.amount),
            payment_method: formData.payment_method || 'M-Pesa',
            payment_date: formData.payment_date,
            period_month: formData.period_month,
            receipt_no: formData.receipt_no,
            notes: formData.notes,
          });
      }

      await loadPayments();
      setModalOpen(false);
      setEditingPayment(null);
    } catch (error) {
      console.error('Failed to save rent payment:', error);
      alert('Failed to save rent payment. Please try again.');
    }
  }

  async function deletePayment(id: string) {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await supabase
        .from('pos_rent_payments')
        .delete()
        .eq('id', id);

      await loadPayments();
    } catch (error) {
      console.error('Failed to delete payment:', error);
      alert('Failed to delete payment. Please try again.');
    }
  }

  const filtered = payments.filter((p) => {
    const q = query.toLowerCase();
    return !q || p.tenant_name.toLowerCase().includes(q) || p.property_name.toLowerCase().includes(q) || p.receipt_no.includes(q);
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonthTotal = payments.filter(p => {
    const paymentMonth = new Date(p.payment_date).toISOString().slice(0, 7);
    const currentMonth = new Date().toISOString().slice(0, 7);
    return paymentMonth === currentMonth;
  }).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Rent Payments"
        subtitle="Record and track all rent payments from your tenants."
        action={
          <button
            type="button"
            onClick={() => { setEditingPayment(null); setModalOpen(true); }}
            className={primaryBtn}
          >
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
            Record Payment
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-700">
            <i className="ri-money-dollar-circle-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : formatMoney(totalCollected, 0)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Total Collected</p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary-100 text-secondary-700">
            <i className="ri-calendar-month-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : formatMoney(thisMonthTotal, 0)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">This Month</p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary-100 text-secondary-700">
            <i className="ri-receipt-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : String(payments.length)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Total Payments</p>
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
              placeholder="Search by tenant, property, or receipt…"
              className="h-10 w-full rounded-md border border-background-200 bg-background-100 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-foreground-500">Loading payments...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-foreground-500">No payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                  <th className="px-5 py-3 font-medium">Tenant</th>
                  <th className="px-5 py-3 font-medium">Property</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Period</th>
                  <th className="px-5 py-3 font-medium">Payment Date</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Receipt</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <tr key={payment.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                    <td className="px-5 py-3 font-medium text-foreground-900">{payment.tenant_name}</td>
                    <td className="px-5 py-3 text-foreground-600">{payment.property_name}</td>
                    <td className="px-5 py-3 text-right font-semibold text-primary-700">{formatMoney(payment.amount, 0)}</td>
                    <td className="px-5 py-3 text-sm text-foreground-600">{payment.period_month}</td>
                    <td className="px-5 py-3 text-sm text-foreground-600">{formatDate(payment.payment_date)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paymentMethodColor[payment.payment_method] || 'bg-background-200 text-foreground-600'}`}>
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground-600">{payment.receipt_no}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => { setEditingPayment(payment); setModalOpen(true); }}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 hover:text-foreground-900"
                          title="Edit"
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePayment(payment.id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingPayment ? 'Edit Payment' : 'Record Payment'} size="lg">
        <PaymentForm
          initial={editingPayment}
          tenants={tenants}
          properties={properties}
          onCancel={() => setModalOpen(false)}
          onSave={savePayment}
        />
      </Modal>
    </div>
  );
}

function PaymentForm({ initial, tenants, properties, onCancel, onSave }: { initial: RentPayment | null; tenants: Tenant[]; properties: Property[]; onCancel: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    tenant_id: initial?.tenant_id || '',
    property_id: initial?.property_id || '',
    amount: initial?.amount || 0,
    payment_method: initial?.payment_method || 'M-Pesa',
    payment_date: initial?.payment_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    period_month: initial?.period_month || new Date().toISOString().slice(0, 7),
    receipt_no: initial?.receipt_no || '',
    notes: initial?.notes || '',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Tenant *</label>
          <select className={inputCls} value={form.tenant_id} onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}>
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Property *</label>
          <select className={inputCls} value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })}>
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Amount (KSh) *</label>
          <input type="number" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="45000" />
        </div>
        <div>
          <label className={labelCls}>Payment Method</label>
          <select className={inputCls} value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Payment Date *</label>
          <input type="date" className={inputCls} value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Period (Month)</label>
          <input type="month" className={inputCls} value={form.period_month} onChange={(e) => setForm({ ...form, period_month: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Receipt Number</label>
          <input className={inputCls} value={form.receipt_no} onChange={(e) => setForm({ ...form, receipt_no: e.target.value })} placeholder="e.g. RCP-001" />
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
            if (form.tenant_id && form.property_id && form.amount > 0 && form.payment_date) onSave(form);
          }}
          className={primaryBtn}
        >
          Save Payment
        </button>
      </div>
    </div>
  );
}
