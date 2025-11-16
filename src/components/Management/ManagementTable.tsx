// Table view for management
import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { getWorkSlots, getDayStatuses, deleteWorkSlot, deleteDayStatus } from '@/services/firestoreService'
import { formatDate, calculateHours, getWeekDays } from '@/utils/dateUtils'
import { WorkSlot, DayStatus } from '@/types'
import { TEAM_MEMBERS } from '@/types'
import { Edit, Trash2, Info } from 'lucide-react'

interface ManagementTableProps {
  selectedUserId: string | null
  onEditSlot: (slot: WorkSlot) => void
  onEditStatus: (status: DayStatus) => void
}

export const ManagementTable = ({ selectedUserId, onEditSlot, onEditStatus }: ManagementTableProps) => {
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

  const getSlotForDay = (userId: string, date: string): WorkSlot | null => {
    return slots.find((s) => s.userId === userId && s.date === date) || null
  }

  const getStatusForDay = (userId: string, date: string): DayStatus | null => {
    return statuses.find((s) => s.userId === userId && s.date === date) || null
  }

  const getUserStats = (userId: string) => {
    const userSlots = slots.filter((s) => s.userId === userId)
    const totalHours = userSlots.reduce((sum, slot) => sum + calculateHours(slot.slots), 0)

    const userStatuses = statuses.filter((s) => s.userId === userId)
    const daysOff = userStatuses.filter((s) => s.type === 'dayoff').length
    const sickDays = userStatuses.filter((s) => s.type === 'sick').length
    const vacationDays = userStatuses.filter((s) => s.type === 'vacation').length

    return { totalHours, daysOff, sickDays, vacationDays }
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">Участник</th>
              {weekDays.map((day) => (
                <th key={day.toISOString()} className="px-4 py-3 text-center text-sm font-semibold text-white">
                  {formatDate(day, 'dd.MM')}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-semibold text-white">Статистика</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((user) => {
              const stats = getUserStats(user.id)
              return (
                <tr key={user.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="px-4 py-3 text-white font-medium">{user.name}</td>
                  {weekDays.map((day) => {
                    const dateStr = formatDate(day, 'yyyy-MM-dd')
                    const slot = getSlotForDay(user.id, dateStr)
                    const status = getStatusForDay(user.id, dateStr)

                    return (
                      <td key={dateStr} className="px-2 py-3 text-center">
                        {slot ? (
                          <div className="space-y-1">
                            <div className="bg-green-500 text-white rounded px-2 py-1 text-xs">
                              {slot.slots.map((s) => `${s.start}-${s.end}`).join(', ')}
                            </div>
                            {slot.comment && (
                              <div className="flex items-center justify-center group relative">
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                  {slot.comment}
                                </div>
                              </div>
                            )}
                            {(isAdmin || user.id === slot.userId) && (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => onEditSlot(slot)}
                                  className="p-1 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="p-1 text-red-500 hover:bg-red-500 hover:text-white rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : status ? (
                          <div className="space-y-1">
                            <div
                              className={`text-white rounded px-2 py-1 text-xs ${
                                status.type === 'dayoff'
                                  ? 'bg-yellow-500'
                                  : status.type === 'sick'
                                  ? 'bg-purple-500'
                                  : 'bg-orange-500'
                              }`}
                            >
                              {status.type === 'dayoff' ? 'Выходной' : status.type === 'sick' ? 'Больничный' : 'Отпуск'}
                            </div>
                            {status.comment && (
                              <div className="flex items-center justify-center group relative">
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                  {status.comment}
                                </div>
                              </div>
                            )}
                            {(isAdmin || user.id === status.userId) && (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => onEditStatus(status)}
                                  className="p-1 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStatus(status.id)}
                                  className="p-1 text-red-500 hover:bg-red-500 hover:text-white rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-sm text-white">
                    <div className="space-y-1">
                      <div>Часов: {stats.totalHours.toFixed(1)}</div>
                      <div>Выходных: {stats.daysOff}</div>
                      <div>Больничных: {stats.sickDays}</div>
                      <div>Отпусков: {stats.vacationDays}</div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

