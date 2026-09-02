import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { formatMoney } from '@/utils/format';
import Modal from '@/components/base/Modal';
import PageHeader from '@/components/base/PageHeader';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

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

const propertyTone: Record<Property['status'], string> = {
  Occupied: 'bg-primary-100 text-primary-700',
  Vacant: 'bg-secondary-100 text-secondary-700',
  Maintenance: 'bg-accent-100 text-accent-700',
};

export default function LandlordProperties() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
      setModalOpen(false);
      setEditingProperty(null);
    } catch (error) {
      console.error('Failed to save property:', error);
      alert('Failed to save property. Please try again.');
    }
  }

  async function deleteProperty(id: string) {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await supabase
        .from('pos_properties')
        .delete()
        .eq('id', id);

      await loadProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Failed to delete property. Please try again.');
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

  const stockValue = properties.reduce((sum, p) => sum + p.rent, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="My Properties"
        subtitle="Manage all your rental properties and units."
        action={
          <button
            type="button"
            onClick={() => { setEditingProperty(null); setModalOpen(true); }}
            className={primaryBtn}
          >
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
            Add Property
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-700">
            <i className="ri-building-2-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : String(properties.length)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Total Properties</p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary-100 text-secondary-700">
            <i className="ri-home-5-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : String(properties.filter(p => p.status === 'Occupied').length)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Occupied</p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary-100 text-secondary-700">
            <i className="ri-key-2-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : String(properties.filter(p => p.status === 'Vacant').length)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Vacant</p>
        </div>
      </div>

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
            onClick={() => { setEditingProperty(null); setModalOpen(true); }}
            className={primaryBtn}
          >
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
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
                  onClick={() => { setEditingProperty(property); setModalOpen(true); }}
                  className="flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
                >
                  <i className="ri-edit-line" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteProperty(property.id)}
                  className="flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-accent-100 hover:text-accent-700"
                >
                  <i className="ri-delete-bin-line" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingProperty ? 'Edit Property' : 'Add Property'} size="lg">
        <PropertyForm
          initial={editingProperty}
          onCancel={() => setModalOpen(false)}
          onSave={saveProperty}
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
