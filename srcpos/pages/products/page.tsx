import { useState, useEffect } from 'react';
import PageHeader from '@/components/base/PageHeader';
import Modal from '@/components/base/Modal';
import { supabase } from '@/utils/supabaseClient';
import { formatMoney } from '@/utils/format';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

interface Product {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  barcode: string;
  category_id: string;
  brand: string;
  buying_price: number;
  selling_price: number;
  stock: number;
  min_stock: number;
  supplier: string;
  status: 'active' | 'inactive';
}

interface Category {
  id: string;
  category_id: string;
  name: string;
}

interface FormState {
  name: string;
  sku: string;
  barcode: string;
  category_id: string;
  brand: string;
  buyingPrice: string;
  sellingPrice: string;
  stock: string;
  minStock: string;
  supplier: string;
  status: 'active' | 'inactive';
}

const emptyForm: FormState = {
  name: '',
  sku: '',
  barcode: '',
  category_id: '',
  brand: '',
  buyingPrice: '',
  sellingPrice: '',
  stock: '0',
  minStock: '10',
  supplier: '',
  status: 'active',
};

const toForm = (p: Product): FormState => ({
  name: p.name,
  sku: p.sku === '—' ? '' : p.sku,
  barcode: p.barcode === '—' ? '' : p.barcode,
  category_id: p.category_id,
  brand: p.brand === '—' ? '' : p.brand,
  buyingPrice: String(p.buying_price),
  sellingPrice: String(p.selling_price),
  stock: String(p.stock),
  minStock: String(p.min_stock),
  supplier: p.supplier || '',
  status: p.status,
});

function ProductForm({
  initial,
  onCancel,
  onSave,
  categories,
}: {
  initial: FormState;
  onCancel: () => void;
  onSave: (f: FormState) => void;
  categories: Category[];
}) {
  const [form, setForm] = useState<FormState>(initial);
  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }) as FormState);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Product name *</label>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Coca Cola 500ml" />
        </div>
        <div>
          <label className={labelCls}>Category *</label>
          <select className={inputCls} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>SKU</label>
          <input className={inputCls} value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="BEV-001" />
        </div>
        <div>
          <label className={labelCls}>Barcode</label>
          <input className={inputCls} value={form.barcode} onChange={(e) => set('barcode', e.target.value)} placeholder="5449000000996" />
        </div>
        <div>
          <label className={labelCls}>Brand</label>
          <input className={inputCls} value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Coca Cola" />
        </div>
        <div>
          <label className={labelCls}>Supplier</label>
          <input className={inputCls} value={form.supplier} onChange={(e) => set('supplier', e.target.value)} placeholder="Supplier name" />
        </div>
        <div>
          <label className={labelCls}>Buying price (KSh)</label>
          <input type="number" className={inputCls} value={form.buyingPrice} onChange={(e) => set('buyingPrice', e.target.value)} placeholder="45" />
        </div>
        <div>
          <label className={labelCls}>Selling price (KSh) *</label>
          <input type="number" className={inputCls} value={form.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)} placeholder="60" />
        </div>
        <div>
          <label className={labelCls}>Stock quantity</label>
          <input type="number" className={inputCls} value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="100" />
        </div>
        <div>
          <label className={labelCls}>Minimum stock</label>
          <input type="number" className={inputCls} value={form.minStock} onChange={(e) => set('minStock', e.target.value)} placeholder="20" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Status</label>
        <div className="flex gap-2">
          {(['active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set('status', s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                form.status === s ? 'bg-foreground-950 text-background-50' : 'bg-background-100 text-foreground-600 hover:bg-background-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={ghostBtn}>Cancel</button>
        <button
          type="button"
          onClick={() => {
            if (form.name.trim() && form.sellingPrice && form.category_id) onSave(form);
          }}
          className={primaryBtn}
        >
          Save Product
        </button>
      </div>
    </div>
  );
}

export default function Products() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (data) {
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pos_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (data) {
        setCategories(data);
        if (data.length > 0 && !emptyForm.category_id) {
          emptyForm.category_id = data[0].id;
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'Uncategorized';
  };

  const filtered = items.filter((p) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q);
    const matchesCategory = category === 'All' || p.category_id === category;
    const matchesStatus = status === 'All' || p.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  const lowStock = items.filter((p) => p.stock > 0 && p.stock <= p.min_stock);
  const outOfStock = items.filter((p) => p.stock === 0);
  const stockValue = items.reduce((sum, p) => sum + p.stock * p.buying_price, 0);

  const handleSave = async (f: FormState) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editing) {
        // Update existing product
        await supabase
          .from('pos_products')
          .update({
            name: f.name.trim(),
            sku: f.sku.trim() || '—',
            barcode: f.barcode.trim() || '—',
            category_id: f.category_id,
            brand: f.brand.trim() || '—',
            buying_price: Number(f.buyingPrice) || 0,
            selling_price: Number(f.sellingPrice) || 0,
            stock: Number(f.stock) || 0,
            min_stock: Number(f.minStock) || 0,
            supplier: f.supplier.trim() || '',
            status: f.status,
          })
          .eq('id', editing.id);
      } else {
        // Create new product
        await supabase
          .from('pos_products')
          .insert({
            user_id: user.id,
            product_id: `p-${Date.now()}`,
            name: f.name.trim(),
            sku: f.sku.trim() || '—',
            barcode: f.barcode.trim() || '—',
            category_id: f.category_id,
            brand: f.brand.trim() || '—',
            buying_price: Number(f.buyingPrice) || 0,
            selling_price: Number(f.sellingPrice) || 0,
            stock: Number(f.stock) || 0,
            min_stock: Number(f.minStock) || 0,
            supplier: f.supplier.trim() || '',
            status: f.status,
          });
      }

      await loadProducts();
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    
    try {
      await supabase
        .from('pos_products')
        .delete()
        .eq('id', deleting.id);

      await loadProducts();
      setDeleting(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const exportCsv = () => {
    const header = ['Name', 'SKU', 'Barcode', 'Category', 'Selling Price', 'Stock'];
    const rows = filtered.map((p) => [p.name, p.sku, p.barcode, p.category, String(p.sellingPrice), String(p.stock)]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const stockBadge = (p: Product) => {
    if (p.stock === 0) return <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">Out of stock</span>;
    if (p.stock <= p.min_stock) return <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">Low</span>;
    return <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">In stock</span>;
  };

  const stats = [
    { label: 'Total Products', value: loading ? '...' : String(items.length), icon: 'ri-price-tag-3-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Stock Value', value: loading ? '...' : formatMoney(stockValue), icon: 'ri-coins-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Low Stock', value: loading ? '...' : String(lowStock.length), icon: 'ri-alert-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Out of Stock', value: loading ? '...' : String(outOfStock.length), icon: 'ri-close-circle-line', tone: 'bg-accent-100 text-accent-700' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage everything you sell — prices, stock, and suppliers."
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCsv} className={ghostBtn}>
              <span className="flex h-4 w-4 items-center justify-center"><i className="ri-download-2-line" /></span>
              Export CSV
            </button>
            <button type="button" onClick={() => { setEditing(null); setModalOpen(true); }} className={primaryBtn}>
              <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
              Add Product
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-background-200 bg-background-50 p-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-md ${s.tone}`}>
              <i className={`${s.icon} text-lg`} />
            </span>
            <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{s.value}</p>
            <p className="mt-0.5 text-sm text-foreground-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-background-200 bg-background-50">
        <div className="flex flex-col gap-3 border-b border-background-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-foreground-400">
              <i className="ri-search-line text-sm" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, SKU or barcode…"
              className="h-10 w-full rounded-md border border-background-200 bg-background-100 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none">
              <option value="All">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none">
              <option value="All">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Buying</th>
                <th className="px-5 py-3 font-medium">Selling</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-foreground-500">Loading products...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-foreground-500">
                    No products match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground-900">{p.name}</p>
                      <p className="text-xs text-foreground-500">{p.sku} · {p.brand}</p>
                    </td>
                    <td className="px-5 py-3 text-foreground-600">{getCategoryName(p.category_id)}</td>
                    <td className="px-5 py-3 text-foreground-600">{formatMoney(p.buying_price)}</td>
                    <td className="px-5 py-3 font-semibold text-foreground-900">{formatMoney(p.selling_price)}</td>
                    <td className="px-5 py-3 text-foreground-600">{p.stock}</td>
                    <td className="px-5 py-3">{stockBadge(p)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => { setEditing(p); setModalOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-background-100 hover:text-foreground-900" title="Edit">
                          <i className="ri-edit-line" />
                        </button>
                        <button type="button" onClick={() => setDeleting(p)} className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 hover:bg-accent-100 hover:text-accent-700" title="Delete">
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} subtitle="Set the details, price, and stock level." size="lg">
        <ProductForm initial={editing ? toForm(editing) : emptyForm} onCancel={() => setModalOpen(false)} onSave={handleSave} categories={categories} />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete this product?" size="sm">
        <p className="text-sm text-foreground-600">
          You're about to delete <span className="font-semibold text-foreground-950">{deleting?.name}</span>. This
          can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setDeleting(null)} className={ghostBtn}>Cancel</button>
          <button type="button" onClick={confirmDelete} className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-accent-500 px-4 text-sm font-semibold text-background-50 transition-colors hover:bg-accent-600">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}