import { useMemo, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { formatTime, formatDuration, validateRequest } from '@/lib/time';
import type { Room } from '@/data/room';

export interface FormResult {
  start: number;
  end: number;
}

interface BookingFormProps {
  room: Room;
  now: number;
  disabled: boolean;
  onCheck: (result: FormResult) => void;
}

const TIME_OPTIONS = Array.from({ length: 145 }, (_, i) => i * 10); // 0,10,...,1440

export default function BookingForm({ room, now, disabled, onCheck }: BookingFormProps) {
  const [start, setStart] = useState<number>(600);
  const [end, setEnd] = useState<number>(660);
  const [touched, setTouched] = useState(false);

  const duration = end - start;
  const rangeError = useMemo(() => {
    const validation = validateRequest(start, end, now);
    return validation.ok ? null : validation.reason;
  }, [start, end, now]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (rangeError || disabled) return;
    onCheck({ start, end });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
        <Clock className="h-5 w-5 text-sky-600" />
        Check availability
      </h2>

      {room.blocked && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>This room is currently blocked — no booking requests are allowed.</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Start */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Start time</span>
          <div className="relative">
            <select
              value={start}
              disabled={disabled}
              onChange={(e) => { setStart(Number(e.target.value)); setTouched(true); }}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-16 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              {TIME_OPTIONS.map((m) => (
                <option key={m} value={m}>{formatTime(m)}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              {formatTime(start)}
            </span>
          </div>
        </label>

        {/* End */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">End time</span>
          <div className="relative">
            <select
              value={end}
              disabled={disabled}
              onChange={(e) => { setEnd(Number(e.target.value)); setTouched(true); }}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-16 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              {TIME_OPTIONS.map((m) => (
                <option key={m} value={m}>{formatTime(m)}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              {formatTime(end)}
            </span>
          </div>
        </label>
      </div>

      {/* Duration chip */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-slate-500">Duration:</span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          duration > 0 && duration <= 120
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-rose-50 text-rose-700'
        }`}>
          {duration > 0 ? formatDuration(duration) : '—'}
        </span>
        <span className="text-xs text-slate-400">(max 120 min)</span>
      </div>

      {/* Validation feedback */}
      {touched && rangeError && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{rangeError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || !!rangeError}
        className="mt-4 w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[.99] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Check availability
      </button>
    </form>
  );
}
