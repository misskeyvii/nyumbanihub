import { useState } from 'react';
import PageHeader from '@/components/base/PageHeader';
import Modal from '@/components/base/Modal';
import { suppliers as seedSuppliers, type Supplier } from '@/mocks/suppliers';
import { formatMoney } from '@/utils/format';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

interface FormState {
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
}

const emptyForm: FormState = { name: '', contact: '', phone: '', email: '', address: '' };

export default function Suppliers() {
  const [items, setItems] = useState<Supplier[]>(seedSuppliers);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const filtered = items.filter((s) => {
    const q = query.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const totalOwed = items.reduce((sum, s) => sum + s.amountOwed, 0);
  const totalPurchases = items.reduce((sum, s) => sum + s.totalPurchases, 0);

  const handleSave = (form: FormState) => {
    const data: Supplier = {
      id: editing?.id || `sup-${Date.now()}`,
      name: form.name.trim() || 'Unnamed Supplier',
      contact: form.contact.trim() || '—',
      phone: form.phone.trim() || '—',
      email: form.email.trim(),
      address: form.address.trim() || '—',
      productsSupplied: editing?.productsSupplied || 0,
      totalPurchases: editing?.totalPurchases || 0,
      amountOwed: editing?.amountOwed || 0,
    };
    setItems((prev) => (editing ? prev.map((x) => (x.id === editing.id ? data : x)) : [data, ...prev]));
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleting) setItems((prev) => prev.filter((x) => x.id !== deleting.id));
    setDeleting(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage who you buy from, and what you still owe."
        action={
          <button type="button" onClick={() => { setEditing(null); setModalOpen(true); }} className={primaryBtn}>
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
            Add Supplier
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Active Suppliers', value: String(items.length), icon: 'ri-truck-line', tone: 'bg-primary-100 text-primary-700' },
          { label: 'Total Purchases', value: formatMoney(totalPurchases), icon: 'ri-shopping-bag-line', tone: 'bg-secondary-100 text-secondary-700' },
          { label: 'Amount Owed', value: formatMoney(totalOwed), icon: 'ri-wallet-line', tone: 'bg-accent-100 text-accent-700' },
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

      <div className="relative max-w-md">
        <span className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-foreground-400">
          <i className="ri-search-line text-sm" />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search suppliers…"
          className="h-10 w-full rounded-md border border-background-200 bg-background-50 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-lg border border-background-200 bg-background-50 p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <i className="ri-truck-line text-xl" />
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => { setEditing(s); setModalOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 hover:text-foreground-900">
                  <i className="ri-edit-line" />
                </button>
                <button type="button" onClick={() => setDeleting(s)} className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-accent-100 hover:text-accent-700">
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
            </div>
            <h3 className="mt-4 font-heading text-base font-bold text-foreground-950">{s.name}</h3>
            <p className="text-xs text-foreground-500">{s.contact}</p>
            <div className="mt-3 space-y-1.5 text-sm text-foreground-600">
              <p className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center text-foreground-400"><i className="ri-phone-line" /></span>
                {s.phone}
              </p>
              {s.email && (
                <p className="flex items-center gap-2 truncate">
                  <span className="flex h-4 w-4 items-center justify-center text-foreground-400"><i className="ri-mail-line" /></span>
                  {s.email}
                </p>
              )}
              <p className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center text-foreground-400"><i className="ri-map-pin-line" /></span>
                {s.address}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-background-200 pt-3 text-sm">
              <span className="text-foreground-500">{s.productsSupplied} products</span>
              {s.amountOwed > 0 ? (
                <span className="font-semibold text-accent-700">Owes {formatMoney(s.amountOwed)}</span>
              ) : (
                <span className="font-semibold text-primary-700">Settled</span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-background-300 p-12 text-center text-foreground-500">
            No suppliers found.
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="md">
        <SupplierForm initial={editing ? { name: editing.name, contact: editing.contact, phone: editing.phone, email: editing.email, address: editing.address } : emptyForm} onCancel={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete this supplier?" size="sm">
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

function SupplierForm({ initial, onCancel, onSave }: { initial: FormState; onCancel: () => void; onSave: (f: FormState) => void }) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Supplier name *</label>
        <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Nairobi Bottlers" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Contact person</label>
          <input className={inputCls} value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="David Mwangi" />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+254 733 111 222" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Email</label>
        <input className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="orders@supplier.co.ke" />
      </div>
      <div>
        <label className={labelCls}>Address</label>
        <input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Industrial Area, Nairobi" />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className={ghostBtn}>Cancel</button>
        <button type="button" onClick={() => { if (form.name.trim()) onSave(form); }} className={primaryBtn}>Save Supplier</button>
      </div>
    </div>
  );
}