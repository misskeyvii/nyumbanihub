import { useState } from 'react';
import { getDemoType, useSession } from '@/utils/session';
import {
  homeProperties,
  homeTenants,
  homeMaintenance,
  type Property,
} from '@/mocks/homes';
import { formatDate, formatMoney } from '@/utils/format';

type Tab = 'overview' | 'homes' | 'tenants' | 'maintenance';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'homes', label: 'My Homes', icon: 'ri-building-2-line' },
  { id: 'tenants', label: 'Tenants', icon: 'ri-user-line' },
  { id: 'maintenance', label: 'Maintenance', icon: 'ri-tools-line' },
];

const propertyTone: Record<Property['status'], string> = {
  Occupied: 'bg-primary-100 text-primary-700',
  Vacant: 'bg-secondary-100 text-secondary-700',
  Maintenance: 'bg-accent-100 text-accent-700',
};

const tenantTone: Record<string, string> = {
  Current: 'bg-primary-100 text-primary-700',
  Arrears: 'bg-accent-100 text-accent-700',
  Notice: 'bg-foreground-200 text-foreground-600',
};

const priorityTone: Record<string, string> = {
  Low: 'bg-secondary-100 text-secondary-700',
  Medium: 'bg-accent-100 text-accent-700',
  High: 'bg-accent-500 text-background-50',
};

const maintenanceTone: Record<string, string> = {
  Open: 'bg-accent-100 text-accent-700',
  'In progress': 'bg-primary-100 text-primary-700',
  Resolved: 'bg-secondary-100 text-secondary-700',
};

export default function Homes() {
  const session = useSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [properties, setProperties] = useState<Property[]>(homeProperties);

  const occupied = properties.filter((property) => property.status === 'Occupied').length;
  const vacant = properties.filter((property) => property.status === 'Vacant').length;
  const monthlyRent = properties.filter((p) => p.status === 'Occupied').reduce((sum, p) => sum + p.rent, 0);
  const outstanding = homeTenants.reduce((sum, tenant) => sum + tenant.balance, 0);

  const updateProperty = (id: string, patch: Partial<Property>) => {
    setProperties((prev) => prev.map((property) => (property.id === id ? { ...property, ...patch } : property)));
  };

  const stats = [
    { label: 'Properties', value: String(properties.length), sub: 'in your portfolio', icon: 'ri-building-2-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Occupied', value: String(occupied), sub: 'units rented out', icon: 'ri-home-5-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Vacant', value: String(vacant), sub: 'ready for tenants', icon: 'ri-key-2-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Rent Due', value: formatMoney(outstanding, 0), sub: 'outstanding balance', icon: 'ri-alert-line', tone: 'bg-accent-100 text-accent-700' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground-950">{session?.businessName || "Your Business"}</h1>
            <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-bold text-accent-800">Homes</span>
          </div>
          <p className="mt-1 text-sm text-foreground-500">
            Manage your properties, tenants and maintenance from one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTab('tenants')}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <span className="flex h-4 w-4 items-center justify-center">
            <i className="ri-user-line" />
          </span>
          View Tenants
        </button>
      </div>

      <div className="inline-flex w-full gap-1 overflow-x-auto rounded-full bg-background-100 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.id ? 'bg-foreground-950 text-background-50' : 'text-foreground-600 hover:text-foreground-950'
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <i className={item.icon} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-background-200 bg-background-50 p-4">
                <span className={`flex h-9 w-9 items-center justify-center rounded-md ${stat.tone}`}>
                  <i className={`${stat.icon} text-lg`} />
                </span>
                <p className="mt-3 font-heading text-2xl font-bold text-foreground-950">{stat.value}</p>
                <p className="mt-0.5 text-sm text-foreground-500">{stat.label}</p>
                <p className="text-xs text-foreground-400">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-background-200 bg-background-50 p-5 lg:col-span-2">
              <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Monthly Rent Roll</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                      <th className="px-3 py-2.5 font-medium">Property</th>
                      <th className="px-3 py-2.5 font-medium">Tenant</th>
                      <th className="px-3 py-2.5 text-right font-medium">Monthly Rent</th>
                      <th className="px-3 py-2.5 text-right font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeTenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                        <td className="px-3 py-3 text-foreground-600">{tenant.property}</td>
                        <td className="px-3 py-3 font-medium text-foreground-900">{tenant.name}</td>
                        <td className="px-3 py-3 text-right text-foreground-600">{formatMoney(tenant.rent, 0)}</td>
                        <td className="px-3 py-3 text-right">
                          <span className={tenant.balance > 0 ? 'font-semibold text-accent-700' : 'text-foreground-600'}>
                            {formatMoney(tenant.balance, 0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-foreground-500">
                Monthly collection: {formatMoney(monthlyRent, 0)} · Outstanding: {formatMoney(outstanding, 0)}
              </p>
            </div>

            <div className="rounded-lg border border-background-200 bg-background-50 p-5">
              <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Open Maintenance</h2>
              <div className="space-y-3">
                {homeMaintenance
                  .filter((request) => request.status !== 'Resolved')
                  .map((request) => (
                    <div key={request.id} className="rounded-md bg-background-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground-900">{request.property}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityTone[request.priority]}`}>
                          {request.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-foreground-500">{request.issue}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'homes' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div key={property.id} className="rounded-lg border border-background-200 bg-background-50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground-900">{property.name}</p>
                  <p className="text-xs text-foreground-500">
                    <i className="ri-map-pin-line mr-1 text-foreground-400" />
                    {property.location}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${propertyTone[property.status]}`}>
                  {property.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-foreground-500">{property.type} · {property.bedrooms} bedrooms</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-primary-700">{formatMoney(property.rent, 0)} / month</span>
                {property.tenant && <span className="text-xs text-foreground-500">{property.tenant}</span>}
              </div>
              <button
                type="button"
                onClick={() =>
                  updateProperty(property.id, {
                    status: property.status === 'Maintenance' ? 'Vacant' : 'Maintenance',
                    tenant: property.status === 'Maintenance' ? property.tenant : undefined,
                  })
                }
                className="mt-3 flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
              >
                <i className={property.status === 'Maintenance' ? 'ri-key-2-line' : 'ri-tools-line'} />
                {property.status === 'Maintenance' ? 'Mark vacant' : 'Start maintenance'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'tenants' && (
        <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                  <th className="px-5 py-3 font-medium">Tenant</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Property</th>
                  <th className="px-5 py-3 text-right font-medium">Rent</th>
                  <th className="px-5 py-3 text-right font-medium">Balance</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {homeTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-700">
                          {tenant.initials}
                        </span>
                        <span className="font-medium text-foreground-900">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground-600">{tenant.phone}</td>
                    <td className="px-5 py-3 text-foreground-600">{tenant.property}</td>
                    <td className="px-5 py-3 text-right text-foreground-600">{formatMoney(tenant.rent, 0)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'maintenance' && (
        <div className="space-y-3">
          {homeMaintenance.map((request) => (
            <div key={request.id} className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-700">
                  <i className="ri-tools-line text-lg" />
                </span>
                <div>
                  <p className="font-semibold text-foreground-900">{request.property}</p>
                  <p className="text-sm text-foreground-500">{request.issue}</p>
                  <p className="mt-0.5 text-xs text-foreground-400">Reported {formatDate(request.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityTone[request.priority]}`}>
                  {request.priority}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${maintenanceTone[request.status]}`}>
                  {request.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}