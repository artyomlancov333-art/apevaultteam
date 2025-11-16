// Form for adding/editing day statuses (dayoff, sick, vacation)
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { addDayStatus, updateDayStatus, getDayStatuses } from '@/services/firestoreService'
import { formatDate, isSameDate } from '@/utils/dateUtils'
import { X } from 'lucide-react'
import { DayStatus } from '@/types'

interface DayStatusFormProps {
  type: 'dayoff' | 'sick' | 'vacation'
  status?: DayStatus | null
  onClose: () => void
  onSave: () => void
}

export const DayStatusForm = ({ type, status, onClose, onSave }: DayStatusFormProps) => {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const [date, setDate] = useState(
    status?.date || formatDate(new Date(), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState(
    status?.endDate || formatDate(new Date(), 'yyyy-MM-dd')
  )
  const [isMultiDay, setIsMultiDay] = useState(!!status?.endDate)
  const [comment, setComment] = useState(status?.comment || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isMultiDay) {
      setEndDate(date)
    }
  }, [isMultiDay, date])

  const validate = async (): Promise<string | null> => {
    if (!user) return 'Пользователь не найден'

    const today = new Date()
    const selectedDate = new Date(date)
    const selectedEndDate = new Date(endDate)

    // Check if date is in the past for dayoff
    if (type === 'dayoff') {
      if (isSameDate(selectedDate, today)) {
        return 'Нельзя установить выходной на сегодня. Выберите смену или возьмите больничный.'
      }
    }

    // Check sick leave restrictions
    if (type === 'sick') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const maxDate = new Date(today)
      maxDate.setDate(maxDate.getDate() + 2)
      const selectedDateObj = new Date(date)
      selectedDateObj.setHours(0, 0, 0, 0)
      
      if (selectedDateObj < today || selectedDateObj > maxDate) {
        return 'Больничный можно взять только на актуальную дату и + 2 суток. Нельзя выбрать заранее.'
      }

      const daysDiff = Math.ceil(
        (selectedEndDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1

      if (daysDiff < 1) {
        return 'Больничный должен быть минимум на 1 день'
      }

      if (daysDiff > 14) {
        return 'Больничный может длиться не более 14 календарных дней в месяце'
      }

      // Check existing sick days in month
      const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      const existingStatuses = await getDayStatuses(user.id)
      const monthSickDays = existingStatuses.filter(
        (s) => s.type === 'sick' && s.date >= formatDate(monthStart, 'yyyy-MM-dd') && s.date <= formatDate(monthEnd, 'yyyy-MM-dd')
      )

      if (monthSickDays.length + daysDiff > 14) {
        return 'Больничный ограничен 14 днями в месяц'
      }
    }

    // Check vacation restrictions
    if (type === 'vacation') {
      const daysDiff = Math.ceil(
        (selectedEndDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1

      if (daysDiff > 14) {
        return 'Отпуск не может быть больше 14 дней в месяце'
      }

      // Check yearly vacation limit (6 per year)
      const yearStart = new Date(selectedDate.getFullYear(), 0, 1)
      const yearEnd = new Date(selectedDate.getFullYear(), 11, 31)
      const existingStatuses = await getDayStatuses(user.id)
      const yearVacations = existingStatuses.filter(
        (s) => s.type === 'vacation' && s.date >= formatDate(yearStart, 'yyyy-MM-dd') && s.date <= formatDate(yearEnd, 'yyyy-MM-dd')
      )

      if (yearVacations.length >= 6) {
        return 'Не более 6 отпусков в год'
      }
    }

    // Check dayoff limit (max 2 per week)
    if (type === 'dayoff') {
      const weekStart = new Date(selectedDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const existingStatuses = await getDayStatuses(user.id)
      const weekDayoffs = existingStatuses.filter(
        (s) => s.type === 'dayoff' && s.date >= formatDate(weekStart, 'yyyy-MM-dd') && s.date <= formatDate(weekEnd, 'yyyy-MM-dd')
      )

      if (weekDayoffs.length >= 2) {
        return 'Выходные на неделе ограничены максимум 2 днями'
      }
    }

    return null
  }

  const handleSave = async () => {
    if (!user) return

    setError('')
    setLoading(true)

    try {
      const validationError = await validate()
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }

      const statusData: Omit<DayStatus, 'id'> = {
        userId: user.id,
        date,
        type,
        comment: comment || undefined,
        endDate: isMultiDay ? endDate : undefined,
      }

      if (status) {
        await updateDayStatus(status.id, statusData)
      } else {
        await addDayStatus(statusData)
      }

      onSave()
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  const typeLabels = {
    dayoff: 'Выходной',
    sick: 'Больничный',
    vacation: 'Отпуск',
  }

  const typeColors = {
    dayoff: 'bg-yellow-500',
    sick: 'bg-purple-500',
    vacation: 'bg-orange-500',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {status ? 'Редактировать' : 'Добавить'} {typeLabels[type]}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Дата начала
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>

            {/* Multi-day toggle */}
            {(type === 'sick' || type === 'vacation') && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isMultiDay}
                  onChange={(e) => setIsMultiDay(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Несколько дней
                </span>
              </label>
            )}

            {/* End date */}
            {isMultiDay && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Дата окончания
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={date}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
            )}

            {/* Comment */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Комментарий
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
                placeholder="Добавьте комментарий (необязательно)"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500 text-white rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex-1 px-4 py-2 ${typeColors[type]} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors`}
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

