import { useState } from 'react';
import { getDemoType, useSession } from '@/utils/session';
import {
  airbnbListings,
  airbnbBookings,
  type AirbnbListing,
  type ListingStatus,
} from '@/mocks/hospitality';
import { formatDate, formatMoney } from '@/utils/format';

type Tab = 'overview' | 'listings' | 'bookings';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'listings', label: 'My Listings', icon: 'ri-home-5-line' },
  { id: 'bookings', label: 'Bookings', icon: 'ri-calendar-check-line' },
];

const listingTone: Record<ListingStatus, string> = {
  Available: 'bg-primary-100 text-primary-700',
  Booked: 'bg-accent-100 text-accent-700',
  'Checking out': 'bg-secondary-100 text-secondary-700',
  Maintenance: 'bg-foreground-200 text-foreground-600',
};

const bookingTone: Record<string, string> = {
  Booked: 'bg-primary-100 text-primary-700',
  'Checked-in': 'bg-accent-100 text-accent-700',
  Completed: 'bg-secondary-100 text-secondary-700',
  Cancelled: 'bg-foreground-200 text-foreground-600',
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: string;
  tone: string;
}

function StatCard({ label, value, sub, icon, tone }: StatCardProps) {
  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-4">
      <span className={`flex h-9 w-9 items-center justify-center rounded-md ${tone}`}>
        <i className={`${icon} text-lg`} />
      </span>
      <p className="mt-3 font-heading text-2xl font-bold text-foreground-950">{value}</p>
      <p className="mt-0.5 text-sm text-foreground-500">{label}</p>
      <p className="text-xs text-foreground-400">{sub}</p>
    </div>
  );
}

export default function Airbnb() {
  const session = useSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [listings, setListings] = useState<AirbnbListing[]>(airbnbListings);

  const booked = listings.filter((listing) => listing.status === 'Booked').length;
  const available = listings.filter((listing) => listing.status === 'Available').length;
  const avgOccupancy = Math.round(
    listings.reduce((sum, listing) => sum + listing.occupancy, 0) / listings.length,
  );

  const updateListing = (id: string, patch: Partial<AirbnbListing>) => {
    setListings((prev) => prev.map((listing) => (listing.id === id ? { ...listing, ...patch } : listing)));
  };

  const stats = [
    { label: 'Listings', value: String(listings.length), sub: 'total units', icon: 'ri-home-5-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Booked Tonight', value: String(booked), sub: 'occupied units', icon: 'ri-lock-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Available', value: String(available), sub: 'ready to book', icon: 'ri-check-double-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Avg Occupancy', value: `${avgOccupancy}%`, sub: 'last 30 days', icon: 'ri-line-chart-line', tone: 'bg-accent-100 text-accent-700' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground-950">{session?.businessName || 'Your Airbnb Business'}</h1>
            <span className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-bold text-secondary-800">Airbnb</span>
          </div>
          <p className="mt-1 text-sm text-foreground-500">
            Manage your listings, bookings and guests from one screen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTab('bookings')}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <span className="flex h-4 w-4 items-center justify-center">
            <i className="ri-calendar-line" />
          </span>
          View Bookings
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
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="rounded-lg border border-background-200 bg-background-50 p-5">
            <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Recent Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                    <th className="px-3 py-2.5 font-medium">Guest</th>
                    <th className="px-3 py-2.5 font-medium">Listing</th>
                    <th className="px-3 py-2.5 font-medium">Check-in</th>
                    <th className="px-3 py-2.5 font-medium">Nights</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {airbnbBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                      <td className="px-3 py-3 font-medium text-foreground-900">{booking.guest}</td>
                      <td className="px-3 py-3 text-foreground-600">{booking.listing}</td>
                      <td className="px-3 py-3 text-foreground-600">{formatDate(booking.checkIn)}</td>
                      <td className="px-3 py-3 text-foreground-600">{booking.nights}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bookingTone[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-foreground-950">
                        {formatMoney(booking.total, 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'listings' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className="rounded-lg border border-background-200 bg-background-50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground-900">{listing.name}</p>
                  <p className="text-xs text-foreground-500">
                    <i className="ri-map-pin-line mr-1 text-foreground-400" />
                    {listing.location}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${listingTone[listing.status]}`}>
                  {listing.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-500">
                <span>{listing.bedrooms} bd</span>
                <span>{listing.baths} ba</span>
                <span>{listing.guests} guests</span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-primary-700">{formatMoney(listing.nightlyRate, 0)} / night</span>
                <span className="text-xs text-foreground-500">{listing.occupancy}% occupied</span>
              </div>

              {listing.nextGuest && (
                <p className="mt-2 rounded-md bg-background-100 px-3 py-2 text-xs text-foreground-600">
                  <span className="font-semibold text-foreground-900">{listing.nextGuest}</span> · {listing.nextDates}
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  updateListing(listing.id, {
                    status: listing.status === 'Maintenance' ? 'Available' : 'Maintenance',
                    nextGuest: listing.status === 'Maintenance' ? listing.nextGuest : undefined,
                  })
                }
                className="mt-3 flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
              >
                <i className={listing.status === 'Maintenance' ? 'ri-check-double-line' : 'ri-tools-line'} />
                {listing.status === 'Maintenance' ? 'Mark available' : 'Start maintenance'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        <div className="overflow-hidden rounded-lg border border-background-200 bg-background-50">
          <div className="border-b border-background-200 p-5">
            <h2 className="font-heading text-base font-bold text-foreground-950">All Bookings</h2>
            <p className="text-xs text-foreground-500">See who is booked, staying, or has checked out.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Listing</th>
                  <th className="px-5 py-3 font-medium">Check-in</th>
                  <th className="px-5 py-3 font-medium">Check-out</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {airbnbBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                    <td className="px-5 py-3 font-medium text-foreground-900">{booking.guest}</td>
                    <td className="px-5 py-3 text-foreground-600">{booking.phone}</td>
                    <td className="px-5 py-3 text-foreground-600">{booking.listing}</td>
                    <td className="px-5 py-3 text-foreground-600">{formatDate(booking.checkIn)}</td>
                    <td className="px-5 py-3 text-foreground-600">{formatDate(booking.checkOut)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bookingTone[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground-950">
                      {formatMoney(booking.total, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}