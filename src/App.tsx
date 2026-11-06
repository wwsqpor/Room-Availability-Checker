import { useState } from 'react';
import { MapPin, Users, Layers, Ban, CheckCircle2, XCircle, ArrowLeft, Building2 } from 'lucide-react';
import { rooms, type Room } from '@/data/room';
import { checkAvailability, formatTime, type AvailabilityResult } from '@/lib/time';
import { featureIcons, fallbackFeatureIcon } from '@/lib/features';
import Timeline from '@/components/Timeline';
import BookingForm, { type FormResult } from '@/components/BookingForm';
import ResultCard from '@/components/ResultCard';
import BookingsList from '@/components/BookingsList';
import RoomCatalog from '@/components/RoomCatalog';

// Fixed fictional current time (09:00)
const NOW = 540;

export default function App() {
  const [selected, setSelected] = useState<Room | null>(null);

  const openCatalog = () => setSelected(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <button onClick={openCatalog} className="flex items-center gap-2 text-left transition hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-800">CampusRoom</p>
              <p className="text-xs text-slate-400">Availability checker</p>
            </div>
          </button>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            Today
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {selected ? (
          // F5 — key by room id so switching rooms mounts a fresh RoomDetail and resets all internal state
          <RoomDetail key={selected.id} room={selected} now={NOW} onBack={openCatalog} />
        ) : (
          <>
            {/* Intro */}
            <section className="mb-6">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800 sm:text-3xl">
                <Building2 className="h-7 w-7 text-sky-600" />
                Find a study room
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Browse {rooms.length} bookable rooms across campus. Filter by capacity and equipment, then pick a room to check availability.
              </p>
            </section>
            <RoomCatalog rooms={rooms} now={NOW} onSelect={setSelected} />
          </>
        )}

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-400">
          This page checks availability only. No booking is created or confirmed.
        </p>
      </main>
    </div>
  );
}

interface RoomDetailProps {
  room: Room;
  now: number;
  onBack: () => void;
}

function RoomDetail({ room, now, onBack }: RoomDetailProps) {
  const [request, setRequest] = useState<FormResult | null>(null);

  const result: AvailabilityResult | null = request
    ? checkAvailability(room, request.start, request.end, now)
    : null;
  const timelineOk = !!request && result?.status === 'available';

  return (
    <>
      {/* Back link */}
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 transition hover:text-sky-700"
      >
        <ArrowLeft className="h-4 w-4" /> All rooms
      </button>

      {/* Room hero */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">{room.name}</h1>
              {room.blocked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                  <Ban className="h-3 w-3" /> Blocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Open
                </span>
              )}
            </div>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <Layers className="h-4 w-4" /> {room.building} · Floor {room.floor}
              <span className="mx-1 text-slate-300">|</span>
              <Users className="h-4 w-4" /> Up to {room.capacity} people
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Bookable hours: {formatTime(room.openFrom)} – {formatTime(room.openTo)}
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2">
            {room.features.map((f) => {
              const Icon = featureIcons[f] ?? fallbackFeatureIcon;
              return (
                <span key={f} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                  <Icon className="h-3.5 w-3.5 text-sky-500" /> {f}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <div className="mb-6">
        <Timeline
          room={room}
          candidateStart={request?.start ?? null}
          candidateEnd={request?.end ?? null}
          candidateOk={timelineOk}
        />
      </div>

      {/* Grid: form + result */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BookingForm room={room} now={now} disabled={room.blocked} onCheck={setRequest} />
        </div>
        <div className="lg:col-span-2">
          {request && result ? (
            <ResultCard room={room} request={request} result={result} />
          ) : (
            <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-6 text-center">
              <XCircle className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-400">
                Select a start and end time, then check availability.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Existing bookings */}
      <div className="mt-6">
        <BookingsList room={room} />
      </div>
    </>
  );
}
