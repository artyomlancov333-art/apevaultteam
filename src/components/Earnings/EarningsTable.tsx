// Earnings statistics table
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { updateEarnings, deleteEarnings } from '@/services/firestoreService'
import { formatDate, getWeekRange } from '@/utils/dateUtils'
import { Earnings } from '@/types'
import { TEAM_MEMBERS } from '@/types'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface EarningsTableProps {
  earnings: Earnings[]
  onUpdate: () => void
}

export const EarningsTable = ({ earnings, onUpdate }: EarningsTableProps) => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { isAdmin } = useAdminStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editPoolAmount, setEditPoolAmount] = useState('')

  const weekRange = getWeekRange()
  const weekStart = formatDate(weekRange.start, 'yyyy-MM-dd')
  const weekEnd = formatDate(weekRange.end, 'yyyy-MM-dd')

  const monthStart = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
  const monthEnd = formatDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd')

  // Calculate statistics
  const getStats = (userId: string, startDate: string, endDate: string) => {
    const userEarnings = earnings.filter(
      (e) => e.userId === userId && e.date >= startDate && e.date <= endDate
    )

    const totalEarnings = userEarnings.reduce((sum, e) => sum + e.amount, 0)
    const totalPool = userEarnings.reduce((sum, e) => sum + e.poolAmount, 0)

    return { totalEarnings, totalPool, count: userEarnings.length }
  }

  const handleEdit = (earning: Earnings) => {
    setEditingId(earning.id)
    setEditAmount(earning.amount.toString())
    setEditPoolAmount(earning.poolAmount.toString())
  }

  const handleSaveEdit = async (id: string) => {
    if (!user) return

    const originalEarning = earnings.find((e) => e.id === id)
    if (!originalEarning) return

    const newAmount = parseFloat(editAmount)
    const newPoolAmount = parseFloat(editPoolAmount)

    // Check edit range (500 rubles, unless admin)
    if (!isAdmin) {
      const amountDiff = Math.abs(newAmount - originalEarning.amount)
      const poolDiff = Math.abs(newPoolAmount - originalEarning.poolAmount)

      if (amountDiff > 500 || poolDiff > 500) {
        alert('Можно изменить заработок только в диапазоне 500 рублей. Для больших изменений обратитесь к администратору.')
        return
      }
    }

    try {
      await updateEarnings(id, {
        amount: newAmount,
        poolAmount: newPoolAmount,
      })
      setEditingId(null)
      onUpdate()
    } catch (error) {
      alert('Ошибка при обновлении')
    }
  }

  const handleDelete = async (id: string) => {
    if (!isAdmin && user?.id !== earnings.find((e) => e.id === id)?.userId) {
      alert('Только администратор может удалять чужие записи')
      return
    }

    if (confirm('Удалить запись о заработке?')) {
      try {
        await deleteEarnings(id)
        onUpdate()
      } catch (error) {
        alert('Ошибка при удалении')
      }
    }
  }

  // Calculate team totals
  const teamWeekEarnings = TEAM_MEMBERS.reduce((sum, member) => {
    const stats = getStats(member.id, weekStart, weekEnd)
    return sum + stats.totalEarnings
  }, 0)

  const teamWeekPool = TEAM_MEMBERS.reduce((sum, member) => {
    const stats = getStats(member.id, weekStart, weekEnd)
    return sum + stats.totalPool
  }, 0)

  const teamMonthEarnings = TEAM_MEMBERS.reduce((sum, member) => {
    const stats = getStats(member.id, monthStart, monthEnd)
    return sum + stats.totalEarnings
  }, 0)

  const teamMonthPool = TEAM_MEMBERS.reduce((sum, member) => {
    const stats = getStats(member.id, monthStart, monthEnd)
    return sum + stats.totalPool
  }, 0)

  return (
    <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-hidden`}>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Статистика заработка</h3>

        {/* Weekly stats */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">За неделю</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Участник</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-white">Заработок</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-white">Пул</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map((member) => {
                  const stats = getStats(member.id, weekStart, weekEnd)
                  return (
                    <tr key={member.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="px-4 py-3 text-white">{member.name}</td>
                      <td className="px-4 py-3 text-right text-white">{stats.totalEarnings.toFixed(2)} ₽</td>
                      <td className="px-4 py-3 text-right text-white">{stats.totalPool.toFixed(2)} ₽</td>
                    </tr>
                  )
                })}
                <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} font-bold`}>
                  <td className="px-4 py-3 text-white">Итого команды</td>
                  <td className="px-4 py-3 text-right text-white">{teamWeekEarnings.toFixed(2)} ₽</td>
                  <td className="px-4 py-3 text-right text-white">{teamWeekPool.toFixed(2)} ₽</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly stats */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">За месяц</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Участник</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-white">Заработок</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-white">Пул</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map((member) => {
                  const stats = getStats(member.id, monthStart, monthEnd)
                  return (
                    <tr key={member.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="px-4 py-3 text-white">{member.name}</td>
                      <td className="px-4 py-3 text-right text-white">{stats.totalEarnings.toFixed(2)} ₽</td>
                      <td className="px-4 py-3 text-right text-white">{stats.totalPool.toFixed(2)} ₽</td>
                    </tr>
                  )
                })}
                <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} font-bold`}>
                  <td className="px-4 py-3 text-white">Итого команды</td>
                  <td className="px-4 py-3 text-right text-white">{teamMonthEarnings.toFixed(2)} ₽</td>
                  <td className="px-4 py-3 text-right text-white">{teamMonthPool.toFixed(2)} ₽</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

