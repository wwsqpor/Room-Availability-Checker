import { CheckCircle2, XCircle } from 'lucide-react';
import { formatTime, formatDuration, type AvailabilityResult } from '@/lib/time';
import type { Room } from '@/data/room';
import type { FormResult } from './BookingForm';

interface ResultCardProps {
  room: Room;
  request: FormResult;
  result: AvailabilityResult;
}

export default function ResultCard({ room, request, result }: ResultCardProps) {
  const { start, end } = request;
  const duration = end - start;

  if (result.status === 'blocked') {
    return (
      <Card tone="error" icon={<XCircle className="h-6 w-6 text-rose-500" />}>
        <h3 className="text-lg font-bold text-rose-700">Unavailable — Room blocked</h3>
        <p className="mt-1 text-sm text-rose-600">
          {result.reason ?? 'This room is blocked and no booking requests are permitted at this time.'}
        </p>
        <DetailRow label="Requested" value={`${formatTime(start)} – ${formatTime(end)} (${formatDuration(duration)})`} />
      </Card>
    );
  }

  if (result.status === 'conflict') {
    const { conflicts } = result;
    return (
      <Card tone="error" icon={<XCircle className="h-6 w-6 text-rose-500" />}>
        <h3 className="text-lg font-bold text-rose-700">Unavailable — Time conflict</h3>
        <p className="mt-1 text-sm text-rose-600">
          The requested {formatDuration(duration)} slot overlaps with {conflicts.length === 1 ? 'an existing booking' : `${conflicts.length} existing bookings`}.
        </p>
        <DetailRow label="Requested" value={`${formatTime(start)} – ${formatTime(end)}`} />
        <div className="mt-3 space-y-1.5">
          {conflicts.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-md bg-rose-50 px-3 py-1.5 text-xs">
              <span className="font-medium text-rose-700">{formatTime(b.start)} – {formatTime(b.end)}</span>
              <span className="text-rose-500">{b.student}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (result.status === 'invalid') {
    return (
      <Card tone="error" icon={<XCircle className="h-6 w-6 text-rose-500" />}>
        <h3 className="text-lg font-bold text-rose-700">Unavailable — Invalid request</h3>
        <p className="mt-1 text-sm text-rose-600">{result.reason}</p>
      </Card>
    );
  }

  // Available
  return (
    <Card tone="success" icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />}>
      <h3 className="text-lg font-bold text-emerald-700">Available</h3>
      <p className="mt-1 text-sm text-emerald-600">
        The slot {formatTime(start)} – {formatTime(end)} ({formatDuration(duration)}) is free and within the 120-minute limit.
      </p>
      <DetailRow label="Room" value={room.name} />
      <DetailRow label="Slot" value={`${formatTime(start)} – ${formatTime(end)}`} />
      <DetailRow label="Duration" value={formatDuration(duration)} />
      <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
        Availability confirmed only — this does not create a booking.
      </p>
    </Card>
  );
}

function Card({ tone, icon, children }: { tone: 'success' | 'error'; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${
      tone === 'success' ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'
    }`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">{icon}</div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 flex items-center justify-between border-b border-current/10 pb-1.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
