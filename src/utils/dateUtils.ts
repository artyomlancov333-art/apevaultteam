// Date utility functions
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay, isBefore, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'

export const formatDate = (date: Date | string, formatStr: string = 'dd.MM.yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: ru })
}

export const getWeekRange = (date: Date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return { start, end }
}

export const getWeekDays = (date: Date = new Date()): Date[] => {
  const { start, end } = getWeekRange(date)
  return eachDayOfInterval({ start, end })
}

export const isSameDate = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  return isSameDay(d1, d2)
}

export const canSetSickLeave = (date: Date | string): boolean => {
  const today = new Date()
  const targetDate = typeof date === 'string' ? parseISO(date) : date
  const maxDate = addDays(today, 2)
  return !isAfter(targetDate, maxDate) && !isBefore(targetDate, today)
}

export const calculateHours = (slots: { start: string; end: string }[]): number => {
  return slots.reduce((total, slot) => {
    const [startHour, startMin] = slot.start.split(':').map(Number)
    const [endHour, endMin] = slot.end.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const diff = (endMinutes - startMinutes) / 60
    return total + diff
  }, 0)
}

export const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const timeOverlaps = (
  slot1: { start: string; end: string },
  slot2: { start: string; end: string }
): boolean => {
  const s1 = parseTime(slot1.start)
  const e1 = parseTime(slot1.end)
  const s2 = parseTime(slot2.start)
  const e2 = parseTime(slot2.end)
  return (s1 < e2 && e1 > s2)
}

export const getMoscowTime = (): Date => {
  const now = new Date()
  const moscowOffset = 3 * 60 // UTC+3
  const localOffset = now.getTimezoneOffset()
  const moscowTime = new Date(now.getTime() + (moscowOffset + localOffset) * 60 * 1000)
  return moscowTime
}

export const canAddEarnings = (slotEndTime: string, currentTime: Date = getMoscowTime()): boolean => {
  const currentHour = currentTime.getHours()
  const slotEndDate = new Date(`${format(currentTime, 'yyyy-MM-dd')}T${slotEndTime}:00`)
  return currentHour >= 21 || currentTime > slotEndDate
}

