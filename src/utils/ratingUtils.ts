// Rating calculation utilities
import { RatingData } from '@/types'

export const calculateRating = (data: Omit<RatingData, 'rating'>): number => {
  let rating = 0

  // Earnings > 3000 rubles per week = 15%
  if (data.earnings > 3000) {
    rating += 15
  }

  // Days off: 0 = 10%, 1-2 = 5%, >2 = 0%
  if (data.daysOff === 0) {
    rating += 10
  } else if (data.daysOff <= 2) {
    rating += 5
  }

  // Sick days: 0 or <7 = 10%, >=7 = 3%
  if (data.sickDays === 0 || data.sickDays < 7) {
    rating += 10
  } else {
    rating += 3
  }

  // Vacation: 0 or <4 = 15%, >=4 = 1%
  if (data.vacationDays === 0 || data.vacationDays < 4) {
    rating += 15
  } else {
    rating += 1
  }

  // Initiatives > 3 = 10%
  if (data.initiatives > 3) {
    rating += 10
  }

  // Signals >= 10 = 15% (not implemented yet)
  // if (data.signals >= 10) {
  //   rating += 15
  // }

  // Referrals >= 3 = 20% (permanent)
  if (data.referrals >= 3) {
    rating += 20
  }

  // Pool amount >= 5000 = 10%, <5000 = 3%
  if (data.poolAmount >= 5000) {
    rating += 10
  } else {
    rating += 3
  }

  // Messages > 30 = 10%
  if (data.messages > 30) {
    rating += 10
  }

  return Math.min(rating, 100)
}

export const getRatingColor = (rating: number): string => {
  if (rating >= 1 && rating <= 10) return '#ef4444' // red
  if (rating >= 11 && rating <= 30) return '#f97316' // orange
  if (rating >= 31 && rating <= 59) return '#eab308' // yellow
  if (rating >= 60 && rating <= 80) return '#3b82f6' // blue
  if (rating >= 81 && rating <= 100) return '#10b981' // green
  return '#6b7280' // gray
}

