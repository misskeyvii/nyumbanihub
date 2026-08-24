import { useEffect, useState } from 'react';
import { getDemoType, useSession } from '@/utils/session';
import { fetchSales } from '@/utils/salesStore';
import { formatMoney, formatTime } from '@/utils/format';
import type { Sale } from '@/mocks/sales';

const paymentTones: Record<string, string> = {
  'M-PESA': 'bg-primary-100 text-primary-700',
  Cash: 'bg-secondary-100 text-secondary-700',
  Card: 'bg-accent-100 text-accent-700',
};

export default function SalesHistory() {
  const session = useSession();
  const isStaff = session?.role === 'staff';
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSales = () => {
    setLoading(true);
    setError(null);
    fetchSales()
      .then((data) => setSales(data))
      .catch(() => setError('Could not load sales. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSales();
  }, []);

  const total = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground-950">
            {isStaff ? 'My Sales History' : 'Sales History'}
          </h1>
          <p className="mt-1 text-sm text-foreground-500">
            {isStaff
              ? `Sales recorded under ${session?.name} at ${session?.businessName || "Your Business"}.`
              : `All sales across ${session?.businessName || "Your Business"}.`}
          </p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 px-4 py-3 text-right">
          <p className="text-xs text-foreground-500">{sales.length} sales</p>
          <p className="font-heading text-xl font-bold text-foreground-950">
            {formatMoney(total, 0)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-background-50">
              <i className="ri-loader-4-line animate-spin text-xl" />
            </span>
            <p className="text-sm text-foreground-500">Loading sales…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-error-warning-line text-2xl" />
            </span>
            <p className="text-sm font-semibold text-foreground-700">{error}</p>
            <button
              type="button"
              onClick={loadSales}
              className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 hover:bg-primary-600"
            >
              Retry
            </button>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-foreground-400">
              <i className="ri-history-line text-2xl" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground-700">No sales yet</p>
            <p className="mt-1 text-sm text-foreground-500">Complete a sale to see it here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                  <th className="px-5 py-3 font-medium">Receipt</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Cashier</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-background-100 last:border-0 hover:bg-background-50"
                  >
                    <td className="px-5 py-3 font-medium text-foreground-900">{sale.receiptNo}</td>
                    <td className="px-5 py-3 text-foreground-600">{formatTime(sale.date)}</td>
                    <td className="px-5 py-3 text-foreground-600">{sale.cashier}</td>
                    <td className="px-5 py-3 text-foreground-600">{sale.customer}</td>
                    <td className="px-5 py-3 text-foreground-600">
                      {sale.items.reduce((count, item) => count + item.qty, 0)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          paymentTones[sale.paymentMethod] || 'bg-secondary-100 text-secondary-700'
                        }`}
                      >
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground-950">
                      {formatMoney(sale.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}