import { useState } from 'react';
import PageHeader from '@/components/base/PageHeader';
import { salesChartData } from '@/mocks/sales';
import {
  salesByCategory,
  salesByPayment,
  salesByEmployee,
  monthlyRevenue,
  fastMoving,
  slowMoving,
} from '@/mocks/reports';
import { expenses } from '@/mocks/expenses';
import { products } from '@/mocks/products';
import { formatCompactMoney, formatMoney } from '@/utils/format';
import { primaryBtn, ghostBtn } from '@/utils/ui';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = [
  'oklch(var(--primary-500))',
  'oklch(var(--accent-500))',
  'oklch(var(--secondary-500))',
  'oklch(var(--background-400))',
];

type Tab = 'Sales' | 'Inventory' | 'Financial';

const tabs: { key: Tab; label: string }[] = [
  { key: 'Sales', label: 'Sales' },
  { key: 'Inventory', label: 'Inventory' },
  { key: 'Financial', label: 'Financial' },
];

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid oklch(var(--background-200))',
  background: 'oklch(var(--background-50))',
  fontSize: 13,
};

export default function Reports() {
  const [tab, setTab] = useState<Tab>('Sales');
  const [period, setPeriod] = useState('This Month');

  const totalRevenue = 963200;
  const totalTransactions = 1420;
  const avgSale = Math.round(totalRevenue / totalTransactions);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const stockValue = products.reduce((sum, p) => sum + p.stock * p.buyingPrice, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const exportCsv = () => {
    const header = ['Employee', 'Sales', 'Transactions'];
    const rows = salesByEmployee.map((e) => [e.name, String(e.sales), String(e.transactions)]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const salesCards = [
    { label: 'Total Revenue', value: formatMoney(totalRevenue), icon: 'ri-money-dollar-circle-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Transactions', value: String(totalTransactions), icon: 'ri-exchange-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Average Sale', value: formatMoney(avgSale), icon: 'ri-line-chart-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Profit Margin', value: `${Math.round((profit / totalRevenue) * 100)}%`, icon: 'ri-pie-chart-line', tone: 'bg-primary-100 text-primary-700' },
  ];

  const inventoryCards = [
    { label: 'Stock Value', value: formatMoney(stockValue), icon: 'ri-coins-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Low Stock', value: String(lowStock), icon: 'ri-alert-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Out of Stock', value: String(outOfStock), icon: 'ri-close-circle-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Total SKUs', value: String(products.length), icon: 'ri-price-tag-3-line', tone: 'bg-secondary-100 text-secondary-700' },
  ];

  const financialCards = [
    { label: 'Revenue', value: formatMoney(totalRevenue), icon: 'ri-arrow-up-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Expenses', value: formatMoney(totalExpenses), icon: 'ri-arrow-down-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Est. Profit', value: formatMoney(profit), icon: 'ri-line-chart-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Net Margin', value: `${Math.round((profit / totalRevenue) * 100)}%`, icon: 'ri-pie-chart-line', tone: 'bg-primary-100 text-primary-700' },
  ];

  const activeCards = tab === 'Sales' ? salesCards : tab === 'Inventory' ? inventoryCards : financialCards;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Understand how your business is performing, in real time."
        action={
          <div className="flex flex-wrap gap-2">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-10 rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
            <button type="button" onClick={exportCsv} className={ghostBtn}>
              <span className="flex h-4 w-4 items-center justify-center"><i className="ri-download-2-line" /></span>
              Export CSV
            </button>
            <button type="button" onClick={exportCsv} className={primaryBtn}>
              <span className="flex h-4 w-4 items-center justify-center"><i className="ri-file-pdf-line" /></span>
              Export PDF
            </button>
          </div>
        }
      />

      <div className="inline-flex rounded-full bg-background-200 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? 'bg-background-50 text-foreground-950' : 'text-foreground-600 hover:text-foreground-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {activeCards.map((s) => (
          <div key={s.label} className="rounded-lg border border-background-200 bg-background-50 p-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-md ${s.tone}`}>
              <i className={`${s.icon} text-lg`} />
            </span>
            <p className="mt-3 font-heading text-xl font-bold text-foreground-950">{s.value}</p>
            <p className="mt-0.5 text-sm text-foreground-500">{s.label}</p>
          </div>
        ))}
      </div>

      {tab === 'Sales' && (
        <div className="space-y-6">
          <div className="rounded-lg border border-background-200 bg-background-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base font-bold text-foreground-950">Sales Trend</h2>
                <p className="text-xs text-foreground-500">Last 7 days</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(var(--primary-500))" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="oklch(var(--primary-500))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--background-200))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'oklch(var(--foreground-500))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'oklch(var(--foreground-500))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompactMoney(v)} width={62} />
                  <Tooltip formatter={(value) => [formatMoney(Number(value), 0), 'Sales']} contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="sales" stroke="oklch(var(--primary-500))" strokeWidth={2.5} fill="url(#reportGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-background-200 bg-background-50 p-5">
              <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Sales by Category</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByCategory} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--background-200))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'oklch(var(--foreground-500))', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={50} />
                    <YAxis tick={{ fill: 'oklch(var(--foreground-500))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompactMoney(v)} width={62} />
                    <Tooltip formatter={(value) => [formatMoney(Number(value), 0), 'Sales']} contentStyle={tooltipStyle} />
                    <Bar dataKey="sales" fill="oklch(var(--primary-500))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-background-200 bg-background-50 p-5">
              <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Sales by Payment Method</h2>
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={salesByPayment} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} stroke="none">
                        {salesByPayment.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Share']} contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-2">
                  {salesByPayment.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="flex-1 text-foreground-700">{p.name}</span>
                      <span className="font-semibold text-foreground-950">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-background-200 bg-background-50">
            <div className="border-b border-background-200 p-5">
              <h2 className="font-heading text-base font-bold text-foreground-950">Sales by Employee</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                    <th className="px-5 py-3 font-medium">Employee</th>
                    <th className="px-5 py-3 font-medium">Transactions</th>
                    <th className="px-5 py-3 text-right font-medium">Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByEmployee.map((e) => (
                    <tr key={e.name} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                      <td className="px-5 py-3 font-medium text-foreground-900">{e.name}</td>
                      <td className="px-5 py-3 text-foreground-600">{e.transactions}</td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground-950">{formatMoney(e.sales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'Inventory' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-background-200 bg-background-50 p-5">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Fast-Moving Products</h2>
            <div className="space-y-3">
              {fastMoving.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-5 text-center font-heading text-sm font-bold text-foreground-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground-900">{p.name}</p>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-background-200">
                      <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${(p.units / fastMoving[0].units) * 100}%` }} />
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold text-foreground-950">{p.units} units</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-background-200 bg-background-50 p-5">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Slow-Moving Products</h2>
            <div className="space-y-3">
              {slowMoving.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-5 text-center font-heading text-sm font-bold text-foreground-400">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground-900">{p.name}</p>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-background-200">
                      <div className="h-1.5 rounded-full bg-accent-500" style={{ width: `${(p.units / slowMoving[0].units) * 100}%` }} />
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold text-foreground-950">{p.units} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Financial' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-background-200 bg-background-50 p-5 lg:col-span-2">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Revenue vs Expenses</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--background-200))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'oklch(var(--foreground-500))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'oklch(var(--foreground-500))', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompactMoney(v)} width={62} />
                  <Tooltip formatter={(value, name) => [formatMoney(Number(value), 0), name === 'revenue' ? 'Revenue' : 'Expenses']} contentStyle={tooltipStyle} />
                  <Bar dataKey="revenue" fill="oklch(var(--primary-500))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="oklch(var(--accent-500))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg border border-background-200 bg-background-50 p-5">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Profit Summary</h2>
            <div className="space-y-3">
              <div className="rounded-md bg-primary-100 p-3">
                <p className="text-xs text-primary-700">Total Revenue</p>
                <p className="font-heading text-lg font-bold text-primary-800">{formatMoney(totalRevenue)}</p>
              </div>
              <div className="rounded-md bg-accent-100 p-3">
                <p className="text-xs text-accent-700">Total Expenses</p>
                <p className="font-heading text-lg font-bold text-accent-800">{formatMoney(totalExpenses)}</p>
              </div>
              <div className="rounded-md bg-secondary-100 p-3">
                <p className="text-xs text-secondary-700">Estimated Profit</p>
                <p className="font-heading text-lg font-bold text-secondary-800">{formatMoney(profit)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}