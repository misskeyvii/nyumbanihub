import { useState } from 'react';
import PageHeader from '@/components/base/PageHeader';
import { currentBusiness } from '@/mocks/business';
import { inputCls, labelCls, primaryBtn } from '@/utils/ui';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary-500' : 'bg-background-300'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background-50 transition-all ${checked ? 'left-0.5 translate-x-5' : 'left-0.5'}`} />
    </button>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-5">
      <h2 className="font-heading text-base font-bold text-foreground-950">{title}</h2>
      <p className="mb-4 text-xs text-foreground-500">{subtitle}</p>
      {children}
    </div>
  );
}

export default function Settings() {
  const [saved, setSaved] = useState('');
  const [business, setBusiness] = useState({
    name: currentBusiness.name,
    phone: currentBusiness.phone,
    email: currentBusiness.email,
    address: currentBusiness.address,
    currency: currentBusiness.currency,
    type: currentBusiness.type,
  });
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState('16');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for shopping with us!');
  const [methods, setMethods] = useState({ mpesa: true, cash: true, card: true, bank: false });
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [notifications, setNotifications] = useState({ sales: true, subscription: true, employees: false });

  const save = (label: string) => {
    setSaved(label);
    window.setTimeout(() => setSaved(''), 2200);
  };

  const setBiz = (key: keyof typeof business, value: string) => setBusiness((b) => ({ ...b, [key]: value }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure your business details, receipts, taxes, and alerts."
        action={
          saved ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1.5 text-sm font-semibold text-primary-700">
              <i className="ri-check-line" />
              {saved} saved
            </span>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Business Information" subtitle="How your business appears on receipts and invoices.">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Business name</label>
              <input className={inputCls} value={business.name} onChange={(e) => setBiz('name', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={business.phone} onChange={(e) => setBiz('phone', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} value={business.email} onChange={(e) => setBiz('email', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input className={inputCls} value={business.address} onChange={(e) => setBiz('address', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Currency</label>
                <select className={inputCls} value={business.currency} onChange={(e) => setBiz('currency', e.target.value)}>
                  <option value="KES">KES — Kenyan Shilling</option>
                  <option value="UGX">UGX — Uganda Shilling</option>
                  <option value="TZS">TZS — Tanzania Shilling</option>
                  <option value="USD">USD — US Dollar</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Business type</label>
                <input className={inputCls} value={business.type} onChange={(e) => setBiz('type', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => save('Business info')} className={primaryBtn}>Save Changes</button>
            </div>
          </div>
        </Section>

        <Section title="Tax Settings" subtitle="Apply tax automatically to your sales.">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md bg-background-100 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground-900">Enable VAT</p>
                <p className="text-xs text-foreground-500">Add tax to every sale</p>
              </div>
              <Toggle checked={taxEnabled} onChange={() => setTaxEnabled((v) => !v)} />
            </div>
            {taxEnabled && (
              <div>
                <label className={labelCls}>Tax rate (%)</label>
                <input type="number" className={inputCls} value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
              </div>
            )}
            <div>
              <label className={labelCls}>Receipt footer message</label>
              <textarea
                className="h-24 w-full rounded-md border border-background-200 bg-background-50 px-3 py-2 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                value={receiptFooter}
                maxLength={120}
                onChange={(e) => setReceiptFooter(e.target.value)}
              />
              <p className="mt-1 text-right text-xs text-foreground-400">{receiptFooter.length}/120</p>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => save('Tax settings')} className={primaryBtn}>Save Changes</button>
            </div>
          </div>
        </Section>

        <Section title="Payment Methods" subtitle="Choose how customers can pay at checkout.">
          <div className="space-y-3">
            {(
              [
                { key: 'mpesa', label: 'M-PESA', desc: 'STK push & till number' },
                { key: 'cash', label: 'Cash', desc: 'Standard cash payments' },
                { key: 'card', label: 'Card', desc: 'Credit & debit cards' },
                { key: 'bank', label: 'Bank', desc: 'Bank transfer' },
              ] as const
            ).map((m) => (
              <div key={m.key} className="flex items-center justify-between rounded-md bg-background-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground-900">{m.label}</p>
                  <p className="text-xs text-foreground-500">{m.desc}</p>
                </div>
                <Toggle checked={methods[m.key]} onChange={() => setMethods((prev) => ({ ...prev, [m.key]: !prev[m.key] }))} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Notifications & Alerts" subtitle="Control what updates you receive.">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md bg-background-100 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground-900">Low stock alerts</p>
                <p className="text-xs text-foreground-500">Notify when stock is low or out</p>
              </div>
              <Toggle checked={lowStockAlerts} onChange={() => setLowStockAlerts((v) => !v)} />
            </div>
            <div className="flex items-center justify-between rounded-md bg-background-100 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground-900">Daily sales summary</p>
                <p className="text-xs text-foreground-500">Send a sales digest each day</p>
              </div>
              <Toggle checked={notifications.sales} onChange={() => setNotifications((prev) => ({ ...prev, sales: !prev.sales }))} />
            </div>
            <div className="flex items-center justify-between rounded-md bg-background-100 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground-900">Subscription updates</p>
                <p className="text-xs text-foreground-500">Renewal and plan changes</p>
              </div>
              <Toggle checked={notifications.subscription} onChange={() => setNotifications((prev) => ({ ...prev, subscription: !prev.subscription }))} />
            </div>
            <div className="flex items-center justify-between rounded-md bg-background-100 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground-900">Employee activity</p>
                <p className="text-xs text-foreground-500">New logins & account changes</p>
              </div>
              <Toggle checked={notifications.employees} onChange={() => setNotifications((prev) => ({ ...prev, employees: !prev.employees }))} />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}