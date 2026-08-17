import { useState } from 'react';
import Modal from '@/components/base/Modal';
import { hotelRooms, type HotelRoom, type RoomStatus } from '@/mocks/hospitality';
import { useSession } from '@/utils/session';

const statusTone: Record<RoomStatus, string> = {
  Available: 'bg-primary-100 text-primary-700',
  Occupied: 'bg-accent-100 text-accent-700',
  Cleaning: 'bg-secondary-100 text-secondary-700',
  Maintenance: 'bg-foreground-200 text-foreground-700',
};

export default function Checkin() {
  const session = useSession();
  const [rooms, setRooms] = useState<HotelRoom[]>(hotelRooms);
  const [checkInRoom, setCheckInRoom] = useState<HotelRoom | null>(null);
  const [guestName, setGuestName] = useState('');

  const updateRoom = (id: string, patch: Partial<HotelRoom>) => {
    setRooms((prev) => prev.map((room) => (room.id === id ? { ...room, ...patch } : room)));
  };

  const confirmCheckIn = () => {
    if (!checkInRoom || !guestName.trim()) return;
    updateRoom(checkInRoom.id, { status: 'Occupied', guestName: guestName.trim() });
    setCheckInRoom(null);
  };

  const checkOut = (room: HotelRoom) => {
    updateRoom(room.id, { status: 'Cleaning', guestName: undefined });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground-950">Guest Check-in</h1>
        <p className="mt-1 text-sm text-foreground-500">
          Check guests in and out of rooms at {session?.businessName || 'your hotel'}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id} className="rounded-lg border border-background-200 bg-background-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading text-lg font-bold text-foreground-950">
                  Room {room.number}
                </p>
                <p className="text-xs text-foreground-500">
                  {room.type} · {room.guests} guests
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusTone[room.status]}`}
              >
                {room.status}
              </span>
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
                  onClick={() => {
                    setCheckInRoom(room);
                    setGuestName('');
                  }}
                  className="flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
                >
                  <i className="ri-user-add-line" />
                  Check in
                </button>
              )}
              {room.status === 'Occupied' && (
                <button
                  type="button"
                  onClick={() => checkOut(room)}
                  className="flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-200 bg-background-50 text-sm font-semibold text-foreground-700 transition-colors hover:bg-background-100"
                >
                  <i className="ri-logout-box-r-line" />
                  Check out
                </button>
              )}
              {(room.status === 'Cleaning' || room.status === 'Maintenance') && (
                <p className="py-1.5 text-center text-xs text-foreground-400">
                  Not available for check-in
                </p>
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
        <div>
          <label htmlFor="staffGuestName" className="mb-1.5 block text-xs font-semibold text-foreground-600">
            Guest name
          </label>
          <input
            id="staffGuestName"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="e.g. Brian Kipchoge"
            className="h-10 w-full rounded-md border border-background-200 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </Modal>
    </div>
  );
}