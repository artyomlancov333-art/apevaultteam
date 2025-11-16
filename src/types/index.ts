// User types
export interface User {
  id: string
  name: string
  login: string
  password: string
}

// Slot types
export interface TimeSlot {
  start: string // HH:mm format
  end: string
}

export interface WorkSlot {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  slots: TimeSlot[]
  comment?: string
  participants: string[] // user IDs
}

// Day status types
export interface DayStatus {
  id: string
  userId: string
  date: string
  type: 'dayoff' | 'sick' | 'vacation'
  comment?: string
  endDate?: string // for multi-day statuses
}

// Earnings types
export interface Earnings {
  id: string
  userId: string
  date: string
  amount: number
  poolAmount: number
  slotId: string
  participants: string[] // for shared earnings
}

// Rating types
export interface RatingData {
  userId: string
  earnings: number
  messages: number
  initiatives: number
  signals: number
  profitableSignals: number
  referrals: number
  daysOff: number
  sickDays: number
  vacationDays: number
  poolAmount: number
  rating: number
  lastUpdated: string
}

// Team members
export const TEAM_MEMBERS: User[] = [
  { id: '1', name: 'Артём', login: 'artyom03', password: '248artdex' },
  { id: '2', name: 'Адель', login: 'adel05', password: '058adeldex' },
  { id: '3', name: 'Ксения', login: 'ksen03', password: '907ksendex' },
  { id: '4', name: 'Ольга', login: 'olga04', password: '638olgadex' },
  { id: '5', name: 'Анастасия', login: 'anastasia05', password: '638anastadex' },
]

