// Week view for management
import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { getWorkSlots, getDayStatuses, deleteWorkSlot, deleteDayStatus } from '@/services/firestoreService'
import { formatDate, getWeekDays } from '@/utils/dateUtils'
import { WorkSlot, DayStatus } from '@/types'
import { TEAM_MEMBERS } from '@/types'
import { Edit, Trash2, Info } from 'lucide-react'

interface ManagementWeekViewProps {
  selectedUserId: string | null
  onEditSlot: (slot: WorkSlot) => void
  onEditStatus: (status: DayStatus) => void
}

export const ManagementWeekView = ({ selectedUserId, onEditSlot, onEditStatus }: ManagementWeekViewProps) => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { isAdmin } = useAdminStore()
  const [slots, setSlots] = useState<WorkSlot[]>([])
  const [statuses, setStatuses] = useState<DayStatus[]>([])
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const weekDays = getWeekDays(selectedWeek)
  const displayUsers = selectedUserId ? TEAM_MEMBERS.filter((u) => u.id === selectedUserId) : TEAM_MEMBERS

  useEffect(() => {
    loadData()
  }, [selectedUserId, selectedWeek])

  const loadData = async () => {
    setLoading(true)
    try {
      const weekStart = formatDate(weekDays[0], 'yyyy-MM-dd')
      const weekEnd = formatDate(weekDays[6], 'yyyy-MM-dd')

      const allSlots: WorkSlot[] = []
      const allStatuses: DayStatus[] = []

      for (const user of displayUsers) {
        const userSlots = await getWorkSlots(user.id)
        const userStatuses = await getDayStatuses(user.id)

        allSlots.push(...userSlots.filter((s) => s.date >= weekStart && s.date <= weekEnd))
        allStatuses.push(...userStatuses.filter((s) => s.date >= weekStart && s.date <= weekEnd))
      }

      setSlots(allSlots)
      setStatuses(allStatuses)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!isAdmin && user?.id !== slots.find((s) => s.id === id)?.userId) {
      alert('Только администратор может удалять чужие слоты')
      return
    }

    if (confirm('Удалить слот?')) {
      await deleteWorkSlot(id)
      loadData()
    }
  }

  const handleDeleteStatus = async (id: string) => {
    if (!isAdmin && user?.id !== statuses.find((s) => s.id === id)?.userId) {
      alert('Только администратор может удалять чужие статусы')
      return
    }

    if (confirm('Удалить статус?')) {
      await deleteDayStatus(id)
      loadData()
    }
  }

  const getSlotsForDay = (date: string): WorkSlot[] => {
    return slots.filter((s) => s.date === date)
  }

  const getStatusesForDay = (date: string): DayStatus[] => {
    return statuses.filter((s) => s.date === date)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setSelectedWeek(newDate)
  }

  if (loading) {
    return (
      <div className={`rounded-lg p-8 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Загрузка...</p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-hidden`}>
      {/* Week navigation */}
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <button
          onClick={() => navigateWeek('prev')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          ← Предыдущая неделя
        </button>
        <span className="text-white font-semibold">
          {formatDate(weekDays[0], 'dd.MM.yyyy')} - {formatDate(weekDays[6], 'dd.MM.yyyy')}
        </span>
        <button
          onClick={() => navigateWeek('next')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Следующая неделя →
        </button>
      </div>

      {/* Week grid */}
      <div className="p-4 space-y-4">
        {weekDays.map((day) => {
          const dateStr = formatDate(day, 'yyyy-MM-dd')
          const daySlots = getSlotsForDay(dateStr)
          const dayStatuses = getStatusesForDay(dateStr)

          return (
            <div
              key={dateStr}
              className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <h3 className="text-lg font-semibold text-white mb-3">
                {formatDate(day, 'dd.MM.yyyy')}
              </h3>

              <div className="space-y-2">
                {/* Statuses */}
                {dayStatuses.map((status) => {
                  const statusUser = TEAM_MEMBERS.find((u) => u.id === status.userId)
                  return (
                    <div
                      key={status.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        status.type === 'dayoff'
                          ? 'bg-yellow-500'
                          : status.type === 'sick'
                          ? 'bg-purple-500'
                          : 'bg-orange-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{statusUser?.name}</span>
                        <span className="text-white text-sm">
                          {status.type === 'dayoff' ? 'Выходной' : status.type === 'sick' ? 'Больничный' : 'Отпуск'}
                        </span>
                        {status.comment && (
                          <div className="relative group">
                            <Info className="w-4 h-4 text-white cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                              {status.comment}
                            </div>
                          </div>
                        )}
                      </div>
                      {(isAdmin || user?.id === status.userId) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEditStatus(status)}
                            className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteStatus(status.id)}
                            className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Slots */}
                {daySlots.map((slot) => {
                  const slotUser = TEAM_MEMBERS.find((u) => u.id === slot.userId)
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 bg-green-500 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{slotUser?.name}</span>
                        <span className="text-white text-sm">
                          {slot.slots.map((s) => `${s.start}-${s.end}`).join(', ')}
                        </span>
                        {slot.comment && (
                          <div className="relative group">
                            <Info className="w-4 h-4 text-white cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                              {slot.comment}
                            </div>
                          </div>
                        )}
                      </div>
                      {(isAdmin || user?.id === slot.userId) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEditSlot(slot)}
                            className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {daySlots.length === 0 && dayStatuses.length === 0 && (
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Нет данных
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

