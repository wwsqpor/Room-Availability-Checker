export interface Booking {
  id: string;
  start: number; // minutes from 00:00, integer 0..1440
  end: number;   // minutes from 00:00, integer 0..1440
  student: string;
  purpose: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  blocked: boolean;
  blockReason?: string;
  openFrom: number; // earliest bookable minute
  openTo: number;   // latest bookable minute (exclusive endpoint)
  features: string[];
  bookings: Booking[];
}

export const FEATURES = [
  'Whiteboard',
  'Power outlets',
  'Video screen',
  'Wi-Fi',
  'Projector',
  'Sound system',
  'Audio recording',
  'Video conferencing',
] as const;

export const rooms: Room[] = [
  {
    id: 'B-204',
    name: 'Study Room B-204',
    building: 'Riverside Library',
    floor: 2,
    capacity: 6,
    blocked: false,
    openFrom: 480,  // 08:00
    openTo: 1320,   // 22:00
    features: ['Whiteboard', 'Power outlets', 'Video screen', 'Wi-Fi'],
    bookings: [
      { id: 'bk-1', start: 540,  end: 600,  student: 'A. Nguyen',  purpose: 'Group project review' },
      { id: 'bk-2', start: 720,  end: 780,  student: 'M. Patel',    purpose: 'Thesis writing' },
      { id: 'bk-3', start: 900,  end: 960,  student: 'L. Okonkwo',  purpose: 'Language club prep' },
      { id: 'bk-4', start: 1080, end: 1140, student: 'S. Bergman',  purpose: 'Peer tutoring' },
      { id: 'bk-5', start: 1200, end: 1260, student: 'R. Kim',      purpose: 'Research discussion' },
    ],
  },
  {
    id: 'A-101',
    name: 'Lecture Hall A-101',
    building: 'Engineering Block',
    floor: 1,
    capacity: 40,
    blocked: false,
    openFrom: 480,
    openTo: 1200, // 20:00
    features: ['Projector', 'Sound system', 'Video conferencing', 'Power outlets', 'Wi-Fi'],
    bookings: [
      { id: 'a101-1', start: 540,  end: 660,  student: 'Dr. Osei',     purpose: 'Mechanics lecture' },
      { id: 'a101-2', start: 780,  end: 840,  student: 'C. Reyes',     purpose: 'Seminar: robotics' },
      { id: 'a101-3', start: 1020, end: 1080, student: 'J. Tanaka',    purpose: 'Guest talk — alumni' },
    ],
  },
  {
    id: 'C-310',
    name: 'Media Studio C-310',
    building: 'Arts Centre',
    floor: 3,
    capacity: 12,
    blocked: false,
    openFrom: 540, // 09:00
    openTo: 1260, // 21:00
    features: ['Video screen', 'Sound system', 'Audio recording', 'Power outlets', 'Wi-Fi'],
    bookings: [
      { id: 'c310-1', start: 600,  end: 660,  student: 'P. Adeyemi',   purpose: 'Podcast recording' },
      { id: 'c310-2', start: 840,  end: 900,  student: 'N. Schmidt',   purpose: 'Video editing session' },
      { id: 'c310-3', start: 1140, end: 1200, student: 'E. Rossi',     purpose: 'Music rehearsal' },
    ],
  },
  {
    id: 'D-015',
    name: 'Meeting Room D-015',
    building: 'Business School',
    floor: 0,
    capacity: 4,
    blocked: true,
    blockReason: 'Undergoing AV maintenance.',
    openFrom: 480,
    openTo: 1200,
    features: ['Video conferencing', 'Whiteboard', 'Power outlets', 'Wi-Fi'],
    bookings: [],
  },
  {
    id: 'B-108',
    name: 'Quiet Study Pod B-108',
    building: 'Riverside Library',
    floor: 1,
    capacity: 2,
    blocked: false,
    openFrom: 480,
    openTo: 1320,
    features: ['Power outlets', 'Wi-Fi'],
    bookings: [
      { id: 'b108-1', start: 660, end: 720, student: 'T. Andersson', purpose: 'Solo revision' },
      { id: 'b108-2', start: 960, end: 1020, student: 'K. Mwangi',   purpose: 'Online proctored exam' },
    ],
  },
  {
    id: 'E-220',
    name: 'Collab Lab E-220',
    building: 'Innovation Hub',
    floor: 2,
    capacity: 20,
    blocked: false,
    openFrom: 540,
    openTo: 1260,
    features: ['Whiteboard', 'Projector', 'Video screen', 'Power outlets', 'Wi-Fi'],
    bookings: [
      { id: 'e220-1', start: 600,  end: 720,  student: 'F. Hassan',   purpose: 'Design sprint' },
      { id: 'e220-2', start: 840,  end: 960,  student: 'M. Lopez',    purpose: 'Hackathon prep' },
      { id: 'e220-3', start: 1080, end: 1140, student: 'Y. Chen',     purpose: 'Pitch rehearsal' },
    ],
  },
];

export const room: Room = rooms[0];
