export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export const formatTime = (totalMinutes: number): string => {
  const clamped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m} min`;
};

export const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number): boolean =>
  aStart < bEnd && bStart < aEnd;

export const collidesWithAny = (start: number, end: number, bookings: { start: number; end: number }[]): boolean =>
  bookings.some((b) => overlaps(start, end, b.start, b.end));

export type AvailabilityResult =
  | { status: 'available' }
  | { status: 'invalid'; reason: string }
  | { status: 'blocked'; reason?: string }
  | { status: 'conflict'; conflicts: { id: string; start: number; end: number; student: string }[] };

export const checkAvailability = (
  room: { blocked: boolean; blockReason?: string; bookings: { id: string; start: number; end: number; student: string }[] },
  start: number,
  end: number,
  now: number,
): AvailabilityResult => {
  if (room.blocked) {
    return { status: 'blocked', reason: room.blockReason };
  }

  const validation = validateRequest(start, end, now);
  if (!validation.ok) {
    return { status: 'invalid', reason: validation.reason };
  }

  const conflicts = room.bookings.filter((b) => overlaps(start, end, b.start, b.end));
  if (conflicts.length > 0) {
    return { status: 'conflict', conflicts };
  }

  return { status: 'available' };
};

export const validateRequest = (startRaw: number, endRaw: number, now: number): ValidationResult => {
  const start = Math.round(startRaw);
  const end = Math.round(endRaw);

  if (!Number.isFinite(start)) return { ok: false, reason: 'Start time is not a valid number.' };
  if (!Number.isFinite(end)) return { ok: false, reason: 'End time is not a valid number.' };

  if (!Number.isInteger(startRaw) || startRaw !== start)
    return { ok: false, reason: 'Start time must be a whole number (in minutes).' };
  if (!Number.isInteger(endRaw) || endRaw !== end)
    return { ok: false, reason: 'End time must be a whole number (in minutes).' };

  if (start < 0) return { ok: false, reason: 'Start time must be at least 0 (00:00).' };
  if (start > 1440) return { ok: false, reason: 'Start time must not exceed 1440.' };

  if (start <= now) return { ok: false, reason: 'Start time must be strictly after the current time.' };

  if (end <= start) return { ok: false, reason: 'End time must be strictly greater than the start time.' };
  if (end > 1440) return { ok: false, reason: 'End time must be at most 1440 (24:00).' };

  const duration = end - start;
  if (duration > 120) return { ok: false, reason: `Duration must not exceed 120 minutes (requested ${duration} min).` };

  return { ok: true };
};
