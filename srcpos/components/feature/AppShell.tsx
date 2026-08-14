import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { branches } from '@/mocks/business';
import { getDemoAccount, type DemoType, type Role } from '@/mocks/demoAccounts';
import { getDemoType, getSession, clearSession } from '@/utils/session';
import { supabase } from '@/utils/supabaseClient';
import { hydrateSession } from '@/utils/auth';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const backOfficeNav: NavItem[] = [
  { label: 'New Sale', icon: 'ri-shopping-cart-line', path: '/app/pos' },
  { label: 'Products', icon: 'ri-price-tag-3-line', path: '/app/products' },
  { label: 'Inventory', icon: 'ri-stack-line', path: '/app/inventory' },
  { label: 'Customers', icon: 'ri-user-line', path: '/app/customers' },
  { label: 'Suppliers', icon: 'ri-truck-line', path: '/app/suppliers' },
  { label: 'Expenses', icon: 'ri-wallet-line', path: '/app/expenses' },
  { label: 'Employees', icon: 'ri-team-line', path: '/app/employees' },
  { label: 'Reports', icon: 'ri-bar-chart-line', path: '/app/reports' },
  { label: 'Branches', icon: 'ri-store-2-line', path: '/app/branches' },
  { label: 'Subscription', icon: 'ri-shield-check-line', path: '/app/subscription' },
  { label: 'Settings', icon: 'ri-settings-3-line', path: '/app/settings' },
  { label: 'Help & Support', icon: 'ri-question-line', path: '/app/help' },
];

const shopNav: NavItem[] = [
  { label: 'Dashboard', icon: 'ri-dashboard-line', path: '/app/dashboard' },
  ...backOfficeNav,
];

const hotelNav: NavItem[] = [
  { label: 'Hotel Dashboard', icon: 'ri-hotel-bed-line', path: '/app/hotel' },
  ...backOfficeNav,
];

const airbnbNav: NavItem[] = [
  { label: 'Airbnb Dashboard', icon: 'ri-home-5-line', path: '/app/airbnb' },
  ...backOfficeNav,
];

const marketplaceNav: NavItem[] = [
  { label: 'Marketplace Dashboard', icon: 'ri-store-3-line', path: '/app/marketplace' },
  ...backOfficeNav,
];

const homesNav: NavItem[] = [
  { label: 'Homes Dashboard', icon: 'ri-building-2-line', path: '/app/homes' },
  ...backOfficeNav,
];

const staffNav: NavItem[] = [
  { label: 'New Sale', icon: 'ri-shopping-cart-line', path: '/app/pos' },
  { label: 'My Sales History', icon: 'ri-history-line', path: '/app/sales-history' },
];

const hotelStaffNav: NavItem[] = [
  { label: 'New Sale', icon: 'ri-shopping-cart-line', path: '/app/pos' },
  { label: 'Check-in', icon: 'ri-key-2-line', path: '/app/checkin' },
  { label: 'My Sales History', icon: 'ri-history-line', path: '/app/sales-history' },
];

function navFor(type: DemoType, role: Role): NavItem[] {
  if (role === 'staff') {
    return type === 'hotel' ? hotelStaffNav : staffNav;
  }
  switch (type) {
    case 'hotel':
      return hotelNav;
    case 'airbnb':
      return airbnbNav;
    case 'marketplace':
      return marketplaceNav;
    case 'homes':
      return homesNav;
    default:
      return shopNav;
  }
}

const searchPlaceholder: Record<DemoType, string> = {
  shop: 'Search products, sales, customers…',
  hotel: 'Search rooms, bookings, waiters…',
  airbnb: 'Search listings, bookings, guests…',
  marketplace: 'Search vendors, orders, listings…',
  homes: 'Search homes, tenants, maintenance…',
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const type = getDemoType();
  const account = getDemoAccount(type);
  const navItems = navFor(type, session.role);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-500 text-background-50">
          <i className="ri-store-2-line text-xl" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-[15px] font-bold leading-tight text-foreground-950">
            Nyumbani Link POS
          </p>
          <p className="truncate text-[11px] font-medium text-foreground-500">
            Simple tools. Smarter business.
          </p>
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-lg border border-background-200 bg-background-100 p-3">
        <p className="truncate text-sm font-semibold text-foreground-900">{account.businessName}</p>
        <p className="text-xs text-foreground-500">POS ID: {account.posId}</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-semibold text-accent-800">
          <i className="ri-vip-crown-line" />
          {account.plan}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive && location.pathname === item.path
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-600 hover:bg-background-100 hover:text-foreground-950'
              }`
            }
          >
            <span className="flex h-5 w-5 items-center justify-center">
              <i className={`${item.icon} text-[17px]`} />
            </span>
            <span className="whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-background-200 p-4">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-600 transition-colors hover:bg-background-100 hover:text-foreground-950"
        >
          <span className="flex h-5 w-5 items-center justify-center">
            <i className="ri-logout-box-r-line text-[17px]" />
          </span>
          <span className="whitespace-nowrap">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const type = getDemoType();
  const account = getDemoAccount(type);
  const admin = session.role === 'admin';
  const [authReady, setAuthReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState(branches[0]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login', { replace: true });
        return;
      }
      const user = await hydrateSession();
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      if (!cancelled) setAuthReady(true);
    }

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearSession();
        navigate('/login', { replace: true });
      }
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (admin) return;
    const allowed =
      type === 'hotel'
        ? ['/app/pos', '/app/checkin', '/app/sales-history']
        : ['/app/pos', '/app/sales-history'];
    if (!allowed.includes(location.pathname)) {
      navigate('/app/pos', { replace: true });
    }
  }, [admin, type, location.pathname, navigate]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-100">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-background-50">
            <i className="ri-loader-4-line animate-spin text-2xl" />
          </span>
          <p className="text-sm font-medium text-foreground-600">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-background-200 bg-background-50 lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground-950/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-background-50">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-foreground-600 hover:bg-background-100"
            >
              <i className="ri-close-line text-xl" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-background-200 bg-background-50 px-4 md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-700 hover:bg-background-100 lg:hidden"
          >
            <i className="ri-menu-line text-xl" />
          </button>

          {type === 'shop' ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setBranchOpen((v) => !v);
                  setNotifOpen(false);
                  setProfileOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-background-200 bg-background-50 px-3 py-1.5 text-sm font-semibold text-foreground-900 transition-colors hover:bg-background-100"
              >
                <span className="flex h-5 w-5 items-center justify-center text-primary-600">
                  <i className="ri-store-2-line" />
                </span>
                <span className="whitespace-nowrap">{activeBranch.name}</span>
                <i className="ri-arrow-down-s-line text-foreground-500" />
              </button>
              {branchOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-background-200 bg-background-50 p-1.5">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-foreground-400">
                    Switch branch
                  </p>
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => {
                        setActiveBranch(branch);
                        setBranchOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground-700 hover:bg-background-100"
                    >
                      <span className="flex h-5 w-5 items-center justify-center text-foreground-400">
                        <i className="ri-map-pin-line" />
                      </span>
                      <span className="flex-1 whitespace-nowrap">{branch.name}</span>
                      {activeBranch.id === branch.id && (
                        <i className="ri-check-line text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-background-200 bg-background-50 px-3 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center text-primary-600">
                <i className={account.icon} />
              </span>
              <span className="whitespace-nowrap text-sm font-semibold text-foreground-900">
                {account.label}
              </span>
            </div>
          )}

          <div className="relative ml-auto hidden md:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center text-foreground-400">
              <i className="ri-search-line text-sm" />
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder[type]}
              className="h-10 w-72 rounded-lg border border-background-200 bg-background-100 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setBranchOpen(false);
                  setProfileOpen(false);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-md text-foreground-600 hover:bg-background-100"
              >
                <i className="ri-notification-3-line text-xl" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-background-200 bg-background-50 p-2">
                  <div className="flex items-center justify-between px-2 py-2">
                    <p className="text-sm font-bold text-foreground-950">Notifications</p>
                    <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-semibold text-accent-800">
                      3 new
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="rounded-md bg-background-100 p-3">
                      <p className="text-sm font-medium text-foreground-900">Low stock alert</p>
                      <p className="text-xs text-foreground-500">
                        Omo Detergent 500g is below minimum stock.
                      </p>
                    </div>
                    <div className="rounded-md bg-background-100 p-3">
                      <p className="text-sm font-medium text-foreground-900">Out of stock</p>
                      <p className="text-xs text-foreground-500">
                        Mombasa Biscuits has run out.
                      </p>
                    </div>
                    <div className="rounded-md bg-background-100 p-3">
                      <p className="text-sm font-medium text-foreground-900">Payment received</p>
                      <p className="text-xs text-foreground-500">
                        M-PESA payment of KSh 1,370 confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setBranchOpen(false);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-background-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-500 text-sm font-bold text-background-50">
                  {session.initials}
                </span>
                <span className="hidden text-left md:block">
                  <span className="block text-sm font-semibold leading-tight text-foreground-900">
                    {session.name}
                  </span>
                  <span className="block text-[11px] text-foreground-500">{session.title}</span>
                </span>
                <i className="ri-arrow-down-s-line hidden text-foreground-500 md:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-background-200 bg-background-50 p-1.5">
                  <div className="border-b border-background-200 px-3 py-2.5">
                    <p className="text-sm font-semibold text-foreground-950">{session.name}</p>
                    <p className="text-xs text-foreground-500">{session.email}</p>
                  </div>
                  {[
                    { label: 'My Profile', icon: 'ri-user-settings-line' },
                    { label: 'Account Settings', icon: 'ri-settings-3-line' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground-700 hover:bg-background-100"
                    >
                      <span className="flex h-5 w-5 items-center justify-center text-foreground-400">
                        <i className={item.icon} />
                      </span>
                      {item.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/login');
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground-700 hover:bg-background-100"
                  >
                    <span className="flex h-5 w-5 items-center justify-center text-foreground-400">
                      <i className="ri-logout-box-r-line" />
                    </span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}