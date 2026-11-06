import { useMemo, useState } from 'react';
import { Users, SlidersHorizontal, MapPin, Layers, ArrowRight, Search, UsersRound } from 'lucide-react';
import type { Room } from '@/data/room';
import { FEATURES } from '@/data/room';
import { featureIcons, fallbackFeatureIcon } from '@/lib/features';
import { formatTime, collidesWithAny } from '@/lib/time';

interface RoomCatalogProps {
  rooms: Room[];
  now: number;
  onSelect: (room: Room) => void;
}

export default function RoomCatalog({ rooms, now, onSelect }: RoomCatalogProps) {
  const [query, setQuery] = useState('');
  const [attendees, setAttendees] = useState(0);
  const [requiredFeatures, setRequiredFeatures] = useState<string[]>([]);

  const toggleFeature = (f: string) =>
    setRequiredFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  // F1 — capacity >= requested attendees; F3 — blocked rooms never shown as available
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter((r) => {
      if (r.blocked) return false;
      if (r.capacity < attendees) return false;
      if (requiredFeatures.length && !requiredFeatures.every((f) => r.features.includes(f))) return false;
      if (q) {
        const haystack = `${r.name} ${r.building}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rooms, query, attendees, requiredFeatures]);

  const activeFilterCount =
    (attendees > 0 ? 1 : 0) + requiredFeatures.length;

  const clearAll = () => {
    setQuery('');
    setAttendees(0);
    setRequiredFeatures([]);
  };

  return (
    <section>
      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 sm:text-lg">
            <SlidersHorizontal className="h-5 w-5 text-sky-600" />
            Filter rooms
          </h2>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-sky-600 transition hover:text-sky-700"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Search */}
          <label className="block lg:col-span-1">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Room or building name"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </label>

          {/* F1 — Capacity: requested attendees */}
          <label className="block lg:col-span-1">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Minimum capacity (attendees)
            </span>
            <div className="relative">
              <UsersRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min={0}
                max={99}
                value={attendees === 0 ? '' : attendees}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setAttendees(Number.isFinite(v) && v > 0 ? v : 0);
                }}
                placeholder="Any"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </label>
        </div>

        {/* F2 — Equipment: room must contain ALL selected items */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Required equipment <span className="font-normal normal-case text-slate-400">(room must have all selected)</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => {
              const active = requiredFeatures.includes(f);
              const Icon = featureIcons[f] ?? fallbackFeatureIcon;
              return (
                <button
                  key={f}
                  onClick={() => toggleFeature(f)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-sky-500'}`} />
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-3 text-sm text-slate-500">
        {filtered.length} room{filtered.length === 1 ? '' : 's'} available
      </p>

      {/* F4 — clear empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-10 text-center">
          <Search className="mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No rooms match your filters</p>
          <p className="mt-1 text-xs text-slate-400">Try reducing the capacity requirement or removing some equipment.</p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const currentlyBooked = collidesWithAny(now, now + 1, r.bookings);
            return (
              <button
                key={r.id}
                onClick={() => onSelect(r)}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 sm:text-lg">{r.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {r.building} · <Layers className="h-3.5 w-3.5" /> Floor {r.floor}
                    </p>
                  </div>
                  {currentlyBooked ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      In use
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Open
                    </span>
                  )}
                </div>

                <p className="mb-3 flex items-center gap-1.5 text-sm text-slate-600">
                  <Users className="h-4 w-4 text-sky-500" /> Up to {r.capacity} people
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs text-slate-400">{formatTime(r.openFrom)}–{formatTime(r.openTo)}</span>
                </p>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {r.features.map((f) => {
                    const Icon = featureIcons[f] ?? fallbackFeatureIcon;
                    return (
                      <span key={f} className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                        <Icon className="h-3 w-3 text-sky-500" /> {f}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">
                    {r.bookings.length} booking{r.bookings.length === 1 ? '' : 's'} today
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 transition group-hover:gap-1.5">
                    Check <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
