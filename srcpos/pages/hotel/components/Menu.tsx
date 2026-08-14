import { useState } from 'react';
import Modal from '@/components/base/Modal';
import { hotelMenu, type MenuItem } from '@/mocks/hospitality';
import { formatMoney } from '@/utils/format';

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>(hotelMenu);
  const [category, setCategory] = useState<'All' | 'Food' | 'Drinks'>('All');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [newCategory, setNewCategory] = useState<'Food' | 'Drinks'>('Food');

  const updateItem = (id: string, patch: Partial<MenuItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const filtered = items.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || item.name.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  const addItem = () => {
    if (!name.trim() || !price.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: name.trim(),
        category: newCategory,
        price: Math.max(0, parseFloat(price) || 0),
        available: true,
        icon: newCategory === 'Food' ? 'ri-restaurant-line' : 'ri-cup-line',
      },
    ]);
    setName('');
    setPrice('');
    setNewCategory('Food');
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-foreground-400">
            <i className="ri-search-line text-sm" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food & drinks…"
            className="h-10 w-full rounded-lg border border-background-200 bg-background-50 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-add-line" />
          Add item
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['All', 'Food', 'Drinks'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              category === item
                ? 'bg-foreground-950 text-background-50'
                : 'bg-background-50 text-foreground-600 hover:bg-background-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-lg border border-background-200 bg-background-50 p-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${item.category === 'Food' ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>
              <i className={`${item.icon} text-xl`} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground-900">{item.name}</p>
              <p className="text-xs text-foreground-500">{item.category} · {formatMoney(item.price, 0)}</p>
            </div>
            <button
              type="button"
              onClick={() => updateItem(item.id, { available: !item.available })}
              className={`relative flex h-9 w-14 shrink-0 items-center rounded-full px-1 transition-colors ${
                item.available ? 'bg-primary-500' : 'bg-foreground-300'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full bg-background-50 transition-transform ${
                  item.available ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                <i className={`${item.available ? 'ri-check-line text-primary-600' : 'ri-close-line text-foreground-400'} text-sm`} />
              </span>
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-background-300 bg-background-50 p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-foreground-400">
            <i className="ri-restaurant-line text-2xl" />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground-700">No menu items found</p>
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add menu item"
        subtitle="Add a new food or drink to your restaurant menu."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="whitespace-nowrap rounded-md border border-background-200 bg-background-50 px-4 py-2 text-sm font-semibold text-foreground-700 hover:bg-background-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={addItem}
              disabled={!name.trim() || !price.trim()}
              className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add item
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="itemName" className="mb-1.5 block text-xs font-semibold text-foreground-600">
              Item name
            </label>
            <input
              id="itemName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Burger"
              className="h-10 w-full rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label htmlFor="itemPrice" className="mb-1.5 block text-xs font-semibold text-foreground-600">
              Price (KSh)
            </label>
            <input
              id="itemPrice"
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="h-10 w-full rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-foreground-600">Category</p>
            <div className="grid grid-cols-2 gap-2">
              {(['Food', 'Drinks'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setNewCategory(item)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                    newCategory === item
                      ? 'border-primary-400 bg-primary-50 text-primary-700'
                      : 'border-background-200 bg-background-50 text-foreground-600 hover:bg-background-100'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}