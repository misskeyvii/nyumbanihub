import { useState } from 'react';
import PageHeader from '@/components/base/PageHeader';
import Modal from '@/components/base/Modal';
import { expenses as seedExpenses, expenseCategories, type Expense } from '@/mocks/expenses';
import { formatMoney, formatDate } from '@/utils/format';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

interface FormState {
  date: string;
  category: string;
  description: string;
  amount: string;
  paymentMethod: string;
}

const emptyForm: FormState = {
  date: new Date().toISOString().slice(0, 10),
  category: expenseCategories[0],
  description: '',
  amount: '',
  paymentMethod: 'M-PESA',
};

export default function Expenses() {
  const [items, setItems] = useState<Expense[]>(seedExpenses);
  const [category, setCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = category === 'All' ? items : items.filter((e) => e.category === category);

  const total = items.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenseCategories.map((c) => ({
    category: c,
    total: items.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  const handleSave = (form: FormState) => {
    const data: Expense = {
      id: `ex-${Date.now()}`,
      date: new Date(form.date).toISOString(),
      category: form.category,
      description: form.description.trim() || form.category,
      amount: Number(form.amount) || 0,
      addedBy: 'Grace Wanjiru',
      paymentMethod: form.paymentMethod,
    };
    setItems((prev) => [data, ...prev]);
    setModalOpen(false);
  };

  const maxCategoryTotal = Math.max(...byCategory.map((c) => c.total), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Expenses"
        subtitle="Record and track every cost of running your business."
        action={
          <button type="button" onClick={() => setModalOpen(true)} className={primaryBtn}>
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
            Add Expense
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total This Month', value: formatMoney(total), icon: 'ri-wallet-line', tone: 'bg-primary-100 text-primary-700' },
          { label: 'Expenses Recorded', value: String(items.length), icon: 'ri-receipt-line', tone: 'bg-secondary-100 text-secondary-700' },
          { label: 'Top Category', value: byCategory[0]?.category || '—', icon: 'ri-bar-chart-line', tone: 'bg-accent-100 text-accent-700' },
          { label: 'Avg Per Day', value: formatMoney(Math.round(total / 13)), icon: 'ri-time-line', tone: 'bg-primary-100 text-primary-700' },
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 p-5">
          <h2 className="font-heading text-base font-bold text-foreground-950">By Category</h2>
          <p className="mb-4 text-xs text-foreground-500">Where your money is going</p>
          <div className="space-y-3">
            {byCategory.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground-700">{c.category}</span>
                  <span className="font-semibold text-foreground-950">{formatMoney(c.total)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-background-200">
                  <div className="h-2 rounded-full bg-primary-500" style={{ width: `${(c.total / maxCategoryTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-background-200 bg-background-50 lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-background-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-heading text-base font-bold text-foreground-950">All Expenses</h2>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none">
              <option value="All">All categories</option>
              {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                    <td className="px-5 py-3 text-foreground-600">{formatDate(e.date)}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground-900">{e.description}</p>
                      <p className="text-xs text-foreground-500">by {e.addedBy}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700">{e.category}</span>
                    </td>
                    <td className="px-5 py-3 text-foreground-600">{e.paymentMethod}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground-950">{formatMoney(e.amount)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-foreground-500">No expenses in this category.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense" subtitle="Record a new business cost." size="md">
        <ExpenseForm initial={emptyForm} onCancel={() => setModalOpen(false)} onSave={handleSave} />
      </Modal>
    </div>
  );
}

function ExpenseForm({ initial, onCancel, onSave }: { initial: FormState; onCancel: () => void; onSave: (f: FormState) => void }) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" className={inputCls} value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)}>
            {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <input className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="e.g. Shop rent - August" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Amount (KSh) *</label>
          <input type="number" className={inputCls} value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="2500" />
        </div>
        <div>
          <label className={labelCls}>Payment method</label>
          <select className={inputCls} value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
            {['M-PESA', 'Cash', 'Card', 'Bank'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className={ghostBtn}>Cancel</button>
        <button type="button" onClick={() => { if (form.amount) onSave(form); }} className={primaryBtn}>Save Expense</button>
      </div>
    </div>
  );
}