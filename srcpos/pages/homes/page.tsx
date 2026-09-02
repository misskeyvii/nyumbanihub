import { useState, useEffect } from 'react';
import { useSession } from '@/utils/session';
import { supabase } from '@/utils/supabaseClient';
import { formatDate, formatMoney } from '@/utils/format';
import Modal from '@/components/base/Modal';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

type Tab = 'overview' | 'homes' | 'tenants' | 'maintenance';

interface Property {
  id: string;
  property_id: string;
  name: string;
  location: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  status: 'Occupied' | 'Vacant' | 'Maintenance';
  tenant_name: string | null;
  notes: string | null;
}

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

interface MaintenanceRequest {
  id: string;
  maintenance_id: string;
  property_id: string;
  tenant_id: string | null;
  issue: string;
  description: string | null;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  reported_date: string;
  resolved_date: string | null;
  cost: number;
  notes: string | null;
}

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
  Former: 'bg-foreground-200 text-foreground-600',
};

const priorityTone: Record<string, string> = {
  Low: 'bg-secondary-100 text-secondary-700',
  Medium: 'bg-accent-100 text-accent-700',
  High: 'bg-accent-500 text-background-50',
};

const maintenanceTone: Record<string, string> = {
  Open: 'bg-accent-100 text-accent-700',
  'In Progress': 'bg-primary-100 text-primary-700',
  Resolved: 'bg-secondary-100 text-secondary-700',
};

export default function Homes() {
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([
        loadProperties(),
        loadTenants(),
        loadMaintenance(),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProperties() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_properties')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (data) {
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
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

      if (data) {
        setTenants(data);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  }

  async function loadMaintenance() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_maintenance')
        .select('*')
        .eq('user_id', user.id)
        .order('reported_date', { ascending: false });

      if (data) {
        setMaintenance(data);
      }
    } catch (error) {
      console.error('Failed to load maintenance:', error);
    }
  }

  async function saveProperty(formData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingProperty) {
        await supabase
          .from('pos_properties')
          .update({
            name: formData.name,
            location: formData.location,
            property_type: formData.property_type,
            bedrooms: Number(formData.bedrooms),
            bathrooms: Number(formData.bathrooms),
            rent: Number(formData.rent),
            status: formData.status,
            notes: formData.notes,
          })
          .eq('id', editingProperty.id);
      } else {
        await supabase
          .from('pos_properties')
          .insert({
            user_id: user.id,
            property_id: `prop-${Date.now()}`,
            name: formData.name,
            location: formData.location,
            property_type: formData.property_type,
            bedrooms: Number(formData.bedrooms),
            bathrooms: Number(formData.bathrooms),
            rent: Number(formData.rent),
            status: formData.status || 'Vacant',
            notes: formData.notes,
          });
      }

      await loadProperties();
      setPropertyModalOpen(false);
      setEditingProperty(null);
    } catch (error) {
      console.error('Failed to save property:', error);
      alert('Failed to save property. Please try again.');
    }
  }

  async function saveTenant(formData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get property name if property_id is provided
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
      setTenantModalOpen(false);
      setEditingTenant(null);
    } catch (error) {
      console.error('Failed to save tenant:', error);
      alert('Failed to save tenant. Please try again.');
    }
  }

  async function updatePropertyStatus(id: string, newStatus: Property['status']) {
    try {
      await supabase
        .from('pos_properties')
        .update({ status: newStatus })
        .eq('id', id);

      await loadProperties();
    } catch (error) {
      console.error('Failed to update property:', error);
    }
  }

  const occupied = properties.filter((property) => property.status === 'Occupied').length;
  const vacant = properties.filter((property) => property.status === 'Vacant').length;
  const monthlyRent = properties.filter((p) => p.status === 'Occupied').reduce((sum, p) => sum + p.rent, 0);
  const outstanding = tenants.reduce((sum, tenant) => sum + tenant.balance, 0);

  const stats = [
    { label: 'Properties', value: loading ? '...' : String(properties.length), sub: 'in your portfolio', icon: 'ri-building-2-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Occupied', value: loading ? '...' : String(occupied), sub: 'units rented out', icon: 'ri-home-5-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Vacant', value: loading ? '...' : String(vacant), sub: 'ready for tenants', icon: 'ri-key-2-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Rent Due', value: loading ? '...' : formatMoney(outstanding, 0), sub: 'outstanding balance', icon: 'ri-alert-line', tone: 'bg-accent-100 text-accent-700' },
  ];

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground-950">{session?.businessName || "Property Management"}</h1>
            <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-bold text-accent-800">Landlord</span>
          </div>
          <p className="mt-1 text-sm text-foreground-500">
            Manage your properties, tenants and maintenance from one place.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setEditingProperty(null); setPropertyModalOpen(true); }}
            className={ghostBtn}
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <i className="ri-add-line" />
            </span>
            Add Property
          </button>
          <button
            type="button"
            onClick={() => { setEditingTenant(null); setTenantModalOpen(true); }}
            className={primaryBtn}
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <i className="ri-user-add-line" />
            </span>
            Add Tenant
          </button>
        </div>
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
              {loading ? (
                <div className="py-8 text-center text-sm text-foreground-500">Loading...</div>
              ) : tenants.length === 0 ? (
                <div className="py-8 text-center text-sm text-foreground-500">No tenants yet. Add your first tenant to get started.</div>
              ) : (
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
                      {tenants.map((tenant) => (
                        <tr key={tenant.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                          <td className="px-3 py-3 text-foreground-600">{tenant.property_name || '—'}</td>
                          <td className="px-3 py-3 font-medium text-foreground-900">{tenant.name}</td>
                          <td className="px-3 py-3 text-right text-foreground-600">{formatMoney(tenant.rent_amount, 0)}</td>
                          <td className="px-3 py-3 text-right">
                            <span className={tenant.balance > 0 ? 'font-semibold text-accent-700' : 'text-foreground-600'}>
                              {formatMoney(tenant.balance, 0)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-3 text-xs text-foreground-500">
                    Monthly collection: {formatMoney(monthlyRent, 0)} · Outstanding: {formatMoney(outstanding, 0)}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-background-200 bg-background-50 p-5">
              <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Open Maintenance</h2>
              {loading ? (
                <div className="py-8 text-center text-sm text-foreground-500">Loading...</div>
              ) : maintenance.filter((r) => r.status !== 'Resolved').length === 0 ? (
                <div className="py-8 text-center text-sm text-foreground-500">No open maintenance requests</div>
              ) : (
                <div className="space-y-3">
                  {maintenance
                    .filter((request) => request.status !== 'Resolved')
                    .slice(0, 5)
                    .map((request) => (
                      <div key={request.id} className="rounded-md bg-background-100 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground-900">{getPropertyName(request.property_id)}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityTone[request.priority]}`}>
                            {request.priority}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-foreground-500">{request.issue}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'homes' && (
        <>
          {loading ? (
            <div className="py-12 text-center text-sm text-foreground-500">Loading properties...</div>
          ) : properties.length === 0 ? (
            <div className="rounded-lg border border-background-200 bg-background-50 p-12 text-center">
              <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary-100 text-primary-700 mb-4">
                <i className="ri-building-2-line text-2xl" />
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground-950">No properties yet</h3>
              <p className="mt-1 text-sm text-foreground-500 mb-4">Add your first property to get started</p>
              <button
                type="button"
                onClick={() => { setEditingProperty(null); setPropertyModalOpen(true); }}
                className={primaryBtn}
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  <i className="ri-add-line" />
                </span>
                Add Property
              </button>
            </div>
          ) : (
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
                  <p className="mt-2 text-xs text-foreground-500">{property.property_type} · {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary-700">{formatMoney(property.rent, 0)} / month</span>
                    {property.tenant_name && <span className="text-xs text-foreground-500">{property.tenant_name}</span>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditingProperty(property); setPropertyModalOpen(true); }}
                      className="flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
                    >
                      <i className="ri-edit-line" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updatePropertyStatus(property.id, property.status === 'Maintenance' ? 'Vacant' : 'Maintenance')
                      }
                      className="flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
                    >
                      <i className={property.status === 'Maintenance' ? 'ri-key-2-line' : 'ri-tools-line'} />
                      {property.status === 'Maintenance' ? 'Available' : 'Maintenance'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'tenants' && (
        <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
          {loading ? (
            <div className="py-12 text-center text-sm text-foreground-500">Loading tenants...</div>
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center">
              <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary-100 text-primary-700 mb-4">
                <i className="ri-user-line text-2xl" />
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground-950">No tenants yet</h3>
              <p className="mt-1 text-sm text-foreground-500 mb-4">Add your first tenant to get started</p>
              <button
                type="button"
                onClick={() => { setEditingTenant(null); setTenantModalOpen(true); }}
                className={primaryBtn}
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  <i className="ri-user-add-line" />
                </span>
                Add Tenant
              </button>
            </div>
          ) : (
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
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
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
                            onClick={() => { setEditingTenant(tenant); setTenantModalOpen(true); }}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 hover:text-foreground-900"
                            title="Edit"
                          >
                            <i className="ri-edit-line" />
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
      )}

      {tab === 'maintenance' && (
        <>
          {loading ? (
            <div className="py-12 text-center text-sm text-foreground-500">Loading maintenance requests...</div>
          ) : maintenance.length === 0 ? (
            <div className="rounded-lg border border-background-200 bg-background-50 p-12 text-center">
              <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-secondary-100 text-secondary-700 mb-4">
                <i className="ri-tools-line text-2xl" />
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground-950">No maintenance requests</h3>
              <p className="mt-1 text-sm text-foreground-500">All properties are in good condition</p>
            </div>
          ) : (
            <div className="space-y-3">
              {maintenance.map((request) => (
                <div key={request.id} className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-700">
                      <i className="ri-tools-line text-lg" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground-900">{getPropertyName(request.property_id)}</p>
                      <p className="text-sm text-foreground-500">{request.issue}</p>
                      <p className="mt-0.5 text-xs text-foreground-400">Reported {formatDate(request.reported_date)}</p>
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
        </>
      )}

      {/* Property Modal */}
      <Modal open={propertyModalOpen} onClose={() => setPropertyModalOpen(false)} title={editingProperty ? 'Edit Property' : 'Add Property'} size="lg">
        <PropertyForm
          initial={editingProperty}
          onCancel={() => setPropertyModalOpen(false)}
          onSave={saveProperty}
        />
      </Modal>

      {/* Tenant Modal */}
      <Modal open={tenantModalOpen} onClose={() => setTenantModalOpen(false)} title={editingTenant ? 'Edit Tenant' : 'Add Tenant'} size="lg">
        <TenantForm
          initial={editingTenant}
          properties={properties}
          onCancel={() => setTenantModalOpen(false)}
          onSave={saveTenant}
        />
      </Modal>
    </div>
  );
}

function PropertyForm({ initial, onCancel, onSave }: { initial: Property | null; onCancel: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    location: initial?.location || '',
    property_type: initial?.property_type || 'Apartment',
    bedrooms: initial?.bedrooms || 2,
    bathrooms: initial?.bathrooms || 1,
    rent: initial?.rent || 0,
    status: initial?.status || 'Vacant',
    notes: initial?.notes || '',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Property Name *</label>
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Apartment 1A" />
        </div>
        <div>
          <label className={labelCls}>Location *</label>
          <input className={inputCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Westlands, Nairobi" />
        </div>
        <div>
          <label className={labelCls}>Property Type</label>
          <select className={inputCls} value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Studio">Studio</option>
            <option value="Bedsitter">Bedsitter</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Monthly Rent (KSh) *</label>
          <input type="number" className={inputCls} value={form.rent} onChange={(e) => setForm({ ...form, rent: Number(e.target.value) })} placeholder="45000" />
        </div>
        <div>
          <label className={labelCls}>Bedrooms</label>
          <input type="number" className={inputCls} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })} />
        </div>
        <div>
          <label className={labelCls}>Bathrooms</label>
          <input type="number" className={inputCls} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Status</label>
        <div className="flex gap-2">
          {(['Vacant', 'Occupied', 'Maintenance'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, status: s })}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                form.status === s ? 'bg-foreground-950 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Notes</label>
        <textarea className={inputCls} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional details..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={ghostBtn}>Cancel</button>
        <button
          type="button"
          onClick={() => {
            if (form.name && form.location && form.rent > 0) onSave(form);
          }}
          className={primaryBtn}
        >
          Save Property
        </button>
      </div>
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
