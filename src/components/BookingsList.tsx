import { CalendarDays } from 'lucide-react';
import { formatTime, formatDuration } from '@/lib/time';
import type { Room } from '@/data/room';

interface BookingsListProps {
  room: Room;
}

export default function BookingsList({ room }: BookingsListProps) {
  const sorted = [...room.bookings].sort((a, b) => a.start - b.start);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
        <CalendarDays className="h-5 w-5 text-sky-600" />
        Existing bookings
        <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {sorted.length}
        </span>
      </h2>

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No bookings for this room today.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sorted.map((b) => (
            <li key={b.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-amber-50 text-amber-700">
                  <span className="text-xs font-semibold leading-tight">{formatDuration(b.end - b.start)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {formatTime(b.start)} – {formatTime(b.end)}
                  </p>
                  <p className="text-xs text-slate-400">{b.purpose}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500 sm:text-right">{b.student}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
