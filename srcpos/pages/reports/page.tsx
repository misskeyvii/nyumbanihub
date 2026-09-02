import { useState, useEffect } from 'react';
import PageHeader from '@/components/base/PageHeader';
import { supabase } from '@/utils/supabaseClient';
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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Sales');
  const [period, setPeriod] = useState('This Month');
  
  // Sales data
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
  const [salesByPayment, setSalesByPayment] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  // Inventory data
  const [products, setProducts] = useState<any[]>([]);
  const [fastMoving, setFastMoving] = useState<any[]>([]);
  const [slowMoving, setSlowMoving] = useState<any[]>([]);
  
  // Financial data
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    loadReportsData();
  }, [period]);

  async function loadReportsData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'This Month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'Last Month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      } else if (period === 'This Year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      // Load sales data
      const { data: salesData } = await supabase
        .from('pos_sales')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString())
        .order('date');

      if (salesData) {
        // Process sales data
        setTotalRevenue(salesData.reduce((sum, s) => sum + s.total, 0));
        setTotalTransactions(salesData.length);

        // Sales trend (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const chartData = last7Days.map(day => {
          const daySales = salesData.filter(s => s.date.startsWith(day));
          return {
            day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
            sales: daySales.reduce((sum, s) => sum + s.total, 0)
          };
        });
        setSalesChartData(chartData);

        // Sales by payment method
        const paymentMethods = salesData.reduce((acc: any, sale) => {
          const method = sale.payment_method || 'Cash';
          acc[method] = (acc[method] || 0) + sale.total;
          return acc;
        }, {});

        const totalSales = Object.values(paymentMethods).reduce((sum: number, val: any) => sum + val, 0) as number;
        const paymentData = Object.entries(paymentMethods).map(([name, value]: [string, any]) => ({
          name,
          value: Math.round((value / totalSales) * 100)
        }));
        setSalesByPayment(paymentData);
      }

      // Load products data
      const { data: productsData } = await supabase
        .from('pos_products')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (productsData) {
        setProducts(productsData);

        // Load categories for sales by category
        const { data: categoriesData } = await supabase
          .from('pos_categories')
          .select('*')
          .eq('user_id', user.id);

        if (categoriesData && salesData) {
          const categoryMap = new Map(categoriesData.map(c => [c.id, c.name]));
          const productCategoryMap = new Map(productsData.map(p => [p.id, p.category_id]));

          const categorySales = salesData.reduce((acc: any, sale) => {
            const items = sale.items || [];
            items.forEach((item: any) => {
              const categoryId = productCategoryMap.get(item.productId);
              const categoryName = categoryMap.get(categoryId) || 'Uncategorized';
              acc[categoryName] = (acc[categoryName] || 0) + (item.price * item.quantity);
            });
            return acc;
          }, {});

          const categoryData = Object.entries(categorySales)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a: any, b: any) => b.sales - a.sales)
            .slice(0, 6);
          setSalesByCategory(categoryData);
        }

        // Calculate product velocity for fast/slow moving
        if (salesData) {
          const productSales = salesData.reduce((acc: any, sale) => {
            const items = sale.items || [];
            items.forEach((item: any) => {
              acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
            });
            return acc;
          }, {});

          const productVelocity = productsData
            .map(p => ({
              name: p.name,
              units: productSales[p.id] || 0
            }))
            .filter(p => p.units > 0);

          const sortedByVelocity = [...productVelocity].sort((a, b) => b.units - a.units);
          setFastMoving(sortedByVelocity.slice(0, 5));
          setSlowMoving(sortedByVelocity.slice(-5).reverse());
        }
      }

      // Load expenses data
      const { data: expensesData } = await supabase
        .from('pos_expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString());

      if (expensesData) {
        setExpenses(expensesData);
      }

      // Monthly revenue for financial chart (last 6 months)
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthSales = salesData?.filter(s => {
          const saleDate = new Date(s.date);
          return saleDate >= monthStart && saleDate <= monthEnd;
        }) || [];

        const monthExpenses = expensesData?.filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate >= monthStart && expenseDate <= monthEnd;
        }) || [];

        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthSales.reduce((sum, s) => sum + s.total, 0),
          expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
        };
      });
      setMonthlyRevenue(monthlyData);

    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setLoading(false);
    }
  }

  const avgSale = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.min_stock).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const stockValue = products.reduce((sum, p) => sum + p.stock * p.buying_price, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

  const exportCsv = () => {
    const header = ['Date', 'Receipt No', 'Total', 'Payment Method'];
    const rows = salesChartData.map((s) => [s.day, '', String(s.sales), '']);
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
    { label: 'Total Revenue', value: loading ? '...' : formatMoney(totalRevenue), icon: 'ri-money-dollar-circle-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Transactions', value: loading ? '...' : String(totalTransactions), icon: 'ri-exchange-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Average Sale', value: loading ? '...' : formatMoney(avgSale), icon: 'ri-line-chart-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Profit Margin', value: loading ? '...' : `${profitMargin}%`, icon: 'ri-pie-chart-line', tone: 'bg-primary-100 text-primary-700' },
  ];

  const inventoryCards = [
    { label: 'Stock Value', value: loading ? '...' : formatMoney(stockValue), icon: 'ri-coins-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Low Stock', value: loading ? '...' : String(lowStock), icon: 'ri-alert-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Out of Stock', value: loading ? '...' : String(outOfStock), icon: 'ri-close-circle-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Total SKUs', value: loading ? '...' : String(products.length), icon: 'ri-price-tag-3-line', tone: 'bg-secondary-100 text-secondary-700' },
  ];

  const financialCards = [
    { label: 'Revenue', value: loading ? '...' : formatMoney(totalRevenue), icon: 'ri-arrow-up-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Expenses', value: loading ? '...' : formatMoney(totalExpenses), icon: 'ri-arrow-down-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Est. Profit', value: loading ? '...' : formatMoney(profit), icon: 'ri-line-chart-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Net Margin', value: loading ? '...' : `${profitMargin}%`, icon: 'ri-pie-chart-line', tone: 'bg-primary-100 text-primary-700' },
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
            {loading ? (
              <div className="flex h-64 items-center justify-center text-sm text-foreground-500">Loading chart...</div>
            ) : salesChartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-foreground-500">No sales data available</div>
            ) : (
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
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-background-200 bg-background-50 p-5">
              <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Sales by Category</h2>
              {loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-foreground-500">Loading...</div>
              ) : salesByCategory.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-foreground-500">No category data available</div>
              ) : (
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
              )}
            </div>

            <div className="rounded-lg border border-background-200 bg-background-50 p-5">
              <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Sales by Payment Method</h2>
              {loading ? (
                <div className="flex h-48 items-center justify-center text-sm text-foreground-500">Loading...</div>
              ) : salesByPayment.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-foreground-500">No payment data available</div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'Inventory' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-background-200 bg-background-50 p-5">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Fast-Moving Products</h2>
            {loading ? (
              <div className="py-8 text-center text-sm text-foreground-500">Loading...</div>
            ) : fastMoving.length === 0 ? (
              <div className="py-8 text-center text-sm text-foreground-500">No product sales data yet</div>
            ) : (
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
            )}
          </div>
          <div className="rounded-lg border border-background-200 bg-background-50 p-5">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Slow-Moving Products</h2>
            {loading ? (
              <div className="py-8 text-center text-sm text-foreground-500">Loading...</div>
            ) : slowMoving.length === 0 ? (
              <div className="py-8 text-center text-sm text-foreground-500">No product sales data yet</div>
            ) : (
              <div className="space-y-3">
                {slowMoving.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="w-5 text-center font-heading text-sm font-bold text-foreground-400">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground-900">{p.name}</p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-background-200">
                        <div className="h-1.5 rounded-full bg-accent-500" style={{ width: `${slowMoving[0].units > 0 ? (p.units / slowMoving[0].units) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold text-foreground-950">{p.units} units</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Financial' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-background-200 bg-background-50 p-5 lg:col-span-2">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Revenue vs Expenses</h2>
            {loading ? (
              <div className="flex h-72 items-center justify-center text-sm text-foreground-500">Loading chart...</div>
            ) : monthlyRevenue.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-foreground-500">No financial data available</div>
            ) : (
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
            )}
          </div>
          <div className="rounded-lg border border-background-200 bg-background-50 p-5">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Profit Summary</h2>
            <div className="space-y-3">
              <div className="rounded-md bg-primary-100 p-3">
                <p className="text-xs text-primary-700">Total Revenue</p>
                <p className="font-heading text-lg font-bold text-primary-800">{loading ? '...' : formatMoney(totalRevenue)}</p>
              </div>
              <div className="rounded-md bg-accent-100 p-3">
                <p className="text-xs text-accent-700">Total Expenses</p>
                <p className="font-heading text-lg font-bold text-accent-800">{loading ? '...' : formatMoney(totalExpenses)}</p>
              </div>
              <div className="rounded-md bg-secondary-100 p-3">
                <p className="text-xs text-secondary-700">Estimated Profit</p>
                <p className="font-heading text-lg font-bold text-secondary-800">{loading ? '...' : formatMoney(profit)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
