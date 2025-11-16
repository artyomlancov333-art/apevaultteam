// Form for adding earnings
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { useThemeStore } from '@/store/themeStore'
import { addEarnings, getWorkSlots } from '@/services/firestoreService'
import { formatDate, getMoscowTime, canAddEarnings } from '@/utils/dateUtils'
import { TEAM_MEMBERS } from '@/types'
import { X } from 'lucide-react'

interface EarningsFormProps {
  onClose: () => void
  onSave: () => void
}

export const EarningsForm = ({ onClose, onSave }: EarningsFormProps) => {
  const { user } = useAuthStore()
  const { isAdmin } = useAdminStore()
  const { theme } = useThemeStore()
  const [date, setDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'))
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [amount, setAmount] = useState('')
  const [poolAmount, setPoolAmount] = useState('')
  const [multipleParticipants, setMultipleParticipants] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSlots()
  }, [date, user])

  const loadSlots = async () => {
    if (!user) return

    try {
      const slots = await getWorkSlots(user.id, date)
      const moscowTime = getMoscowTime()
      const currentDate = formatDate(moscowTime, 'yyyy-MM-dd')

      // Filter slots that are finished or after 21:00
      const validSlots = slots.filter((slot) => {
        if (date !== currentDate) {
          // Can only add earnings for today (unless admin)
          return isAdmin
        }

        // Check if slot is finished or it's after 21:00
        const lastSlot = slot.slots[slot.slots.length - 1]
        return canAddEarnings(lastSlot.end, moscowTime) || isAdmin
      })

      setAvailableSlots(validSlots)
    } catch (error) {
      console.error('Error loading slots:', error)
    }
  }

  const handleParticipantToggle = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== userId))
    } else {
      setSelectedParticipants([...selectedParticipants, userId])
    }
  }

  const handleSave = async () => {
    if (!user) return

    setError('')
    setLoading(true)

    try {
      // Validation
      if (!selectedSlotId) {
        setError('Выберите слот')
        setLoading(false)
        return
      }

      if (!amount || !poolAmount) {
        setError('Заполните все поля')
        setLoading(false)
        return
      }

      const amountNum = parseFloat(amount)
      const poolNum = parseFloat(poolAmount)

      if (isNaN(amountNum) || isNaN(poolNum) || amountNum < 0 || poolNum < 0) {
        setError('Введите корректные суммы')
        setLoading(false)
        return
      }

      // Check if slot exists for this date
      const slot = availableSlots.find((s) => s.id === selectedSlotId)
      if (!slot) {
        setError('Выбранный слот не найден')
        setLoading(false)
        return
      }

      // Check time restrictions (unless admin)
      if (!isAdmin) {
        const moscowTime = getMoscowTime()
        const currentDate = formatDate(moscowTime, 'yyyy-MM-dd')
        if (date !== currentDate) {
          setError('Можно добавить заработок только за сегодня')
          setLoading(false)
          return
        }

        const lastSlot = slot.slots[slot.slots.length - 1]
        if (!canAddEarnings(lastSlot.end, moscowTime)) {
          setError('Слот еще идет или еще не начат. Можно добавить заработок после 21:00 МСК или после окончания слота')
          setLoading(false)
          return
        }
      }

      // Create earnings for selected participants
      const participants = multipleParticipants && selectedParticipants.length > 0
        ? [...selectedParticipants, user.id]
        : [user.id]

      for (const participantId of participants) {
        await addEarnings({
          userId: participantId,
          date,
          amount: amountNum,
          poolAmount: poolNum,
          slotId: selectedSlotId,
          participants: multipleParticipants ? participants : [participantId],
        })
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
      <div className={`w-full max-w-md rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Добавить заработок</h3>
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
                disabled={!isAdmin}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50`}
              />
            </div>

            {/* Slot selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Слот
              </label>
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                <option value="">Выберите слот</option>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.slots.map((s: any) => `${s.start}-${s.end}`).join(', ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Сумма заработка (руб.)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
                placeholder="0"
                min="0"
                step="100"
              />
            </div>

            {/* Pool amount */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Сумма в пул (руб.)
              </label>
              <input
                type="number"
                value={poolAmount}
                onChange={(e) => setPoolAmount(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
                placeholder="0"
                min="0"
                step="100"
              />
            </div>

            {/* Multiple participants */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={multipleParticipants}
                onChange={(e) => setMultipleParticipants(e.target.checked)}
                className="w-4 h-4"
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Отметить несколько участников
              </span>
            </label>

            {multipleParticipants && (
              <div className="ml-6 space-y-2">
                {TEAM_MEMBERS.filter((u) => u.id !== user?.id).map((member) => (
                  <label key={member.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(member.id)}
                      onChange={() => handleParticipantToggle(member.id)}
                      className="w-4 h-4"
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {member.name}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500 text-white rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
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

