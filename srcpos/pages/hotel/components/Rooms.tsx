import { useState } from 'react';
import Modal from '@/components/base/Modal';
import { hotelRooms, type HotelRoom, type RoomStatus } from '@/mocks/hospitality';
import { formatMoney } from '@/utils/format';

const statusTone: Record<RoomStatus, string> = {
  Available: 'bg-primary-100 text-primary-700',
  Occupied: 'bg-accent-100 text-accent-700',
  Cleaning: 'bg-secondary-100 text-secondary-700',
  Maintenance: 'bg-foreground-200 text-foreground-700',
};

const filters: ('All' | RoomStatus)[] = ['All', 'Available', 'Occupied', 'Cleaning', 'Maintenance'];

export default function Rooms() {
  const [rooms, setRooms] = useState<HotelRoom[]>(hotelRooms);
  const [filter, setFilter] = useState<'All' | RoomStatus>('All');
  const [checkInRoom, setCheckInRoom] = useState<HotelRoom | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const updateRoom = (id: string, patch: Partial<HotelRoom>) => {
    setRooms((prev) => prev.map((room) => (room.id === id ? { ...room, ...patch } : room)));
  };

  const filtered = filter === 'All' ? rooms : rooms.filter((room) => room.status === filter);

  const counts: Record<RoomStatus, number> = {
    Available: rooms.filter((room) => room.status === 'Available').length,
    Occupied: rooms.filter((room) => room.status === 'Occupied').length,
    Cleaning: rooms.filter((room) => room.status === 'Cleaning').length,
    Maintenance: rooms.filter((room) => room.status === 'Maintenance').length,
  };

  const openCheckIn = (room: HotelRoom) => {
    setCheckInRoom(room);
    setGuestName('');
    setGuestPhone('');
  };

  const confirmCheckIn = () => {
    if (!checkInRoom || !guestName.trim()) return;
    updateRoom(checkInRoom.id, { status: 'Occupied', guestName: guestName.trim() });
    setCheckInRoom(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              filter === item
                ? 'bg-foreground-950 text-background-50'
                : 'bg-background-50 text-foreground-600 hover:bg-background-200'
            }`}
          >
            {item}
            {item !== 'All' && <span className="ml-1 text-xs opacity-70">({counts[item]})</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((room) => (
          <div key={room.id} className="rounded-lg border border-background-200 bg-background-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading text-lg font-bold text-foreground-950">Room {room.number}</p>
                <p className="text-xs text-foreground-500">{room.type} · Floor {room.floor}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusTone[room.status]}`}>
                {room.status}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-foreground-600">{room.guests} guests</span>
              <span className="font-semibold text-primary-700">{formatMoney(room.price, 0)} / night</span>
            </div>

            {room.guestName && (
              <p className="mt-2 truncate text-sm text-foreground-700">
                <i className="ri-user-line mr-1 text-foreground-400" />
                {room.guestName}
              </p>
            )}

            <div className="mt-4">
              {room.status === 'Available' && (
                <button
                  type="button"
                  onClick={() => openCheckIn(room)}
                  className="flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
                >
                  <i className="ri-user-add-line" />
                  Check in
                </button>
              )}
              {room.status === 'Occupied' && (
                <button
                  type="button"
                  onClick={() => updateRoom(room.id, { status: 'Cleaning', guestName: undefined })}
                  className="flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
                >
                  <i className="ri-logout-box-r-line" />
                  Check out
                </button>
              )}
              {room.status === 'Cleaning' && (
                <button
                  type="button"
                  onClick={() => updateRoom(room.id, { status: 'Available', guestName: undefined })}
                  className="flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-secondary-500 text-sm font-semibold text-background-50 transition-colors hover:bg-secondary-600"
                >
                  <i className="ri-check-double-line" />
                  Mark ready
                </button>
              )}
              {room.status === 'Maintenance' && (
                <button
                  type="button"
                  onClick={() => updateRoom(room.id, { status: 'Available' })}
                  className="flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
                >
                  <i className="ri-tools-line" />
                  Fix complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={checkInRoom !== null}
        onClose={() => setCheckInRoom(null)}
        title={`Check in — Room ${checkInRoom?.number ?? ''}`}
        subtitle="Register a guest into this room."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCheckInRoom(null)}
              className="whitespace-nowrap rounded-md border border-background-200 bg-background-50 px-4 py-2 text-sm font-semibold text-foreground-700 hover:bg-background-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmCheckIn}
              disabled={!guestName.trim()}
              className="whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Check in
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="guestName" className="mb-1.5 block text-xs font-semibold text-foreground-600">
              Guest name
            </label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Brian Kipchoge"
              className="h-10 w-full rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label htmlFor="guestPhone" className="mb-1.5 block text-xs font-semibold text-foreground-600">
              Phone (optional)
            </label>
            <input
              id="guestPhone"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+254 7…"
              className="h-10 w-full rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}