import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { formatDate, formatMoney } from '@/utils/format';
import Modal from '@/components/base/Modal';
import PageHeader from '@/components/base/PageHeader';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

interface MaintenanceRequest {
  id: string;
  maintenance_id: string;
  property_id: string;
  property_name: string;
  issue: string;
  description: string | null;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  reported_date: string;
  resolved_date: string | null;
  cost: number;
  notes: string | null;
}

interface Property {
  id: string;
  name: string;
}

const priorityTone: Record<string, string> = {
  Low: 'bg-secondary-100 text-secondary-700',
  Medium: 'bg-accent-100 text-accent-700',
  High: 'bg-accent-500 text-background-50',
};

const statusTone: Record<string, string> = {
  Open: 'bg-accent-100 text-accent-700',
  'In Progress': 'bg-primary-100 text-primary-700',
  Resolved: 'bg-secondary-100 text-secondary-700',
};

export default function LandlordMaintenance() {
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([loadMaintenance(), loadProperties()]);
    } finally {
      setLoading(false);
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

      if (data) setMaintenance(data);
    } catch (error) {
      console.error('Failed to load maintenance:', error);
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

  async function saveMaintenance(formData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const property = properties.find(p => p.id === formData.property_id);
      const propertyName = property?.name || 'Unknown';

      if (editingRequest) {
        await supabase
          .from('pos_maintenance')
          .update({
            property_id: formData.property_id,
            property_name: propertyName,
            issue: formData.issue,
            description: formData.description,
            priority: formData.priority,
            status: formData.status,
            cost: Number(formData.cost),
            notes: formData.notes,
            resolved_date: formData.status === 'Resolved' ? new Date().toISOString() : null,
          })
          .eq('id', editingRequest.id);
      } else {
        await supabase
          .from('pos_maintenance')
          .insert({
            user_id: user.id,
            maintenance_id: `mnt-${Date.now()}`,
            property_id: formData.property_id,
            property_name: propertyName,
            issue: formData.issue,
            description: formData.description,
            priority: formData.priority || 'Medium',
            status: formData.status || 'Open',
            cost: Number(formData.cost) || 0,
            notes: formData.notes,
          });
      }

      await loadMaintenance();
      setModalOpen(false);
      setEditingRequest(null);
    } catch (error) {
      console.error('Failed to save maintenance request:', error);
      alert('Failed to save maintenance request. Please try again.');
    }
  }

  async function deleteMaintenance(id: string) {
    if (!window.confirm('Are you sure you want to delete this maintenance request?')) return;
    
    try {
      await supabase
        .from('pos_maintenance')
        .delete()
        .eq('id', id);

      await loadMaintenance();
    } catch (error) {
      console.error('Failed to delete maintenance request:', error);
      alert('Failed to delete maintenance request. Please try again.');
    }
  }

  const filtered = maintenance.filter(m => filterStatus === 'All' || m.status === filterStatus);
  const openCount = maintenance.filter(m => m.status === 'Open').length;
  const inProgressCount = maintenance.filter(m => m.status === 'In Progress').length;
  const totalCost = maintenance.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Maintenance Requests"
        subtitle="Track and manage all maintenance issues for your properties."
        action={
          <button
            type="button"
            onClick={() => { setEditingRequest(null); setModalOpen(true); }}
            className={primaryBtn}
          >
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
            Report Issue
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-100 text-accent-700">
            <i className="ri-alert-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : String(openCount)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Open Issues</p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-700">
            <i className="ri-tools-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : String(inProgressCount)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">In Progress</p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary-100 text-secondary-700">
            <i className="ri-wallet-line text-lg" />
          </span>
          <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{loading ? '...' : formatMoney(totalCost, 0)}</p>
          <p className="mt-0.5 text-sm text-foreground-500">Total Costs</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filterStatus === s
                ? 'bg-primary-500 text-background-50'
                : 'bg-background-100 text-foreground-600 hover:bg-background-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-foreground-500">Loading maintenance requests...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-background-200 bg-background-50 p-12 text-center">
          <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-secondary-100 text-secondary-700 mb-4">
            <i className="ri-tools-line text-2xl" />
          </span>
          <h3 className="font-heading text-lg font-bold text-foreground-950">No maintenance requests</h3>
          <p className="mt-1 text-sm text-foreground-500">All properties are in good condition</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => (
            <div key={request.id} className="flex flex-col gap-3 rounded-lg border border-background-200 bg-background-50 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary-100 text-secondary-700">
                  <i className="ri-tools-line text-lg" />
                </span>
                <div>
                  <p className="font-semibold text-foreground-900">{request.property_name}</p>
                  <p className="text-sm text-foreground-500">{request.issue}</p>
                  {request.description && <p className="mt-1 text-xs text-foreground-400">{request.description}</p>}
                  <p className="mt-1 text-xs text-foreground-400">Reported {formatDate(request.reported_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityTone[request.priority]}`}>
                  {request.priority}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[request.status]}`}>
                  {request.status}
                </span>
                <button
                  type="button"
                  onClick={() => { setEditingRequest(request); setModalOpen(true); }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 hover:text-foreground-900"
                  title="Edit"
                >
                  <i className="ri-edit-line" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteMaintenance(request.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-accent-100 hover:text-accent-700"
                  title="Delete"
                >
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingRequest ? 'Edit Request' : 'Report Issue'} size="lg">
        <MaintenanceForm
          initial={editingRequest}
          properties={properties}
          onCancel={() => setModalOpen(false)}
          onSave={saveMaintenance}
        />
      </Modal>
    </div>
  );
}

function MaintenanceForm({ initial, properties, onCancel, onSave }: { initial: MaintenanceRequest | null; properties: Property[]; onCancel: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    property_id: initial?.property_id || '',
    issue: initial?.issue || '',
    description: initial?.description || '',
    priority: initial?.priority || 'Medium',
    status: initial?.status || 'Open',
    cost: initial?.cost || 0,
    notes: initial?.notes || '',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <label className={labelCls}>Issue Type *</label>
          <input className={inputCls} value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="e.g. Broken water pipe" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed description of the issue..." />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Priority</label>
          <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Estimated Cost (KSh)</label>
          <input type="number" className={inputCls} value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} placeholder="0" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Notes</label>
        <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={ghostBtn}>Cancel</button>
        <button
          type="button"
          onClick={() => {
            if (form.property_id && form.issue) onSave(form);
          }}
          className={primaryBtn}
        >
          Save Request
        </button>
      </div>
    </div>
  );
}
