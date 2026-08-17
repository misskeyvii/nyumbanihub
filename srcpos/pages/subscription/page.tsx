import { useState } from 'react';
import PageHeader from '@/components/base/PageHeader';
import { plans, currentSubscription } from '@/mocks/subscription';
import { currentBusiness } from '@/mocks/business';
import { formatMoney } from '@/utils/format';
import { primaryBtn, ghostBtn } from '@/utils/ui';

function UsageBar({ label, used, limit, unit }: { label: string; used: number; limit: number; unit: string }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-foreground-700">{label}</span>
        <span className="font-semibold text-foreground-950">
          {used} / {limit} {unit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-background-200">
        <div className={`h-2 rounded-full ${pct >= 100 ? 'bg-accent-500' : 'bg-primary-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Subscription() {
  const [selected, setSelected] = useState(currentSubscription.plan);
  const sub = currentSubscription;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Subscription"
        subtitle="Manage your Nyumbani Link POS plan and billing."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1.5 text-sm font-semibold text-primary-700">
            <i className="ri-checkbox-circle-line" />
            {sub.status}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground-400">Current Plan</p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-950">{sub.plan}</h2>
              <p className="text-sm text-foreground-500">
                {formatMoney(sub.price)} {sub.billingCycle.toLowerCase()} · {currentBusiness.name}
              </p>
            </div>
            <button type="button" className={ghostBtn}>
              <span className="flex h-4 w-4 items-center justify-center"><i className="ri-refresh-line" /></span>
              Manage Plan
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <UsageBar label="User accounts" used={sub.users.used} limit={sub.users.limit} unit="users" />
            <UsageBar label="Branches" used={sub.branches.used} limit={sub.branches.limit} unit="branches" />
            <UsageBar label="Storage" used={sub.storage.used} limit={sub.storage.limit} unit="GB" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-background-200 pt-5 sm:grid-cols-2">
            <div className="rounded-md bg-background-100 p-3">
              <p className="text-xs text-foreground-500">Started</p>
              <p className="text-sm font-semibold text-foreground-900">
                {new Date(`${sub.startDate}T00:00:00`).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="rounded-md bg-background-100 p-3">
              <p className="text-xs text-foreground-500">Renews on</p>
              <p className="text-sm font-semibold text-foreground-900">
                {new Date(`${sub.expiryDate}T00:00:00`).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-background-200 bg-background-50 p-4">
            <p className="text-sm font-semibold text-foreground-900">Payment method</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground-600">
              <span className="flex h-5 w-5 items-center justify-center text-primary-600"><i className="ri-smartphone-line" /></span>
              {sub.paymentMethod}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-background-200 bg-background-50 p-6">
          <h2 className="font-heading text-base font-bold text-foreground-950">Plan Overview</h2>
          <p className="mb-4 text-xs text-foreground-500">What's included in your plan</p>
          <ul className="space-y-2.5">
            {plans
              .find((p) => p.name === sub.plan)
              ?.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground-700">
                  <span className="mt-0.5 flex h-4 w-4 items-center justify-center text-primary-600"><i className="ri-check-line" /></span>
                  {f}
                </li>
              ))}
          </ul>
          <div className="mt-5 rounded-md bg-accent-100 p-3 text-xs text-accent-800">
            Need more? Upgrade or contact Nyumbani Link support to tailor a plan for your business.
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Available Plans</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border p-5 transition-colors ${
                selected === plan.name ? 'border-primary-400 bg-background-50' : 'border-background-200 bg-background-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-foreground-950">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-semibold text-accent-700">Popular</span>
                )}
              </div>
              <p className="mt-3 font-heading text-2xl font-bold text-foreground-950">
                {formatMoney(plan.price)}
                <span className="text-sm font-normal text-foreground-500"> {plan.period}</span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground-600">
                    <span className="mt-0.5 flex h-4 w-4 items-center justify-center text-primary-600"><i className="ri-check-line" /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setSelected(plan.name)}
                className={`mt-5 w-full ${selected === plan.name ? ghostBtn : primaryBtn}`}
              >
                {selected === plan.name ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
