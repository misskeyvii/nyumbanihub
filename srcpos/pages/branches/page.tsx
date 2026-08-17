import { useState } from 'react';
import PageHeader from '@/components/base/PageHeader';
import Modal from '@/components/base/Modal';
import { branchList, type BranchDetail } from '@/mocks/branches';
import { formatMoney } from '@/utils/format';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

interface FormState {
  name: string;
  location: string;
  manager: string;
  phone: string;
}

const emptyForm: FormState = { name: '', location: '', manager: '', phone: '' };

export default function Branches() {
  const [items, setItems] = useState<BranchDetail[]>(branchList);
  const [modalOpen, setModalOpen] = useState(false);

  const active = items.filter((b) => b.status === 'active').length;
  const monthSales = items.reduce((sum, b) => sum + b.monthSales, 0);
  const totalEmployees = items.reduce((sum, b) => sum + b.employees, 0);

  const handleSave = (form: FormState) => {
    const data: BranchDetail = {
      id: `br-${Date.now()}`,
      name: form.name.trim() || 'New Branch',
      location: form.location.trim() || '—',
      manager: form.manager.trim() || 'Pending',
      phone: form.phone.trim() || '—',
      employees: 0,
      status: 'active',
      todaySales: 0,
      monthSales: 0,
    };
    setItems((prev) => [...prev, data]);
    setModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Branches"
        subtitle="Run multiple locations from one account."
        action={
          <button type="button" onClick={() => setModalOpen(true)} className={primaryBtn}>
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
            Add Branch
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Branches', value: String(items.length), icon: 'ri-store-2-line', tone: 'bg-primary-100 text-primary-700' },
          { label: 'Active Branches', value: String(active), icon: 'ri-checkbox-circle-line', tone: 'bg-secondary-100 text-secondary-700' },
          { label: 'Combined Month Sales', value: formatMoney(monthSales), icon: 'ri-money-dollar-circle-line', tone: 'bg-accent-100 text-accent-700' },
          { label: 'Total Staff', value: String(totalEmployees), icon: 'ri-team-line', tone: 'bg-primary-100 text-primary-700' },
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => (
          <div key={b.id} className="rounded-lg border border-background-200 bg-background-50 p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <i className="ri-store-2-line text-xl" />
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${b.status === 'active' ? 'bg-primary-100 text-primary-700' : 'bg-background-200 text-foreground-500'}`}>
                {b.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h3 className="mt-4 font-heading text-base font-bold text-foreground-950">{b.name}</h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground-600">
              <span className="flex h-4 w-4 items-center justify-center text-foreground-400"><i className="ri-map-pin-line" /></span>
              {b.location}
            </p>
            <div className="mt-4 space-y-1.5 text-sm text-foreground-600">
              <p className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center text-foreground-400"><i className="ri-user-star-line" /></span>
                Manager: {b.manager}
              </p>
              <p className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center text-foreground-400"><i className="ri-team-line" /></span>
                {b.employees} employees
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-background-200 pt-3">
              <div>
                <p className="text-xs text-foreground-500">Today</p>
                <p className="font-semibold text-foreground-950">{formatMoney(b.todaySales)}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-500">This month</p>
                <p className="font-semibold text-foreground-950">{formatMoney(b.monthSales)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Branch" subtitle="Create a new location for your business." size="md">
        <BranchForm initial={emptyForm} onCancel={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>
    </div>
  );
}

function BranchForm({ initial, onCancel, onSave }: { initial: FormState; onCancel: () => void; onSave: (f: FormState) => void }) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Branch name *</label>
        <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Nakuru Branch" />
      </div>
      <div>
        <label className={labelCls}>Location</label>
        <input className={inputCls} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Kenyatta Avenue, Nakuru" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Manager</label>
          <input className={inputCls} value={form.manager} onChange={(e) => set('manager', e.target.value)} placeholder="Manager name" />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+254 700 000 000" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className={ghostBtn}>Cancel</button>
        <button type="button" onClick={() => { if (form.name.trim()) onSave(form); }} className={primaryBtn}>Add Branch</button>
      </div>
    </div>
  );
}