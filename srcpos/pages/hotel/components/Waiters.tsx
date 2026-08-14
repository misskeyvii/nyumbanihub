import { useState } from 'react';
import Modal from '@/components/base/Modal';
import { hotelWaiters, type Waiter } from '@/mocks/hospitality';

const statusTone: Record<Waiter['status'], string> = {
  'On duty': 'bg-primary-100 text-primary-700',
  'Off duty': 'bg-secondary-100 text-secondary-700',
  'On leave': 'bg-foreground-200 text-foreground-600',
};

export default function Waiters() {
  const [waiters, setWaiters] = useState<Waiter[]>(hotelWaiters);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState('Morning');

  const updateWaiter = (id: string, patch: Partial<Waiter>) => {
    setWaiters((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addWaiter = () => {
    if (!name.trim()) return;
    setWaiters((prev) => [
      ...prev,
      {
        id: `w-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim() || '—',
        shift,
        status: 'On duty',
        tables: '—',
        initials: name
          .trim()
          .split(' ')
          .map((part) => part.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      },
    ]);
    setName('');
    setPhone('');
    setShift('Morning');
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-base font-bold text-foreground-950">Restaurant Waiters</h2>
          <p className="text-xs text-foreground-500">Manage who is serving tables and when.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <i className="ri-user-add-line" />
          Add waiter
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                <th className="px-5 py-3 font-medium">Waiter</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Shift</th>
                <th className="px-5 py-3 font-medium">Tables</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {waiters.map((waiter) => (
                <tr key={waiter.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-700">
                        {waiter.initials}
                      </span>
                      <span className="font-medium text-foreground-900">{waiter.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-foreground-600">{waiter.phone}</td>
                  <td className="px-5 py-3 text-foreground-600">{waiter.shift}</td>
                  <td className="px-5 py-3 text-foreground-600">{waiter.tables}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[waiter.status]}`}>
                      {waiter.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {waiter.status !== 'On leave' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateWaiter(waiter.id, {
                            status: waiter.status === 'On duty' ? 'Off duty' : 'On duty',
                          })
                        }
                        className="whitespace-nowrap rounded-md border border-background-200 bg-background-50 px-3 py-1.5 text-xs font-semibold text-foreground-700 hover:bg-background-100"
                      >
                        {waiter.status === 'On duty' ? 'End shift' : 'Start shift'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add waiter"
        subtitle="Create an account for a new restaurant waiter."
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
              onClick={addWaiter}
              disabled={!name.trim()}
              className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add waiter
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="waiterName" className="mb-1.5 block text-xs font-semibold text-foreground-600">
              Full name
            </label>
            <input
              id="waiterName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brian Otieno"
              className="h-10 w-full rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label htmlFor="waiterPhone" className="mb-1.5 block text-xs font-semibold text-foreground-600">
              Phone
            </label>
            <input
              id="waiterPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 7…"
              className="h-10 w-full rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-foreground-600">Shift</p>
            <div className="grid grid-cols-2 gap-2">
              {['Morning', 'Evening'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setShift(item)}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                    shift === item
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