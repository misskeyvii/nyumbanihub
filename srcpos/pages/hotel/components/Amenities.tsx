import { useState } from 'react';
import { hotelAmenities, type Amenity } from '@/mocks/hospitality';

export default function Amenities() {
  const [amenities, setAmenities] = useState<Amenity[]>(hotelAmenities);

  const updateAmenity = (id: string, patch: Partial<Amenity>) => {
    setAmenities((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const pool = amenities.find((item) => item.name === 'Swimming Pool');

  return (
    <div className="space-y-4">
      {pool && (
        <div className="rounded-lg border border-background-200 bg-background-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-accent-100 text-accent-700">
                <i className="ri-water-flash-line text-2xl" />
              </span>
              <div>
                <h2 className="font-heading text-base font-bold text-foreground-950">Swimming Pool</h2>
                <p className="text-xs text-foreground-500">
                  {pool.hours} · Capacity {pool.capacity ?? '—'} guests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pool.offered ? 'bg-primary-100 text-primary-700' : 'bg-foreground-200 text-foreground-600'}`}>
                {pool.offered ? 'Available at your hotel' : 'Not offered'}
              </span>
              <button
                type="button"
                onClick={() => updateAmenity(pool.id, { status: pool.status === 'Open' ? 'Closed' : 'Open' })}
                className={`inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition-colors ${
                  pool.status === 'Open'
                    ? 'border border-background-200 bg-background-50 text-foreground-700 hover:bg-background-100'
                    : 'bg-accent-500 text-background-50 hover:bg-accent-600'
                }`}
              >
                <i className={pool.status === 'Open' ? 'ri-pause-circle-line' : 'ri-play-circle-line'} />
                {pool.status === 'Open' ? 'Close pool' : 'Open pool'}
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground-600">{pool.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((item) => (
          <div key={item.id} className="rounded-lg border border-background-200 bg-background-50 p-4">
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary-100 text-secondary-700">
                <i className={`${item.icon} text-lg`} />
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.offered ? 'bg-primary-100 text-primary-700' : 'bg-foreground-200 text-foreground-600'}`}>
                {item.offered ? 'Offered' : 'Off'}
              </span>
            </div>
            <p className="mt-3 font-semibold text-foreground-900">{item.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-foreground-500">{item.description}</p>
            <p className="mt-2 text-xs text-foreground-400">{item.hours}{item.capacity ? ` · Capacity ${item.capacity}` : ''}</p>
            <button
              type="button"
              onClick={() => updateAmenity(item.id, { offered: !item.offered })}
              className="mt-3 flex h-8 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-xs font-semibold text-foreground-700 transition-colors hover:bg-background-100"
            >
              {item.offered ? (
                <>
                  <i className="ri-toggle-line" />
                  Stop offering
                </>
              ) : (
                <>
                  <i className="ri-toggle-fill text-primary-600" />
                  Offer this
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}