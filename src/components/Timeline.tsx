import { formatTime } from '@/lib/time';
import type { Room } from '@/data/room';

interface TimelineProps {
  room: Room;
  candidateStart: number | null;
  candidateEnd: number | null;
  candidateOk: boolean;
}

const HOURS = Array.from({ length: 25 }, (_, i) => i * 60); // 0..1440

export default function Timeline({ room, candidateStart, candidateEnd, candidateOk }: TimelineProps) {
  const pct = (m: number) => `${(m / 1440) * 100}%`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">24-hour timeline</h2>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-300" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" /> Booked
          </span>
          {room.blocked && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-500" /> Blocked
            </span>
          )}
          {candidateStart !== null && candidateEnd !== null && (
            <span className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-sm ${candidateOk ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              Your request
            </span>
          )}
        </div>
      </div>

      {/* Track */}
      <div className="relative h-14 w-full overflow-hidden rounded-lg bg-slate-100">
        {/* Hour delimiters */}
        {HOURS.slice(1, -1).map((m) => (
          <div
            key={`delim-${m}`}
            className="absolute top-0 z-0 h-full w-px bg-slate-300/70"
            style={{ left: pct(m) }}
            aria-hidden
          />
        ))}

        {/* Blocked overlay */}
        {room.blocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-rose-500/70 text-xs font-semibold text-white">
            Room blocked — no bookings allowed
          </div>
        )}

        {/* Existing bookings */}
        {!room.blocked &&
          room.bookings.map((b) => (
            <div
              key={b.id}
              className="absolute top-0 z-10 h-full bg-amber-400/85"
              style={{ left: pct(b.start), width: pct(b.end - b.start) }}
              title={`Booked ${formatTime(b.start)}–${formatTime(b.end)}`}
            />
          ))}

        {/* Candidate interval */}
        {!room.blocked && candidateStart !== null && candidateEnd !== null && (
          <div
            className={`absolute top-0 z-20 flex h-full items-center justify-center border-x-2 text-[10px] font-bold text-white ${
              candidateOk ? 'border-emerald-600 bg-emerald-500/60' : 'border-rose-600 bg-rose-500/50'
            }`}
            style={{ left: pct(candidateStart), width: pct(candidateEnd - candidateStart) }}
          >
            {candidateEnd - candidateStart <= 0 ? '' : `${candidateEnd - candidateStart}m`}
          </div>
        )}
      </div>

      {/* Hour labels — every 6h on mobile, every 2h on larger screens */}
      <div className="relative mt-1.5 h-5 w-full">
        {HOURS.filter((_, i) => i % 2 === 0).map((m, i) => (
          <div
            key={m}
            className={`absolute -translate-x-1/2 text-[10px] tabular-nums text-slate-400 ${
              i % 3 === 0 ? '' : 'hidden sm:block'
            }`}
            style={{ left: pct(m) }}
          >
            {formatTime(m)}
          </div>
        ))}
      </div>
    </div>
  );
}
