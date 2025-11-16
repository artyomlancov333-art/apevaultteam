// Earnings page
import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { EarningsForm } from '@/components/Earnings/EarningsForm'
import { EarningsTable } from '@/components/Earnings/EarningsTable'
import { getEarnings, getWorkSlots } from '@/services/firestoreService'
import { formatDate, getWeekRange, getMoscowTime } from '@/utils/dateUtils'
import { Earnings as EarningsType } from '@/types'
import { Plus } from 'lucide-react'

export const Earnings = () => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { isAdmin } = useAdminStore()
  const [showForm, setShowForm] = useState(false)
  const [earnings, setEarnings] = useState<EarningsType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEarnings()
  }, [])

  const loadEarnings = async () => {
    setLoading(true)
    try {
      const allEarnings = await getEarnings()
      setEarnings(allEarnings)
    } catch (error) {
      console.error('Error loading earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Заработок</h2>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить заработок
            </button>
          </div>
        </div>

        {/* Earnings table */}
        {loading ? (
          <div className={`rounded-lg p-8 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Загрузка...</p>
          </div>
        ) : (
          <EarningsTable earnings={earnings} onUpdate={loadEarnings} />
        )}

        {/* Form */}
        {showForm && (
          <EarningsForm
            onClose={() => setShowForm(false)}
            onSave={() => {
              setShowForm(false)
              loadEarnings()
            }}
          />
        )}
      </div>
    </Layout>
  )
}

