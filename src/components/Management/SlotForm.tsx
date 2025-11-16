// Form for adding/editing work slots
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { addWorkSlot, updateWorkSlot, getWorkSlots } from '@/services/firestoreService'
import { calculateHours, timeOverlaps, formatDate } from '@/utils/dateUtils'
import { X, Plus, Trash2 } from 'lucide-react'
import { WorkSlot, TimeSlot } from '@/types'

interface SlotFormProps {
  slot?: WorkSlot | null
  onClose: () => void
  onSave: () => void
}

export const SlotForm = ({ slot, onClose, onSave }: SlotFormProps) => {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const [date, setDate] = useState(slot?.date || formatDate(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState<TimeSlot[]>(slot?.slots || [])
  const [currentStart, setCurrentStart] = useState('')
  const [currentEnd, setCurrentEnd] = useState('')
  const [comment, setComment] = useState(slot?.comment || '')
  const [repeatMonth, setRepeatMonth] = useState(false)
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [repeatAllDays, setRepeatAllDays] = useState(false)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  useEffect(() => {
    if (repeatMonth && date) {
      const dateObj = new Date(date)
      const dayOfWeek = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1
      setRepeatDays([dayOfWeek])
    }
  }, [repeatMonth, date])

  const addTimeSlot = () => {
    if (!currentStart || !currentEnd) {
      setError('Заполните время начала и окончания')
      return
    }

    if (currentStart >= currentEnd) {
      setError('Время окончания должно быть позже времени начала')
      return
    }

    setSlots([...slots, { start: currentStart, end: currentEnd }])
    setCurrentStart('')
    setCurrentEnd('')
    setError('')
  }

  const removeTimeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const handleDayToggle = (dayIndex: number) => {
    if (repeatDays.includes(dayIndex)) {
      setRepeatDays(repeatDays.filter((d) => d !== dayIndex))
    } else {
      setRepeatDays([...repeatDays, dayIndex])
    }
  }

  const handleSelectedDaysToggle = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex))
    } else {
      setSelectedDays([...selectedDays, dayIndex])
    }
  }

  const validateSlot = async (slotDate: string, timeSlots: TimeSlot[]): Promise<string | null> => {
    // Check minimum 5 hours
    const totalHours = calculateHours(timeSlots)
    if (totalHours < 5) {
      return 'Смена должна быть минимум 5 часов'
    }

    // Check max 3 people per slot
    const existingSlots = await getWorkSlots(undefined, slotDate)
    for (const timeSlot of timeSlots) {
      for (const existingSlot of existingSlots) {
        if (existingSlot.id === slot?.id) continue
        if (timeOverlaps(timeSlot, existingSlot.slots[0])) {
          const overlappingCount = existingSlot.participants.length
          if (overlappingCount >= 3) {
            return `Слот ${timeSlot.start}-${timeSlot.end} уже занят максимальным количеством участников (3)`
          }
        }
      }
    }

    return null
  }

  const handleSave = async () => {
    if (!user) return

    setError('')
    setLoading(true)

    try {
      if (repeatMonth && repeatDays.length > 0) {
        // Repeat for month ahead on specific days
        const dateObj = new Date(date)
        const month = dateObj.getMonth()
        const year = dateObj.getFullYear()
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        for (let day = 1; day <= daysInMonth; day++) {
          const checkDate = new Date(year, month, day)
          const dayOfWeek = checkDate.getDay() === 0 ? 6 : checkDate.getDay() - 1
          if (repeatDays.includes(dayOfWeek)) {
            const dateStr = formatDate(checkDate, 'yyyy-MM-dd')
            const validationError = await validateSlot(dateStr, slots)
            if (validationError) {
              setError(validationError)
              setLoading(false)
              return
            }

            const slotData: Omit<WorkSlot, 'id'> = {
              userId: user.id,
              date: dateStr,
              slots,
              comment: comment || undefined,
              participants: [user.id],
            }

            if (slot) {
              await updateWorkSlot(slot.id, slotData)
            } else {
              await addWorkSlot(slotData)
            }
          }
        }
      } else if (repeatAllDays && selectedDays.length > 0 && slots.length > 0) {
        // Repeat for selected days
        const dateObj = new Date(date)
        const month = dateObj.getMonth()
        const year = dateObj.getFullYear()
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        for (let day = 1; day <= daysInMonth; day++) {
          const checkDate = new Date(year, month, day)
          const dayOfWeek = checkDate.getDay() === 0 ? 6 : checkDate.getDay() - 1
          if (selectedDays.includes(dayOfWeek)) {
            const dateStr = formatDate(checkDate, 'yyyy-MM-dd')
            const validationError = await validateSlot(dateStr, slots)
            if (validationError) {
              setError(validationError)
              setLoading(false)
              return
            }

            const slotData: Omit<WorkSlot, 'id'> = {
              userId: user.id,
              date: dateStr,
              slots,
              comment: comment || undefined,
              participants: [user.id],
            }

            await addWorkSlot(slotData)
          }
        }
      } else {
        // Single date
        const validationError = await validateSlot(date, slots)
        if (validationError) {
          setError(validationError)
          setLoading(false)
          return
        }

        const slotData: Omit<WorkSlot, 'id'> = {
          userId: user.id,
          date,
          slots,
          comment: comment || undefined,
          participants: slot?.participants || [user.id],
        }

        if (slot) {
          await updateWorkSlot(slot.id, slotData)
        } else {
          await addWorkSlot(slotData)
        }
      }

      onSave()
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {slot ? 'Редактировать слот' : 'Добавить слот'}
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
                Дата
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

            {/* Time slots */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Временные слоты
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="time"
                  value={currentStart}
                  onChange={(e) => setCurrentStart(e.target.value)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Начало"
                />
                <input
                  type="time"
                  value={currentEnd}
                  onChange={(e) => setCurrentEnd(e.target.value)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Окончание"
                />
                <button
                  onClick={addTimeSlot}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </button>
              </div>

              {/* Added slots */}
              <div className="space-y-2">
                {slots.map((s, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <span className="text-white">
                      {s.start} - {s.end}
                    </span>
                    <button
                      onClick={() => removeTimeSlot(index)}
                      className="p-1 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {slots.length > 0 && (
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Всего часов: {calculateHours(slots).toFixed(1)}
                </p>
              )}
            </div>

            {/* Repeat options */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={repeatMonth}
                  onChange={(e) => {
                    if (e.target.checked && repeatAllDays) {
                      setError('Снимите галочку с другой функции')
                      return
                    }
                    setRepeatMonth(e.target.checked)
                    setError('')
                  }}
                  className="w-4 h-4"
                />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Добавить аналогичные слоты на месяц вперед
                </span>
              </label>

              {repeatMonth && (
                <div className="ml-6">
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Выберите день недели:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {weekDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handleDayToggle(index)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          repeatDays.includes(index)
                            ? 'bg-green-500 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={repeatAllDays}
                  onChange={(e) => {
                    if (e.target.checked && repeatMonth) {
                      setError('Снимите галочку с другой функции')
                      return
                    }
                    setRepeatAllDays(e.target.checked)
                    setError('')
                  }}
                  className="w-4 h-4"
                />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Установить время работы на все выбранные дни
                </span>
              </label>

              {repeatAllDays && (
                <div className="ml-6">
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Выберите дни недели:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {weekDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectedDaysToggle(index)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          selectedDays.includes(index)
                            ? 'bg-green-500 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                disabled={loading || slots.length === 0}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
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

