import { useState } from 'react';
import { getDemoType } from '@/utils/session';
import { hotelRooms, hotelBookings, hotelAmenities } from '@/mocks/hospitality';
import { formatDate, formatMoney } from '@/utils/format';
import Rooms from './components/Rooms';
import Menu from './components/Menu';
import Amenities from './components/Amenities';
import Waiters from './components/Waiters';

type Tab = 'overview' | 'rooms' | 'menu' | 'amenities' | 'waiters';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'rooms', label: 'Rooms', icon: 'ri-hotel-bed-line' },
  { id: 'menu', label: 'Food & Drinks', icon: 'ri-restaurant-line' },
  { id: 'amenities', label: 'Amenities', icon: 'ri-water-flash-line' },
  { id: 'waiters', label: 'Waiters', icon: 'ri-team-line' },
];

const bookingTone: Record<string, string> = {
  Booked: 'bg-primary-100 text-primary-700',
  'Checked-in': 'bg-accent-100 text-accent-700',
  'Checked-out': 'bg-secondary-100 text-secondary-700',
};

export default function Hotel() {
  const session = useSession();
  const [tab, setTab] = useState<Tab>('overview');

  const available = hotelRooms.filter((room) => room.status === 'Available').length;
  const occupied = hotelRooms.filter((room) => room.status === 'Occupied').length;
  const arrivals = hotelBookings.filter((booking) => booking.status === 'Booked').length;
  const pool = hotelAmenities.find((amenity) => amenity.name === 'Swimming Pool');

  const stats = [
    { label: 'Rooms Available', value: String(available), sub: `of ${hotelRooms.length} rooms`, icon: 'ri-hotel-bed-line', tone: 'bg-primary-100 text-primary-700' },
    { label: 'Guests In-house', value: String(occupied), sub: 'occupied rooms', icon: 'ri-user-heart-line', tone: 'bg-accent-100 text-accent-700' },
    { label: 'Arrivals Today', value: String(arrivals), sub: 'bookings checking in', icon: 'ri-calendar-check-line', tone: 'bg-secondary-100 text-secondary-700' },
    { label: 'Swimming Pool', value: pool?.offered ? pool.status : 'Not offered', sub: pool?.hours ?? '—', icon: 'ri-water-flash-line', tone: 'bg-accent-100 text-accent-700' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground-950">{account.businessName}</h1>
            <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-bold text-accent-800">Hotel</span>
          </div>
          <p className="mt-1 text-sm text-foreground-500">
            Front desk, rooms, restaurant and amenities — all in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTab('rooms')}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          <span className="flex h-4 w-4 items-center justify-center">
            <i className="ri-key-2-line" />
          </span>
          Manage Rooms
        </button>
      </div>

      <div className="inline-flex w-full gap-1 overflow-x-auto rounded-full bg-background-100 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.id
                ? 'bg-foreground-950 text-background-50'
                : 'text-foreground-600 hover:text-foreground-950'
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
                <div className="flex items-start justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-md ${stat.tone}`}>
                    <i className={`${stat.icon} text-lg`} />
                  </span>
                </div>
                <p className="mt-3 font-heading text-2xl font-bold text-foreground-950">{stat.value}</p>
                <p className="mt-0.5 text-sm text-foreground-500">{stat.label}</p>
                <p className="text-xs text-foreground-400">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-background-200 bg-background-50 p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-base font-bold text-foreground-950">Upcoming & In-house Guests</h2>
                <button
                  type="button"
                  onClick={() => setTab('rooms')}
                  className="text-xs font-semibold text-primary-700 hover:text-primary-800"
                >
                  View rooms
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-background-200 text-xs uppercase tracking-wide text-foreground-400">
                      <th className="px-3 py-2.5 font-medium">Guest</th>
                      <th className="px-3 py-2.5 font-medium">Room</th>
                      <th className="px-3 py-2.5 font-medium">Check-in</th>
                      <th className="px-3 py-2.5 font-medium">Check-out</th>
                      <th className="px-3 py-2.5 font-medium">Status</th>
                      <th className="px-3 py-2.5 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotelBookings.slice(0, 6).map((booking) => (
                      <tr key={booking.id} className="border-b border-background-100 last:border-0 hover:bg-background-50">
                        <td className="px-3 py-3 font-medium text-foreground-900">{booking.guest}</td>
                        <td className="px-3 py-3 text-foreground-600">{booking.room}</td>
                        <td className="px-3 py-3 text-foreground-600">{formatDate(booking.checkIn)}</td>
                        <td className="px-3 py-3 text-foreground-600">{formatDate(booking.checkOut)}</td>
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

            <div className="rounded-lg border border-background-200 bg-background-50 p-5">
              <h2 className="mb-4 font-heading text-base font-bold text-foreground-950">Room Availability</h2>
              <div className="space-y-4">
                {([
                  { label: 'Available', count: available, cls: 'bg-primary-500' },
                  { label: 'Occupied', count: occupied, cls: 'bg-accent-500' },
                  { label: 'Cleaning', count: hotelRooms.filter((r) => r.status === 'Cleaning').length, cls: 'bg-secondary-500' },
                  { label: 'Maintenance', count: hotelRooms.filter((r) => r.status === 'Maintenance').length, cls: 'bg-foreground-400' },
                ]).map((row) => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-foreground-600">{row.label}</span>
                      <span className="font-semibold text-foreground-950">{row.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-background-100">
                      <div
                        className={`h-full rounded-full ${row.cls}`}
                        style={{ width: `${hotelRooms.length ? (row.count / hotelRooms.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-lg bg-background-100 p-3 text-xs leading-relaxed text-foreground-500">
                Booked rooms update their status automatically as guests check in and out.
              </p>
            </div>
          </div>
        </>
      )}

      {tab === 'rooms' && <Rooms />}
      {tab === 'menu' && <Menu />}
      {tab === 'amenities' && <Amenities />}
      {tab === 'waiters' && <Waiters />}
    </div>
  );
}