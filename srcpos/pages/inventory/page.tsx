import { useState, useEffect } from 'react';
import PageHeader from '@/components/base/PageHeader';
import Modal from '@/components/base/Modal';
import { supabase } from '@/utils/supabaseClient';
import { formatMoney, formatDate, formatTime } from '@/utils/format';
import { inputCls, labelCls, primaryBtn, ghostBtn } from '@/utils/ui';

type MovementType = 'Sale' | 'Restock' | 'Adjustment' | 'Damaged' | 'Return';

interface Product {
  id: string;
  product_id: string;
  name: string;
  stock: number;
  min_stock: number;
  buying_price: number;
  selling_price: number;
}

interface StockMovement {
  id: string;
  movement_id: string;
  date: string;
  product_id: string;
  movement_type: MovementType;
  reason: string;
  quantity: number;
  prev_stock: number;
  new_stock: number;
}

const movementTypeTones: Record<MovementType, string> = {
  Sale: 'bg-primary-100 text-primary-700',
  Restock: 'bg-primary-100 text-primary-700',
  Adjustment: 'bg-secondary-100 text-secondary-700',
  Damaged: 'bg-accent-100 text-accent-700',
  Return: 'bg-accent-100 text-accent-700',
};

export default function Inventory() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState('');
  const [qty, setQty] = useState('');
  const [type, setType] = useState<MovementType>('Restock');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadInventoryData();
  }, []);

  async function loadInventoryData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load products
      const { data: productsData } = await supabase
        .from('pos_products')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name');

      if (productsData) {
        setItems(productsData);
        if (productsData.length > 0) {
          setAdjustProduct(productsData[0].id);
        }
      }

      // Load recent stock movements
      const { data: movementsData } = await supabase
        .from('pos_stock_movements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(20);

      if (movementsData) {
        setMovements(movementsData);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  }

  const lowStock = items.filter((p) => p.stock > 0 && p.stock <= p.min_stock);
  const outOfStock = items.filter((p) => p.stock === 0);
  const stockValue = items.reduce((sum, p) => sum + p.stock * p.buying_price, 0);

  const stats = [
    { label: 'Stock Value', value: formatMoney(stockValue), icon: 'ri-coins-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Low Stock Items', value: String(lowStock.length), icon: 'ri-alert-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Out of Stock', value: String(outOfStock.length), icon: 'ri-close-circle-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Movements', value: String(movements.length), icon: 'ri-swap-line', tone: 'bg-secondary-100 text-secondary-700' },
  ];

  const applyAdjustment = async () => {
    const product = items.find((p) => p.id === adjustProduct);
    if (!product || !qty) return;
    
    const delta = Number(qty) || 0;
    if (delta === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const effectiveType: MovementType = delta > 0 ? 'Restock' : type === 'Restock' ? 'Adjustment' : type;
      const newStock = Math.max(0, product.stock + delta);

      // Update product stock
      await supabase
        .from('pos_products')
        .update({ stock: newStock })
        .eq('id', adjustProduct);

      // Create stock movement record
      await supabase
        .from('pos_stock_movements')
        .insert({
          user_id: user.id,
          product_id: adjustProduct,
          movement_id: `mv-${Date.now()}`,
          movement_type: effectiveType,
          reason: reason.trim() || (delta > 0 ? 'Manual restock' : 'Manual adjustment'),
          quantity: delta,
          prev_stock: product.stock,
          new_stock: newStock,
        });

      // Reload data
      await loadInventoryData();
      
      setAdjustOpen(false);
      setQty('');
      setReason('');
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert('Failed to adjust stock. Please try again.');
    }
  };

  const stockBadge = (p: Product) => {
    if (p.stock === 0) return <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">Out of stock</span>;
    if (p.stock <= p.min_stock) return <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">Low stock</span>;
    return <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">Healthy</span>;
  };

  const getProductName = (productId: string) => {
    const product = items.find(p => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Track stock levels, movements, and keep shelves from running empty."
        action={
          <button type="button" onClick={() => setAdjustOpen(true)} className={primaryBtn}>
            <span className="flex h-4 w-4 items-center justify-center"><i className="ri-add-line" /></span>
            Adjust Stock
          </button>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 lg:col-span-2">
          <div className="border-b border-background-200 p-5">
            <h2 className="font-heading text-base font-bold text-foreground-950">Stock Levels</h2>
            <p className="text-xs text-foreground-500">Current quantities vs minimum thresholds</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">In Stock</th>
                  <th className="px-5 py-3 font-medium">Minimum</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-foreground-500">Loading inventory...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-foreground-500">No products yet. Add products to get started.</td>
                  </tr>
                ) : (
                  [...lowStock, ...outOfStock, ...items.filter((p) => p.stock > p.min_stock)].slice(0, 10).map((p) => (
                    <tr key={p.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                      <td className="px-5 py-3 font-medium text-foreground-900">{p.name}</td>
                      <td className="px-5 py-3 text-foreground-600">{p.stock}</td>
                      <td className="px-5 py-3 text-foreground-600">{p.min_stock}</td>
                      <td className="px-5 py-3">{stockBadge(p)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-background-200 bg-background-50 p-5">
          <h2 className="font-heading text-base font-bold text-foreground-950">Needs Attention</h2>
          <p className="mb-4 text-xs text-foreground-500">Reorder these soon to avoid empty shelves</p>
          {loading ? (
            <div className="py-8 text-center text-sm text-foreground-500">Loading...</div>
          ) : [...outOfStock, ...lowStock].length === 0 ? (
            <div className="py-8 text-center text-sm text-foreground-500">All products have healthy stock levels</div>
          ) : (
            <div className="space-y-3">
              {[...outOfStock, ...lowStock].map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-md bg-background-100 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700">
                    <i className="ri-alert-line" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground-900">{p.name}</p>
                    <p className="text-xs text-foreground-500">
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left · min ${p.min_stock}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-background-200 bg-background-50">
        <div className="border-b border-background-200 p-5">
          <h2 className="font-heading text-base font-bold text-foreground-950">Stock Movement History</h2>
          <p className="text-xs text-foreground-500">Every change to your inventory, with a full audit trail</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium">Qty</th>
                <th className="px-5 py-3 font-medium">New Stock</th>
                <th className="px-5 py-3 font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-foreground-500">Loading movements...</td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-foreground-500">No stock movements yet</td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                    <td className="px-5 py-3 text-foreground-600">
                      {formatDate(m.date)} · {formatTime(m.date)}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground-900">{getProductName(m.product_id)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${movementTypeTones[m.movement_type]}`}>{m.movement_type}</span>
                    </td>
                    <td className="px-5 py-3 text-foreground-600">{m.reason}</td>
                    <td className={`px-5 py-3 font-semibold ${m.quantity > 0 ? 'text-primary-700' : 'text-foreground-700'}`}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </td>
                    <td className="px-5 py-3 text-foreground-600">{m.new_stock}</td>
                    <td className="px-5 py-3 text-foreground-600">Admin</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Adjust Stock" subtitle="Record a restock, damage, or stock correction." size="md">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Product</label>
            <select className={inputCls} value={adjustProduct} onChange={(e) => setAdjustProduct(e.target.value)}>
              {items.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (current: {p.stock})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Quantity (+ / −)</label>
              <input type="number" className={inputCls} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="e.g. 20 or -5" />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as MovementType)}>
                <option value="Restock">Restock</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Damaged">Damaged</option>
                <option value="Return">Return</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Reason</label>
            <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Supplier delivery" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setAdjustOpen(false)} className={ghostBtn}>Cancel</button>
            <button type="button" onClick={applyAdjustment} className={primaryBtn}>Apply Adjustment</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}