import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDemoType } from '@/utils/session';
import { products } from '@/mocks/products';
import { sales, salesChartData, topProducts } from '@/mocks/sales';
import { formatCompactMoney, formatMoney, formatTime } from '@/utils/format';

const toneClasses: Record<string, string> = {
  primary: 'bg-primary-100 text-primary-700',
  accent: 'bg-accent-100 text-accent-700',
  secondary: 'bg-secondary-100 text-secondary-700',
};

const paymentTones: Record<string, string> = {
  'M-PESA': 'bg-primary-100 text-primary-700',
  Cash: 'bg-secondary-100 text-secondary-700',
  Card: 'bg-accent-100 text-accent-700',
};

export default function Dashboard() {
  const [paymentFilter, setPaymentFilter] = useState('All');
  const session = { name: 'User', businessName: 'Your Business' };

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const outOfStock = products.filter((p) => p.stock === 0);

  const stats = [
    { label: "Today's Sales", value: formatCompactMoney(48250), delta: '+12.5%', up: true, icon: 'ri-money-dollar-circle-line', tone: 'primary' },
    { label: "Today's Transactions", value: '127', delta: '+8', up: true, icon: 'ri-exchange-line', tone: 'accent' },
    { label: 'Profit Estimate', value: formatCompactMoney(16890), delta: '+6.2%', up: true, icon: 'ri-line-chart-line', tone: 'secondary' },
    { label: 'Low Stock Items', value: String(lowStock.length + outOfStock.length), delta: 'attention', up: false, icon: 'ri-alert-line', tone: 'accent' },
  ];

  const filteredSales =
    paymentFilter === 'All'
      ? sales
      : sales.filter((s) => s.paymentMethod === paymentFilter);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground-950">
            Good morning, {session?.name.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-foreground-500">
            Here's what's happening at {session?.businessName || "Your Business"} today.
          </p>
        </div>
        <Link
          to="/app/pos"
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-500 px-4 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <span className="flex h-4 w-4 items-center justify-center">
            <i className="ri-shopping-cart-line" />
          </span>
          New Sale
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-background-200 bg-background-50 p-4"
          >
            <div className="flex items-start justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-md ${toneClasses[stat.tone]}`}>
                <i className={`${stat.icon} text-lg`} />
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  stat.label === 'Low Stock Items'
                    ? 'bg-accent-100 text-accent-700'
                    : stat.up
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-secondary-100 text-secondary-700'
                }`}
              >
                {stat.delta}
              </span>
            </div>
            <p className="mt-3 font-heading text-2xl font-bold text-foreground-950">{stat.value}</p>
            <p className="mt-0.5 text-sm text-foreground-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-background-200 bg-background-50 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground-950">Sales Overview</h2>
              <p className="text-xs text-foreground-500">Last 7 days</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
              <i className="ri-arrow-up-line" />
              +18.4% vs last week
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(var(--primary-500))" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="oklch(var(--primary-500))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--background-200))" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'oklch(var(--foreground-500))', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'oklch(var(--foreground-500))', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCompactMoney(v)}
                  width={62}
                />
                <Tooltip
                  formatter={(value) => [formatMoney(Number(value), 0), 'Sales']}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid oklch(var(--background-200))',
                    background: 'oklch(var(--background-50))',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="oklch(var(--primary-500))"
                  strokeWidth={2.5}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-background-200 bg-background-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-foreground-950">Top Products</h2>
            <span className="text-xs font-medium text-primary-700">This week</span>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="w-5 text-center font-heading text-sm font-bold text-foreground-400">
                  {index + 1}
                </span>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${toneClasses[product.tone]}`}>
                  <i className="ri-shopping-bag-line" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground-900">{product.name}</p>
                  <p className="text-xs text-foreground-500">{product.units} units sold</p>
                </div>
                <span className="whitespace-nowrap text-sm font-semibold text-foreground-900">
                  {formatCompactMoney(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-background-200 bg-background-50">
        <div className="flex flex-col gap-3 border-b border-background-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-base font-bold text-foreground-950">Recent Transactions</h2>
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Cash', 'M-PESA', 'Card'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentFilter(method)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  paymentFilter === method
                    ? 'bg-foreground-950 text-background-50'
                    : 'bg-background-100 text-foreground-600 hover:bg-background-200'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                <th className="px-5 py-3 font-medium">Receipt</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Cashier</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                  <td className="px-5 py-3 font-medium text-foreground-900">{sale.receiptNo}</td>
                  <td className="px-5 py-3 text-foreground-600">{formatTime(sale.date)}</td>
                  <td className="px-5 py-3 text-foreground-600">{sale.cashier}</td>
                  <td className="px-5 py-3 text-foreground-600">{sale.customer}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paymentTones[sale.paymentMethod] || 'bg-secondary-100 text-secondary-700'}`}>
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
      </div>
    </div>
  );
}