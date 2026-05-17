import type { ReservationStatus, TicketStatus } from './types'

export const RESTAURANT_NAME = 'La Tavola'
export const RESTAURANT_TAGLINE = 'A refined journey of taste, tradition, and Italian soul.'
export const RESTAURANT_ADDRESS = '14 Via della Seta, Warsaw · Poland'
export const RESTAURANT_PHONE = '+48 22 555 0190'
export const RESTAURANT_EMAIL = 'reservations@latavola.pl'
export const RESTAURANT_HOURS = 'Tue – Sun  18:00 – 23:30'

export const palette = {
  black: '#080706',
  ivory: '#F8F4EC',
  gold: '#C5A059',
  glass: 'rgba(248, 244, 236, 0.055)',
}

export const reservationStatuses: ReservationStatus[] = [
  'Pending',
  'Approved',
  'Rejected',
  'Cancelled',
  'Completed',
]

export const ticketStatuses: TicketStatus[] = [
  'New',
  'InProgress',
  'Resolved',
  'Closed',
]

export const menuHighlights = [
  {
    category: 'Antipasti',
    items: [
      { name: 'Burrata con Tartufo', desc: 'Creamy burrata, black truffle shavings, aged balsamic', price: '68 PLN' },
      { name: 'Carpaccio di Manzo', desc: 'Wagyu beef, capers, Parmigiano Reggiano, lemon oil', price: '74 PLN' },
      { name: 'Polpo alla Griglia', desc: 'Grilled octopus, nduja, smoked paprika aioli', price: '82 PLN' },
    ],
  },
  {
    category: 'Primi',
    items: [
      { name: 'Tagliolini al Tartufo Nero', desc: 'Hand-cut pasta, black truffle, Parmigiano, butter', price: '96 PLN' },
      { name: 'Risotto ai Funghi Porcini', desc: 'Carnaroli rice, porcini, aged Pecorino, white wine', price: '88 PLN' },
      { name: 'Gnocchi di Patate', desc: 'Potato gnocchi, gorgonzola dolce, walnuts, sage', price: '78 PLN' },
    ],
  },
  {
    category: 'Secondi',
    items: [
      { name: 'Filetto di Manzo', desc: 'Beef tenderloin, Barolo reduction, roasted bone marrow', price: '148 PLN' },
      { name: 'Branzino al Forno', desc: 'Whole sea bass, caponata, salsa verde, lemon', price: '124 PLN' },
      { name: 'Agnello in Crosta', desc: 'Herb-crusted lamb rack, rosemary jus, grilled polenta', price: '138 PLN' },
    ],
  },
]

export const experiences = [
  {
    title: 'Chef\'s Table',
    desc: 'An intimate six-course tasting menu prepared tableside by our head chef. Limited to four guests per evening.',
    icon: '✦',
  },
  {
    title: 'Wine Cellar Dinner',
    desc: 'Dine among 800 curated labels in our underground cellar. Sommelier-guided pairing for every course.',
    icon: '◈',
  },
  {
    title: 'Private Terrace',
    desc: 'An exclusive outdoor setting for two, adorned with candlelight and seasonal florals. Perfect for celebrations.',
    icon: '◇',
  },
]

// Floor plan tables — positions in % of container
export const floorTables = [
  { id: 'T1', name: "Chef's Table",  zone: 'Chef\'s Corner',  area: 'Indoor',  level: 'Main Floor',  shape: 'round', x: 15, y: 20, seats: 4, minParty: 2 },
  { id: 'T2', name: 'Terrace Table', zone: 'Private Terrace', area: 'Outdoor', level: 'Terrace',     shape: 'round', x: 55, y: 14, seats: 2, minParty: 1 },
  { id: 'T3', name: 'Salon A',       zone: 'Grand Salon',     area: 'Indoor',  level: 'Main Floor',  shape: 'rect',  x: 32, y: 42, seats: 6, minParty: 3 },
  { id: 'T4', name: 'Salon B',       zone: 'Grand Salon',     area: 'Indoor',  level: 'Main Floor',  shape: 'rect',  x: 68, y: 42, seats: 6, minParty: 3 },
  { id: 'T5', name: 'Cellar Niche',  zone: 'Wine Cellar',     area: 'Indoor',  level: 'Lower Level', shape: 'round', x: 18, y: 70, seats: 4, minParty: 2 },
  { id: 'T6', name: 'Alcove',        zone: 'Private Alcove',  area: 'Indoor',  level: 'Lower Level', shape: 'round', x: 50, y: 72, seats: 2, minParty: 1 },
  { id: 'T7', name: 'Garden Table',  zone: 'Garden Room',     area: 'Outdoor', level: 'Garden',      shape: 'rect',  x: 80, y: 68, seats: 8, minParty: 4 },
  { id: 'T8', name: 'Bar Counter',   zone: 'Bar',             area: 'Indoor',  level: 'Main Floor',  shape: 'rect',  x: 82, y: 22, seats: 3, minParty: 1 },
] as const

export type FloorTableId = typeof floorTables[number]['id']

export const ADMIN_EMAIL = 'admin@latavola.pl'
