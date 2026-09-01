import { useState } from 'react';
import { getDemoType } from '@/utils/session';
import {
  marketplaceVendors,
  marketOrders,
  marketListings,
  marketCategories,
  type Vendor,
} from '@/mocks/marketplace';
import { formatDate, formatMoney } from '@/utils/format';

type Tab = 'overview' | 'shops' | 'products' | 'orders';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'shops', label: 'Shops', icon: 'ri-store-2-line' },
  { id: 'products', label: 'Products', icon: 'ri-price-tag-3-line' },
  { id: 'orders', label: 'Orders', icon: 'ri-shopping-bag-line' },
];

const vendorTone: Record<Vendor['status'], string> = {
  Active: 'bg-primary-100 text-primary-700',
  Pending: 'bg-accent-100 text-accent-700',
  Suspended: 'bg-foreground-200 text-foreground-600',
};

const orderTone: Record<string, string> = {
  Pending: 'bg-accent-100 text-accent-700',
  Paid: 'bg-primary-100 text-primary-700',
  Shipped: 'bg-secondary-100 text-secondary-700',
  Delivered: 'bg-primary-500 text-background-50',
};

const listingTone: Record<string, string> = {
  Live: 'bg-primary-100 text-primary-700',
  Draft: 'bg-secondary-100 text-secondary-700',
  Flagged: 'bg-accent-100 text-accent-700',
};

export default function Marketplace() {
  const [tab, setTab] = useState<Tab>('overview');
  const [vendors, setVendors] = useState<Vendor[]>(marketplaceVendors);
  const [orderFilter, setOrderFilter] = useState('All');
  const [category, setCategory] = useState('All');
  const session = { businessName: 'Your Business' };

  const activeVendors = vendors.filter((vendor) => vendor.status === 'Active').length;
  const grossSales = vendors.reduce((sum, vendor) => sum + vendor.sales, 0);
  const commission = vendors.reduce((sum, vendor) => sum + vendor.commission, 0);
  const liveListings = marketListings.filter((listing) => listing.status === 'Live').length;

  const toggleVendor = (id: string) => {
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === id
          ? { ...vendor, status: vendor.status === 'Suspended' ? 'Active' : 'Suspended' }
          : vendor,
      ),
    );
  };

  const stats = [
    { label: 'Gross Sales', value: formatMoney(grossSales, 0), sub: 'all-time', icon: 'ri-money-dollar-circle-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Commission Earned', value: formatMoney(commission, 0), sub: '10% on sales', icon: 'ri-percent-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Active Shops', value: String(activeVendors), sub: `of ${vendors.length} total`, icon: 'ri-store-2-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Live Products', value: String(liveListings), sub: 'currently selling', icon: 'ri-price-tag-3-line', tone: 'bg-accent-100 text-accent-700' },
  ];

  const filteredOrders =
    orderFilter === 'All' ? marketOrders : marketOrders.filter((order) => order.status === orderFilter);

  const filteredListings =
    category === 'All'
      ? marketListings
      : marketListings.filter((listing) => listing.category === category);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground-950">{session?.businessName || "Your Business"}</h1>
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-700">
              Multi-vendor Marketplace
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground-500">
            One mall for every shop — track vendors, orders, products and your commission.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTab('shops')}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <span className="flex h-4 w-4 items-center justify-center">
            <i className="ri-user-add-line" />
          </span>
          Manage Shops
        </button>
      </div>

      <div className="inline-flex w-full gap-1 overflow-x-auto rounded-full bg-background-100 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.id ? 'bg-foreground-950 text-background-50' : 'text-foreground-600 hover:text-foreground-950'
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center">
              <i className={item.icon} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-background-200 bg-background-50 p-4">
                <span className={`flex h-9 w-9 items-center justify-center rounded-md ${stat.tone}`}>
                  <i className={`${stat.icon} text-lg`} />
                </span>
                <p className="mt-3 font-heading text-2xl font-bold text-foreground-950">{stat.value}</p>
                <p className="mt-0.5 text-sm text-foreground-500">{stat.label}</p>
                <p className="text-xs text-foreground-400">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {marketCategories.map((item) => (
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

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-foreground-950">Featured Shops</h2>
              <button
                type="button"
                onClick={() => setTab('shops')}
                className="text-xs font-semibold text-primary-700 hover:text-primary-800"
              >
                View all shops
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vendors
                .filter((vendor) => category === 'All' || vendor.category === category)
                .slice(0, 6)
                .map((vendor) => (
                  <div key={vendor.id} className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
                    <div className="h-28 w-full overflow-hidden">
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        title={`${vendor.name} shop on ${session?.businessName || "Your Business"}`}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground-950">{vendor.name}</p>
                          <p className="text-xs text-foreground-500">{vendor.category}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${vendorTone[vendor.status]}`}>
                          {vendor.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-foreground-500">
                        <span className="inline-flex items-center gap-1">
                          <i className="ri-star-fill text-accent-500" />
                          {vendor.rating.toFixed(1)}
                        </span>
                        <span>{vendor.products} products</span>
                        <span className="font-semibold text-foreground-900">{formatMoney(vendor.sales, 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-lg border border-background-200 bg-background-50 p-5">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                    <th className="px-3 py-2.5 font-medium">Order</th>
                    <th className="px-3 py-2.5 font-medium">Customer</th>
                    <th className="px-3 py-2.5 font-medium">Vendor</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {marketOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                      <td className="px-3 py-3 font-medium text-foreground-900">{order.orderNo}</td>
                      <td className="px-3 py-3 text-foreground-600">{order.customer}</td>
                      <td className="px-3 py-3 text-foreground-600">{order.vendor}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${orderTone[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-foreground-950">{formatMoney(order.total, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'shops' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
              <div className="h-32 w-full overflow-hidden">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  title={`${vendor.name} shop on ${session?.businessName || "Your Business"}`}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground-950">{vendor.name}</p>
                    <p className="text-xs text-foreground-500">
                      {vendor.category} · joined {vendor.joined}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${vendorTone[vendor.status]}`}>
                    {vendor.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-foreground-500">
                  <span className="inline-flex items-center gap-1">
                    <i className="ri-star-fill text-accent-500" />
                    {vendor.rating.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span>{vendor.products} products</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-background-100 p-3 text-center">
                  <div>
                    <p className="text-xs text-foreground-500">Sales</p>
                    <p className="text-sm font-bold text-foreground-950">{formatMoney(vendor.sales, 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-500">Commission</p>
                    <p className="text-sm font-bold text-foreground-950">{formatMoney(vendor.commission, 0)}</p>
                  </div>
                </div>

                <div className="mt-3">
                  {vendor.status !== 'Pending' ? (
                    <button
                      type="button"
                      onClick={() => toggleVendor(vendor.id)}
                      className="flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
                    >
                      {vendor.status === 'Active' ? 'Suspend shop' : 'Activate shop'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleVendor(vendor.id)}
                      className="flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
                    >
                      Approve shop
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {marketCategories.map((item) => (
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
            {filteredListings.map((listing) => (
              <div key={listing.id} className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
                <div className="h-36 w-full overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.name}
                    title={`${listing.name} sold by ${listing.vendor} on ${session?.businessName || "Your Business"}`}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground-900">{listing.name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${listingTone[listing.status]}`}>
                      {listing.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-foreground-500">
                    {listing.vendor} · {listing.category}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-bold text-primary-700">{formatMoney(listing.price, 0)}</span>
                    <span className={`text-xs ${listing.stock === 0 ? 'text-accent-700' : 'text-foreground-500'}`}>
                      {listing.stock === 0 ? 'Out of stock' : `${listing.stock} in stock`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Pending', 'Paid', 'Shipped', 'Delivered'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setOrderFilter(item)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  orderFilter === item
                    ? 'bg-foreground-950 text-background-50'
                    : 'bg-background-50 text-foreground-600 hover:bg-background-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Vendor</th>
                    <th className="px-5 py-3 font-medium">Items</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                      <td className="px-5 py-3 font-medium text-foreground-900">{order.orderNo}</td>
                      <td className="px-5 py-3 text-foreground-600">{order.customer}</td>
                      <td className="px-5 py-3 text-foreground-600">{order.vendor}</td>
                      <td className="px-5 py-3 text-foreground-600">{order.items}</td>
                      <td className="px-5 py-3 text-foreground-600">{formatDate(order.date)}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${orderTone[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground-950">{formatMoney(order.total, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}