// Rating card component
import { useThemeStore } from '@/store/themeStore'
import { getRatingColor } from '@/utils/ratingUtils'
import { RatingData } from '@/types'
import { TEAM_MEMBERS } from '@/types'

interface RatingCardProps {
  rating: RatingData
}

export const RatingCard = ({ rating }: RatingCardProps) => {
  const { theme } = useThemeStore()
  const member = TEAM_MEMBERS.find((m) => m.id === rating.userId)
  const color = getRatingColor(rating.rating)

  return (
    <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{member?.name || 'Неизвестно'}</h3>
        
        {/* Rating progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Рейтинг</span>
            <span className="text-sm font-semibold text-white">{rating.rating.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
            <div
              className="h-full transition-all duration-300 flex items-center justify-center"
              style={{
                width: `${Math.min(rating.rating, 100)}%`,
                backgroundColor: color,
              }}
            >
              {rating.rating >= 10 && (
                <span className="text-white text-xs font-semibold">
                  {rating.rating.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Заработок:</span>
          <span className="text-white font-medium">{rating.earnings.toFixed(2)} ₽</span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Сообщений:</span>
          <span className="text-white font-medium">{rating.messages}</span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Инициатив:</span>
          <span className="text-white font-medium">{rating.initiatives}</span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Сигналов:</span>
          <span className="text-white font-medium">{rating.signals}</span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Прибыльных:</span>
          <span className="text-white font-medium">{rating.profitableSignals}</span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Приглашено:</span>
          <span className="text-white font-medium">{rating.referrals}</span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Выходных:</span>
          <span className="text-white font-medium">{rating.daysOff}</span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Больничных:</span>
          <span className="text-white font-medium">{rating.sickDays}</span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Отпусков:</span>
          <span className="text-white font-medium">{rating.vacationDays}</span>
        </div>
        <div className="flex justify-between">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>В пул:</span>
          <span className="text-white font-medium">{rating.poolAmount.toFixed(2)} ₽</span>
        </div>
      </div>
    </div>
  )
}

