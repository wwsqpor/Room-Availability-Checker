import { validateRequest, overlaps, collidesWithAny, checkAvailability, formatTime, formatDuration } from '../src/lib/time';
import { rooms } from '../src/data/room';

interface Booking { start: number; end: number; }

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail = '') {
  if (condition) {
    console.log(`  PASS  ${label}${detail ? '  ' + detail : ''}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}${detail ? '  ' + detail : ''}`);
    failed++;
  }
}

function expectAvailable(label: string, start: number, end: number, bookings: Booking[], blocked: boolean) {
  const validation = validateRequest(start, end, baseNow);
  if (!validation.ok) {
    check(label, false, `validation failed: ${validation.reason}`);
    return;
  }
  if (blocked) {
    check(label, false, 'room is blocked, expected unavailable');
    return;
  }
  const collision = collidesWithAny(start, end, bookings);
  check(label, !collision, collision ? `overlaps with existing booking` : `-> Available ${formatTime(start)}–${formatTime(end)}`);
}

function expectUnavailable(label: string, start: number, end: number, bookings: Booking[], blocked: boolean) {
  const validation = validateRequest(start, end, baseNow);
  if (!validation.ok) {
    check(label, true, `validation rejected: ${validation.reason}`);
    return;
  }
  if (blocked) {
    check(label, true, 'room blocked -> Unavailable');
    return;
  }
  const collision = collidesWithAny(start, end, bookings);
  check(label, collision, collision ? `overlaps -> Unavailable` : `expected unavailable but no overlap found`);
}

function expectInvalid(label: string, start: number, end: number) {
  const validation = validateRequest(start, end, baseNow);
  check(label, !validation.ok, validation.ok ? 'expected validation failure but got ok' : `rejected: ${validation.reason}`);
}

// ─── Base data ──────────────────────────────────────────────
const baseNow = 540;
const baseBookings: Booking[] = [{ start: 600, end: 660 }];

console.log('\n=== AC1: Integer range & ordering ===');

expectInvalid('start < 0', -10, 30);
expectInvalid('start = 0 but end = 0 (end not strictly greater)', 0, 0);
expectInvalid('end <= start (reversed times)', 660, 600);
expectInvalid('end = start (equal)', 600, 600);
expectInvalid('start > 1440', 1500, 1560);
expectInvalid('end > 1440', 1430, 1441);
expectInvalid('non-integer start', 600.5, 660);
expectInvalid('non-integer end', 600, 660.5);

// Valid boundary cases for AC1
expectInvalid('start = 0, end = 60 (day start boundary, before now)', 0, 60);
expectAvailable('start = 1380, end = 1440 (day end boundary)', 1380, 1440, baseBookings, false);
expectInvalid('start = 0, end = 120 (exactly 120 at day start, before now)', 0, 120);

console.log('\n=== AC2: Duration ≤ 120 minutes ===');

expectAvailable('exactly 120 min: 720–840', 720, 840, baseBookings, false);
expectInvalid('121 min: 720–841', 720, 841);
expectInvalid('130 min: 700–830', 700, 830);
expectAvailable('exactly 120 min: 660–780', 660, 780, baseBookings, false);
expectInvalid('1 min: 480–481 (start before now)', 480, 481);
expectAvailable('1 min: 541–542 (just after now)', 541, 542, baseBookings, false);

console.log('\n=== AC3: Blocked room always blocked ===');

// 660–720 would be available on an unblocked room (touching 660)
expectUnavailable('blocked: 660–720, blocked=True', 660, 720, baseBookings, true);
expectUnavailable('blocked: 480–540, blocked=True (no overlap)', 480, 540, baseBookings, true);
expectUnavailable('blocked: 0–60, blocked=True (far from bookings)', 0, 60, baseBookings, true);

console.log('\n=== AC4: Overlap detection (touching OK, overlap blocked) ===');

expectAvailable('touching at end: 660–720 (touches booking end 660)', 660, 720, baseBookings, false);
expectUnavailable('overlap: 630–690 (overlaps 600–660)', 630, 690, baseBookings, false);
// "Starts now" with now=540 means there's an ongoing booking (540,600) plus existing (600,660)
const nowBookings: Booking[] = [{ start: 540, end: 600 }, { start: 600, end: 660 }];
expectUnavailable('starts now: 540–570 overlaps ongoing (540,600)', 540, 570, nowBookings, false);

// Fully contained overlap
expectUnavailable('fully contained: 610–650 inside 600–660', 610, 650, baseBookings, false);
// Fully containing
expectUnavailable('fully containing: 590–670 wraps 600–660', 590, 670, baseBookings, false);
// Touching at start endpoint
expectInvalid('touching at start: 540–600 (start = now, rejected)', 540, 600);
expectAvailable('touching at start: 541–600 (touches booking start 600)', 541, 600, baseBookings, false);

console.log('\n=== AC5: Unambiguous results & no duplicated bookings ===');

// Verify collidesWithAny doesn't double-count
const multiBookings: Booking[] = [
  { start: 600, end: 660 },
  { start: 600, end: 660 }, // duplicate
];
const collisionCount = (start: number, end: number, bookings: Booking[]) =>
  bookings.filter((b) => overlaps(start, end, b.start, b.end)).length;

check('duplicate bookings counted twice (data issue, not logic)', collisionCount(630, 690, multiBookings) === 2, `count=${collisionCount(630, 690, multiBookings)}`);
check('single booking counted once', collisionCount(630, 690, baseBookings) === 1, `count=${collisionCount(630, 690, baseBookings)}`);

// collidesWithAny returns boolean regardless of count
check('collidesWithAny returns true for overlap', collidesWithAny(630, 690, baseBookings) === true);
check('collidesWithAny returns false for no overlap', collidesWithAny(660, 720, baseBookings) === false);

console.log('\n=== Multiple bookings ===');

const multi: Booking[] = [
  { start: 480, end: 540 },
  { start: 600, end: 660 },
  { start: 720, end: 780 },
  { start: 900, end: 960 },
];
expectInvalid('multi: 540–600 (start = now, rejected)', 540, 600);
expectAvailable('multi: 660–720 (gap between bk2 and bk3)', 660, 720, multi, false);
expectUnavailable('multi: 550–610 (overlaps bk2)', 550, 610, multi, false);
expectUnavailable('multi: 760–820 (overlaps bk3)', 760, 820, multi, false);
expectUnavailable('multi: 470–490 (overlaps bk1)', 470, 490, multi, false);
expectAvailable('multi: 780–900 (large gap, 120 min)', 780, 900, multi, false);
expectInvalid('multi: 780–901 (121 min in gap)', 780, 901);

console.log('\n=== Day bounds ===');

expectInvalid('0–60 at day start (before now)', 0, 60);
expectAvailable('1380–1440 at day end', 1380, 1440, baseBookings, false);
expectInvalid('0–120 at day start (before now)', 0, 120);
expectInvalid('1440–1440 (start=end=1440)', 1440, 1440);
expectInvalid('1439–1441 (end > 1440)', 1439, 1441);
expectInvalid('negative start: -1–60', -1, 60);

console.log('\n=== Reversed times ===');

expectInvalid('reversed: 660–600', 660, 600);
expectInvalid('reversed: 800–200', 800, 200);
expectInvalid('reversed equal: 500–500', 500, 500);

console.log('\n=== Unchanged inputs (immutability) ===');

const originalBookings: Booking[] = [{ start: 600, end: 660 }];
const snapshot = JSON.stringify(originalBookings);
collidesWithAny(630, 690, originalBookings);
validateRequest(630, 690, baseNow);
check('bookings array not mutated by collidesWithAny', JSON.stringify(originalBookings) === snapshot);
check('formatTime(600) = "10:00"', formatTime(600) === '10:00', `got "${formatTime(600)}"`);
check('formatTime(0) = "00:00"', formatTime(0) === '00:00', `got "${formatTime(0)}"`);
check('formatTime(1440) = "00:00" (wraps)', formatTime(1440) === '00:00', `got "${formatTime(1440)}"`);
check('formatDuration(120) = "2h"', formatDuration(120) === '2h', `got "${formatDuration(120)}"`);
check('formatDuration(90) = "1h 30 min"', formatDuration(90) === '1h 30 min', `got "${formatDuration(90)}"`);
check('formatDuration(45) = "45 min"', formatDuration(45) === '45 min', `got "${formatDuration(45)}"`);

console.log('\n=== checkAvailability (refactored decision function) ===');

// Minimal room-shaped fixtures matching the checkAvailability input shape.
const caRoom = {
  blocked: false,
  bookings: [
    { id: 'bk-a', start: 600, end: 660, student: 'A. Nguyen' },
  ],
};
const caBlocked = {
  blocked: true,
  blockReason: 'Maintenance',
  bookings: [
    { id: 'bk-a', start: 600, end: 660, student: 'A. Nguyen' },
  ],
};
const caNow = 540;

// AC3 — blocked takes priority over everything (including invalid ranges and overlaps)
{
  const r = checkAvailability(caBlocked, 0, 60, caNow);
  check('blocked: returns status=blocked even for invalid range', r.status === 'blocked', `got ${r.status}`);
}
{
  const r = checkAvailability(caBlocked, 630, 690, caNow);
  check('blocked: returns status=blocked even when overlap exists', r.status === 'blocked', `got ${r.status}`);
}
{
  const r = checkAvailability(caBlocked, 660, 720, caNow);
  check('blocked: returns status=blocked even when slot is free', r.status === 'blocked', `got ${r.status}`);
}

// Invalid delegates to validateRequest
{
  const r = checkAvailability(caRoom, 660, 600, caNow);
  check('invalid: reversed range returns status=invalid', r.status === 'invalid', `got ${r.status}`);
}
{
  const r = checkAvailability(caRoom, 540, 600, caNow);
  check('invalid: start=now returns status=invalid', r.status === 'invalid', `got ${r.status}`);
}
{
  const r = checkAvailability(caRoom, 720, 841, caNow);
  check('invalid: 121min returns status=invalid', r.status === 'invalid', `got ${r.status}`);
}

// AC4 — conflict detection
{
  const r = checkAvailability(caRoom, 630, 690, caNow);
  check('conflict: overlapping slot returns status=conflict', r.status === 'conflict', `got ${r.status}`);
  if (r.status === 'conflict') {
    check('conflict: single conflict returned', r.conflicts.length === 1, `count=${r.conflicts.length}`);
    check('conflict: conflict has booking id', r.conflicts[0].id === 'bk-a', `id=${r.conflicts[0].id}`);
  }
}
{
  const r = checkAvailability(caRoom, 660, 720, caNow);
  check('conflict: touching endpoint is available', r.status === 'available', `got ${r.status}`);
}

// Available
{
  const r = checkAvailability(caRoom, 720, 780, caNow);
  check('available: free slot returns status=available', r.status === 'available', `got ${r.status}`);
}

// Immutability — checkAvailability must not mutate the room or its bookings
{
  const snapshot = JSON.stringify(caRoom);
  checkAvailability(caRoom, 630, 690, caNow);
  check('immutability: room fixture not mutated', JSON.stringify(caRoom) === snapshot);
}

console.log('\n=== Regression: checkAvailability for all seven scenarios ===');

// now=540 (09:00). Room has one booking 600–660 (10:00–11:00).
const regRoom = {
  blocked: false,
  bookings: [{ id: 'bk-1', start: 600, end: 660, student: 'A. Nguyen' }],
};
const regBlocked = {
  blocked: true,
  blockReason: 'Maintenance',
  bookings: [{ id: 'bk-1', start: 600, end: 660, student: 'A. Nguyen' }],
};
const regNow = 540;

// ── 1. Past time (AC1: start must be strictly after now) ──
// 480 (08:00) is before now=540, so validateRequest rejects with
// "Start time must be strictly after the current time."
{
  const r = checkAvailability(regRoom, 480, 500, regNow);
  check('past time: status=invalid', r.status === 'invalid', `got ${r.status}`);
  if (r.status === 'invalid') {
    check('past time: reason mentions "after the current time"', r.reason.includes('after the current time'), `reason="${r.reason}"`);
  }
}

// ── 2. Reversed interval (AC1: end must be strictly greater than start) ──
// start=660, end=600 → end < start, rejected.
{
  const r = checkAvailability(regRoom, 660, 600, regNow);
  check('reversed interval: status=invalid', r.status === 'invalid', `got ${r.status}`);
  if (r.status === 'invalid') {
    check('reversed interval: reason mentions "strictly greater"', r.reason.includes('strictly greater'), `reason="${r.reason}"`);
  }
}

// ── 3. 121-minute duration (AC2: duration must not exceed 120 min) ──
// 720–841 = 121 min, rejected even though the slot is free.
{
  const r = checkAvailability(regRoom, 720, 841, regNow);
  check('121-min duration: status=invalid', r.status === 'invalid', `got ${r.status}`);
  if (r.status === 'invalid') {
    check('121-min duration: reason mentions "120 minutes"', r.reason.includes('120 minutes'), `reason="${r.reason}"`);
  }
}

// ── 4. Blocked room (AC3: blocked always returns blocked, priority over all) ──
// Slot 720–780 is free and valid, but room is blocked → status=blocked.
{
  const r = checkAvailability(regBlocked, 720, 780, regNow);
  check('blocked room (free slot): status=blocked', r.status === 'blocked', `got ${r.status}`);
  if (r.status === 'blocked') {
    check('blocked room: carries blockReason', r.reason === 'Maintenance', `reason="${r.reason}"`);
  }
}
// Blocked takes priority even when the request is also invalid (past time).
{
  const r = checkAvailability(regBlocked, 480, 500, regNow);
  check('blocked room (also past time): status=blocked, not invalid', r.status === 'blocked', `got ${r.status}`);
}
// Blocked takes priority even when the slot overlaps an existing booking.
{
  const r = checkAvailability(regBlocked, 630, 690, regNow);
  check('blocked room (also overlap): status=blocked, not conflict', r.status === 'blocked', `got ${r.status}`);
}

// ── 5. Overlap (AC4: overlapping existing booking → conflict) ──
// 630–690 overlaps 600–660 → status=conflict, with the booking in conflicts[].
{
  const r = checkAvailability(regRoom, 630, 690, regNow);
  check('overlap: status=conflict', r.status === 'conflict', `got ${r.status}`);
  if (r.status === 'conflict') {
    check('overlap: one conflict returned', r.conflicts.length === 1, `count=${r.conflicts.length}`);
    check('overlap: conflict id matches booking', r.conflicts[0].id === 'bk-1', `id=${r.conflicts[0].id}`);
  }
}

// ── 6. Touching endpoints (AC4: touching is NOT an overlap → available) ──
// 660–720 touches booking end 660 → no overlap → available.
{
  const r = checkAvailability(regRoom, 660, 720, regNow);
  check('touching at end: status=available', r.status === 'available', `got ${r.status}`);
}
// 541–600 touches booking start 600 (and start > now) → available.
{
  const r = checkAvailability(regRoom, 541, 600, regNow);
  check('touching at start: status=available', r.status === 'available', `got ${r.status}`);
}

// ── 7. Unchanged fixtures (AC5/AC6: no mutation of room or booking data) ──
// Run checkAvailability against every real fixture room; none should mutate.
{
  const snapshot = JSON.stringify(rooms);
  for (const r of rooms) {
    checkAvailability(r, 700, 760, regNow);
  }
  check('fixture rooms not mutated after checkAvailability', JSON.stringify(rooms) === snapshot);
}
// Also verify the inline regression fixture is not mutated.
{
  const snapshot = JSON.stringify(regRoom);
  checkAvailability(regRoom, 630, 690, regNow);
  check('regression fixture not mutated', JSON.stringify(regRoom) === snapshot);
}

console.log('\n=== Summary ===');
console.log(`  ${passed} passed, ${failed} failed`);
console.log(failed > 0 ? '  STATUS: FAILED' : '  STATUS: ALL PASSED');

process.exit(failed > 0 ? 1 : 0);
